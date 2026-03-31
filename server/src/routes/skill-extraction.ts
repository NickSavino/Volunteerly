import { Router } from "express";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { extractSkillsFromResumeText } from "../services/groq-service.js";

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

skillExtractionRouter.post("/", upload.single("resume"), async (_req, res, next) => {
    try {
        const file = _req.file;
        if (!file) {
            return res.status(400).json({
                error: "Bad Request",
                message: "A PDF resume file is required.",
            });
        }

        const parsed = await pdfParse(file.buffer);
        const resumeText = parsed.text?.trim();

        if (!resumeText) {
            return res.status(422).json({
                error: "Unprocessable Content",
                message: "Could not extract any text from the uploaded PDF.",
            });
        }

        const skills = await extractSkillsFromResumeText(resumeText);
        res.status(200).json(skills);
    } catch (error) {
        next(error);
    }
});