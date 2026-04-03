import { env } from "../lib/env.js";
import DocumentIntelligence, { getLongRunningPoller, isUnexpected } from "@azure-rest/ai-document-intelligence";
import { EmailClient, EmailMessage } from "@azure/communication-email";

export async function callDocumentAnalysis(file:Express.Multer.File) {
    const endpoint = env.AZURE_DI_ENDPOINT
    const key = env.AZURE_DI_KEY

    const uint8Array = new Uint8Array(file.buffer);

    const client = DocumentIntelligence(endpoint, { key: key });


    const initialResponse = await client
        .path("/documentModels/{modelId}:analyze", "prebuilt-layout")
        .post({
        body: uint8Array,
        contentType: "application/pdf",
        });

    if (isUnexpected(initialResponse)) throw initialResponse.body.error;

    const poller = getLongRunningPoller(client, initialResponse);
    const pollerResult = await poller.pollUntilDone();

    const analyzeResult = (pollerResult as any).body.analyzeResult;
    
    return analyzeResult.paragraphs
}

export async function sendEmail(vltEmail: string, vltName: string, orgEmail: string, orgName: string, subject:string, content: string) {
    if (env.AZURE_ACS_CONNECTION_STRING && env.AZURE_ACS_SENDER_EMAIL){
        var emailClient = new EmailClient(env.AZURE_ACS_CONNECTION_STRING);

        const message = {
        senderAddress: env.AZURE_ACS_SENDER_EMAIL,
        content: {
            subject: subject,
            plainText: content,
        },
        recipients: {
            to: [
            {
                address: vltEmail,
                displayName: vltName,
            },
            ],
            cc: [
                {
                    address: orgEmail,
                    displayName: orgName,
                }
            ]
        },
        };

        const poller = await emailClient.beginSend(message);
        const response = await poller.pollUntilDone();
        return response.status
    }

    return "Email not Sent."
}