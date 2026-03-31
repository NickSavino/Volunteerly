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
    limits: { fileSize: 5 * 1024 * 1024 },
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

        //parse the pdf using pdf parser
        const parsed = await pdfParse(file.buffer);
        const resumeText = parsed.text?.trim();

        if (!resumeText) {
            return res.status(422).json({
                error: "Unprocessable Content",
                message: "Could not extract any text from the uploaded PDF.",
            });
        }

        //make an api call to groq to extract the skills
        const skills = await extractSkillsFromResumeText(resumeText);

        //make an api call to gemini to embed the skills
        const allSkills = [
            ...skills.technical,
            ...skills.soft,
            ...skills.leadership,
        ].join(", ");

        const vector = await embedText(allSkills);

        //save the vector into the db
        const userId = req.auth?.userId;
        if (userId) {
            await prisma.$executeRaw`
                UPDATE volunteers
                SET skill_vector = ${JSON.stringify(vector)}::vector
                WHERE id = ${userId}
            `;
        }

        res.status(200).json(skills);
    } catch (error) {
        next(error);
    }
});
