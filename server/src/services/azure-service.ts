/**
 * azure-service.ts
 * Wrappers for Azure Document Intelligence and Azure Communication Services (email)
 */

import { env } from "../lib/env.js";
import DocumentIntelligence, {
    getLongRunningPoller,
    isUnexpected,
} from "@azure-rest/ai-document-intelligence";
import { EmailClient } from "@azure/communication-email";

/**
 * Submits a PDF to Azure Document Intelligence for layout analysis.
 * Used during organization auto-approval to extract text paragraphs from
 * the submitted verification document.
 * @param file - Multer file object containing the PDF buffer
 * @returns Array of paragraph objects extracted from the document
 */
export async function callDocumentAnalysis(file: Express.Multer.File) {
    const endpoint = env.AZURE_DI_ENDPOINT;
    const key = env.AZURE_DI_KEY;

    // Convert the Node Buffer to a Uint8Array that the Azure SDK expects
    const uint8Array = new Uint8Array(file.buffer);

    const client = DocumentIntelligence(endpoint, { key: key });

    // Start the analysis - Azure DI is asynchronous so we get a poller back
    const initialResponse = await client
        .path("/documentModels/{modelId}:analyze", "prebuilt-layout")
        .post({
            body: uint8Array,
            contentType: "application/pdf",
        });

    if (isUnexpected(initialResponse)) throw initialResponse.body.error;

    // Poll until the analysis job finishes
    const poller = getLongRunningPoller(client, initialResponse);
    const pollerResult = await poller.pollUntilDone();

    const analyzeResult = (pollerResult as any).body.analyzeResult;

    return analyzeResult.paragraphs;
}

/**
 * Sends a transactional email via Azure Communication Services.
 * If the required ACS environment variables aren't configured, it skips sending
 * and returns a fallback string - useful for local dev environments.
 * @param vltEmail - Recipient email address
 * @param subject - Email subject line
 * @param content - Plain text version of the email body
 * @param html - HTML version of the email body
 * @returns The ACS send status string, or "Email not Sent." if ACS is unconfigured
 */
export async function sendEmail(vltEmail: string, subject: string, content: string, html: string) {
    if (env.AZURE_ACS_CONNECTION_STRING && env.AZURE_ACS_SENDER_EMAIL) {
        var emailClient = new EmailClient(env.AZURE_ACS_CONNECTION_STRING);

        const message = {
            senderAddress: env.AZURE_ACS_SENDER_EMAIL,
            content: {
                subject: subject,
                plainText: content,
                html: html,
            },
            recipients: {
                to: [
                    {
                        address: vltEmail,
                    },
                ],
            },
        };

        // ACS sending is also async - poll until we get a final status
        const poller = await emailClient.beginSend(message);
        const response = await poller.pollUntilDone();
        return response.status;
    } else {
        return "Email not Sent.";
    }
}
