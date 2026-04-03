import { env } from "../lib/env.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export type ExtractedSkills = {
    technical: string[];
    nonTechnical: string[];
    hourlyRate: number;
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
            hourlyRate: parsed.hourlyRate ?? []
        };
    } catch {
        throw new Error(`Failed to parse Groq response as JSON: ${content}`);
    }
}


export async function calculateHourlyRate(
    workExperience: string,
    education: string
): Promise<number> {
    const prompt = `
You are a hourly rate guesser in Alberta, Canada. Based on the following work experience and education, calculate a reasonable hourly rate in Canadian dollars (CAD) for this person, consider their base salary rom their work experience and add or subtract slightly based on additional responsibilities or education.

Guideline:
1. given the list of base rates try and find a similar role and base the base rate on that
2. Consider Alberta's cost of living, typical salaries in the province, and the person's experience level. 
3. Return only realistic wages that you have evidence for, and are accuracte with facts on the internet or the provided list
4. Return ONLY a single integer number representing the hourly rate in CAD. No text, no symbols, no explanation, just the number.
5. if you know the yearly salary please divide it by 2080

list of base canadian dollar rates for different professional roles:
  [ role: "Software Developer", rate: 50 ,
  role: "Frontend Developer", rate: 45 ,
  role: "Backend Developer", rate: 52 ,
  role: "Full Stack Developer", rate: 55 ,
  role: "Data Analyst", rate: 37 ,
  role: "Data Scientist", rate: 55 ,
  role: "Machine Learning Engineer", rate: 60 ,
  role: "Cybersecurity Analyst", rate: 48 ,
  role: "DevOps Engineer", rate: 58 ,
  role: "Cloud Engineer", rate: 62 ,
  role: "Technical Project Manager", rate: 48 ,
  role: "Project Manager", rate: 45 ,
  role: "Software Project Manager", rate: 50 ,
  role: "Business Analyst", rate: 46 ,
  role: "Product Manager", rate: 55 ,
  role: "Scrum Master", rate: 50 ,
  role: "Technical Program Manager", rate: 65 ,
  role: "UX/UI Designer", rate: 45 ,
  role: "QA Engineer", rate: 35 ,
  role: "Systems Administrator", rate: 40 ,
  role: "IT Support Specialist", rate: 30 ,
  role: "Database Administrator", rate: 55 ,
  role: "Solutions Architect", rate: 80 ,
  role: "Junior Developer", rate: 30 ,
  role: "Junior Data Analyst", rate: 28 ,
  role: "Project Coordinator", rate: 32 ]

Work Experience:
${workExperience}

Education:
${education}`;


    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 10,
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
    const rate = parseInt(content.trim(), 10);

    if (isNaN(rate)) {
        throw new Error(`Failed to parse hourly rate from Groq response: ${content}`);
    }

    return rate;
}