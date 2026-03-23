import { env } from "../lib/env.js";
import DocumentIntelligence, { getLongRunningPoller, isUnexpected } from "@azure-rest/ai-document-intelligence";



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
    const result = analyzeResult.documents?.[0]
    
    return result.paragraphs
}