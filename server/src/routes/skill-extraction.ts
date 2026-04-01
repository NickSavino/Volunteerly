import { Router } from "express";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { extractSkillsFromResumeText } from "../services/groq-service.js";
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

//take in pdf and parse
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

        //attach work and job experience
        const workExperience = req.body.workExperience ?? "";
        const education = req.body.education ?? "";

        const fullContext = [
            resumeText,
            workExperience ? `Work Experience:\n${workExperience}` : "",
            education ? `Education:\n${education}` : "",
        ].filter(Boolean).join("\n\n");

        //get the top 5 skills from groq
        const skills = await extractSkillsFromResumeText(fullContext);

        res.status(200).json(skills);
    } catch (error) {
        next(error);
    }
});

//confirm which skills the user wants
skillExtractionRouter.post("/confirm", async (req, res, next) => {
    try {
        const userId = req.auth!.userId;

        const { technical, soft, leadership } = req.body as {
            technical: string[];
            soft: string[];
            leadership: string[];
        };

        if (!Array.isArray(technical) || !Array.isArray(soft) || !Array.isArray(leadership)) {
            return res.status(400).json({
                error: "Bad Request",
                message: "technical, soft, and leadership must be arrays of strings.",
            });
        }

        //add skills to the db
        await prisma.volunteerSkillProfile.upsert({
            where: { volId: userId },
            create: {
                volId: userId,
                technical,
                soft,
                leadership,
            },
            update: {
                technical,
                soft,
                leadership,
            },
        });

        //embed all skills as one vector using Gemini
        const allSkills = [...technical, ...soft, ...leadership].join(", ");
        const vector = await embedText(allSkills);

        //save vector embedding
        await prisma.$executeRaw`
            UPDATE volunteers
            SET skill_vector = ${JSON.stringify(vector)}::vector
            WHERE id = ${userId}
        `;

        //mark the vol as verified now
        await prisma.user.update({
            where: { id: userId },
            data: { status: "VERIFIED" },
        });

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
});