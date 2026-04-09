import { env } from "../lib/env.js";

const GEMINI_EMBED_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

export async function embedText(text: string): Promise<number[]> {
    const response = await fetch(`${GEMINI_EMBED_URL}?key=${env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "models/gemini-embedding-001",
            content: {
                parts: [{ text }],
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini embedding error: ${response.status} ${errorText}`);
    }

    const data = (await response.json()) as {
        embedding: { values: number[] };
    };

    return data.embedding.values;
}
