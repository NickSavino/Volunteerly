import { env } from "../lib/env.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export type SkillCategory = "technical" | "soft" | "leadership";

export type ExtractedSkills = {
    technical: string[];
    soft: string[];
    leadership: string[];
};

export async function extractSkillsFromResumeText(resumeText: string): Promise<ExtractedSkills> {
    const prompt = `
${resumeText}`;

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            max_tokens: 512,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as {
        choices: { message: { content: string } }[];
    };

    const content = data.choices[0]?.message?.content ?? "";
    const cleaned = content.replace(/```json|```/g, "").trim();

    try {
        const parsed = JSON.parse(cleaned) as ExtractedSkills;
        return {
            technical: parsed.technical ?? [],
            soft: parsed.soft ?? [],
            leadership: parsed.leadership ?? [],
        };
    } catch {
        throw new Error(`Failed to parse Groq response as JSON: ${content}`);
    }
}