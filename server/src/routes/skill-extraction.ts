import { Router } from "express";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { extractSkillsFromResumeText, calculateHourlyRate } from "../services/groq-service.js";
import { embedText } from "../services/gemini-service.js";
import { prisma } from "../lib/prisma.js";

export const skillExtractionRouter = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (_req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDFs are allowed!"));
        }
        cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
});


skillExtractionRouter.post("/", upload.single("resume"), async (req, res, next) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                error: "Bad Request",
                message: "A PDF resume file is required.",
            });
        }

        //parse the pdf
        const parsed = await pdfParse(file.buffer);
        const resumeText = parsed.text?.trim() ?? "";

        if (!resumeText) {
            return res.status(422).json({
                error: "Unprocessable Content",
                message: "Could not extract any text from the uploaded PDF.",
            });
        }

        //add work experience and education
        const workExperience = req.body.workExperience ?? "";
        const education = req.body.education ?? "";

        const fullContext = [
            resumeText,
            workExperience ? `Work Experience:\n${workExperience}` : "",
            education ? `Education:\n${education}` : "",
        ].filter(Boolean).join("\n\n");

        //make groq call to extract skills
        const skills = await extractSkillsFromResumeText(fullContext);
        const hourlyRate = await calculateHourlyRate(workExperience, education);
        res.status(200).json({ ...skills, hourlyRate });
    } catch (error) {
        next(error);
    }
});


skillExtractionRouter.post("/confirm", async (req, res, next) => {
    try {
        const userId = req.auth!.userId;

        const {
            technical,
            nonTechnical,
            workExperiences,
            educations,
            hourlyRate,
        } = req.body as {
            technical: string[];
            nonTechnical: string[];
            workExperiences: {
                jobTitle: string;
                company: string;
                startDate: Date;
                endDate: Date;
                responsibilities: string;
            }[];
            educations: {
                institution: string;
                degree: string;
                graduationYear: string;
            }[];
            hourlyRate: number;
        };

        if (!Array.isArray(technical) || !Array.isArray(nonTechnical)) {
            return res.status(400).json({
                error: "Bad Request",
                message: "technical and nonTechnical must be arrays of strings.",
            });
        }

        //make skills record
        await prisma.volunteerSkillProfile.upsert({
            where: { volId: userId },
            create: {
                volId: userId,
                technical,
                nonTechnical,
            },
            update: {
                technical,
                nonTechnical,
            },
        });

        //save work experience
        if (Array.isArray(workExperiences) && workExperiences.length > 0) {
            await prisma.volunteerWorkExperience.createMany({
                data: workExperiences.map((w) => ({
                    volId: userId,
                    jobTitle: w.jobTitle,
                    company: w.company,
                    startDate: new Date(w.startDate),
                    endDate: new Date(w.endDate),
                    responsibilities: w.responsibilities,
                })),
            });
        }

        //save education
        if (Array.isArray(educations) && educations.length > 0) {
            await prisma.volunteerEducation.createMany({
                data: educations.map((e) => ({
                    volId: userId,
                    institution: e.institution,
                    degree: e.degree,
                    graduationYear: e.graduationYear,
                })),
            });
        }

        //embed all skills as one vector via Gemini
        const allSkills = [...technical, ...nonTechnical].join(", ");
        const vector = await embedText(allSkills);

        //save vector to volunteer row
        await prisma.$executeRaw`
            UPDATE volunteers
            SET skill_vector = ${JSON.stringify(vector)}::vector
            WHERE id = ${userId}
        `;
        //update the volunteers hourly rate
        await prisma.volunteer.update({
            where: { id: userId },
            data: { hourlyValue: hourlyRate},
        });

        //mark user as VERIFIED
        await prisma.user.update({
            where: { id: userId },
            data: { status: "VERIFIED" },
        });

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
});