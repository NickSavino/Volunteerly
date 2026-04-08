import { Router } from "express";
import { escalateVolunteer, flagVolunteerByModerator, getModeratorVolunteerDetail, getModeratorVolunteerList, suspendVolunteer, warnVolunteer } from "../../services/moderator/moderator-volunteer-service.js";
import { ModeratorVolunteerEscalateInputSchema, ModeratorVolunteerFlagInputSchema, ModeratorVolunteerSuspendInputSchema, ModeratorVolunteerWarnInputSchema } from "@volunteerly/shared";


export const moderatorVolunteersRouter = Router();

moderatorVolunteersRouter.get("/", async (_, res, next) => {
    try {
        
        const volunteers = await getModeratorVolunteerList();

        res.status(200).json(volunteers);
    } catch (error) {
        if ((error as Error)?.message === "VOLUNTEER_NOT_FOUND") {
            return res.status(404).json({ error: "Not Found", message: "Volunteer not found." });
        }
        if ((error as Error)?.message === "VOLUNTEER_ALREADY_SUSPENDED") {
            return res.status(409).json({ error: "Conflict", message: "Volunteer is already suspended." });
        }
        next(error);
    }
});

moderatorVolunteersRouter.get("/:volunteerId", async (req, res, next) => {
    try {
        const volunteer = await getModeratorVolunteerDetail(req.params.volunteerId);
        if (!volunteer) {
            return res.status(404).json({ error: "Not Found", message: "Volunteer not found." });
        }
        res.status(200).json(volunteer);
    } catch (error) {
        next(error);
    }
});

moderatorVolunteersRouter.post("/:volunteerId/flag", async (req, res, next) => {
    try {
        const moderatorId = req.auth?.userId;
        if (!moderatorId) return res.status(401).json({ error: "Unauthorized" });

        const parsed = ModeratorVolunteerFlagInputSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid body", message: parsed.error.issues[0]?.message });
        }

        await flagVolunteerByModerator(req.params.volunteerId, moderatorId, parsed.data);
        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
});

moderatorVolunteersRouter.post("/:volunteerId/warn", async (req, res, next) => {
    try {
        const moderatorId = req.auth?.userId;
        if (!moderatorId) return res.status(401).json({ error: "Unauthorized" });

        const parsed = ModeratorVolunteerWarnInputSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid body", message: parsed.error.issues[0]?.message });
        }

        await warnVolunteer(req.params.volunteerId, moderatorId, parsed.data);
        res.status(200).json({ success: true });
    } catch (error: any) {
        if (error?.message === "VOLUNTEER_NOT_FOUND") {
            return res.status(404).json({ error: "Not Found", message: "Volunteer not found." });
        }
        if (error?.message === "VOLUNTEER_ALREADY_SUSPENDED") {
            return res.status(409).json({ error: "Conflict", message: "Volunteer is already suspended." });
        }
        if (error?.message === "REPORT_NOT_FOUND") {
            return res.status(404).json({ error: "Not Found", message: "Open report not found." });
        }
        next(error);
    }
});

moderatorVolunteersRouter.post("/:volunteerId/suspend", async (req, res, next) => {
    try {
        const moderatorId = req.auth?.userId;
        if (!moderatorId) return res.status(401).json({ error: "Unauthorized" });

        const parsed = ModeratorVolunteerSuspendInputSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid body", message: parsed.error.issues[0]?.message });
        }

        await suspendVolunteer(req.params.volunteerId, moderatorId, parsed.data);
        res.status(200).json({ success: true });
    } catch (error: any) {
        if (error?.message === "REPORT_NOT_FOUND") {
            return res.status(404).json({ error: "Not Found", message: "Open report not found." });
        }
        next(error);
    }
});

moderatorVolunteersRouter.post("/:volunteerId/escalate", async (req, res, next) => {
    try {
        const moderatorId = req.auth?.userId;
        if (!moderatorId) return res.status(401).json({ error: "Unauthorized" });

        const parsed = ModeratorVolunteerEscalateInputSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid body", message: parsed.error.issues[0]?.message });
        }

        await escalateVolunteer(req.params.volunteerId, moderatorId, parsed.data);
        res.status(200).json({ success: true });
    } catch (error: any) {
        if (error?.message === "REPORT_NOT_FOUND") {
            return res.status(404).json({ error: "Not Found", message: "Open report not found." });
        }
        next(error);
    }
});
