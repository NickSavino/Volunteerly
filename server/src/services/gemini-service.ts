/**
 * gemini-service.ts
 * Handles text embedding using the Google Gemini API. Used to generate skill vectors for pgvector similarity search
 */
import { env } from "../lib/env.js";

const GEMINI_EMBED_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

/**
 * Sends text to the Gemini embedding API and returns a 3072-dimensional float array.
 * The resulting vector is stored in the database and used for cosine similarity matching
 * between volunteer skill profiles and opportunity requirements.
 * @param text - the text to embed (typically a comma-separated list of skills)
 * @returns a 3072-element number array representing the semantic embedding of the input
 * @throws if the Gemini API returns a non-OK response
 */
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
