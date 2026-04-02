import { env } from "../lib/env.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export type ExtractedSkills = {
    technical: string[];
    nonTechnical: string[];
};

export async function extractSkillsFromResumeText(resumeText: string): Promise<ExtractedSkills> {
    const prompt = `
You are a professional resume analyst. Carefully read the entire resume text provided and extract the top 10 skills from each of these two categories: technical skills and non-technical skills (which includes skills in the domain of soft skills and leadership skills).

Guidelines:
1. Scan the ENTIRE RESUME before choosing any skills. Consider repeated mentions or mentions of skills in work history or education as higher confidence, and should therefore be ranked higher.
2. For technical skills: list programming languages, frameworks, tools, platforms, and domain-specific technical knowledge in order of most emphasized. Keep them high-level enough to map to job descriptions.
3. For non-technical skills: combine soft skills and leadership skills into one list. Examples include communication, collaboration, adaptability, team management, mentoring, project ownership, strategic thinking, and interpersonal abilities.
4. Return ONLY valid JSON with this exact shape and nothing else:

{
  "technical": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8", "skill9", "skill10"],
  "nonTechnical": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8", "skill9", "skill10"]
}

5. If fewer than 10 skills are found for a category, return as many as you can confidently extract.
6. Do not invent skills not supported by the resume text.
7. Please ensure the skills are returned in the order of most confidence, with the first being the most confident. THis is to ensure we are getting the best top 10 skills.

Resume text:
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
            max_tokens: 1024,
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
            nonTechnical: parsed.nonTechnical ?? [],
        };
    } catch {
        throw new Error(`Failed to parse Groq response as JSON: ${content}`);
    }
}