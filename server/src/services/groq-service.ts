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
You are a professional resume analyst. Carefully read the entire resume text provided and extract the top 5 skills from each of these three categories: technical, soft skills, and leadership.

Guidelines:
1. Scan the ENTIRE RESUME before choosing any skills. Consider repeated mentions or mentions of skills in work history as higher confidence.
2. For technical skills, list the skills in **order of most mentioned or most emphasized in the resume to least**. Include programming languages, frameworks, tools, and other specific skills, but keep them high-level enough to map to job descriptions. Do not group unrelated skills together.
    And ensure you arent choosing skills simply because they appear first in the resume.
3. For soft skills, choose skills that demonstrate communication, collaboration, adaptability, and other interpersonal abilities.
4. For leadership, include skills that demonstrate team management, mentoring, project ownership, or strategic thinking.
5. Return **ONLY valid JSON** with this exact shape and nothing else:

{
  "technical": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "soft": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "leadership": ["skill1", "skill2", "skill3", "skill4", "skill5"]
}

6. If fewer than 5 skills are found for a category, return as many as you can confidently extract.
7. Do not invent skills not supported by the resume text.

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