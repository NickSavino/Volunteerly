import { Router } from "express";
import {
    createCurrentVolunteer,
    getCurrentVolunteer,
    updateCurrentVolunteer,
    getYourOpportunities,
    getVolunteerOrganizations,
    getMonthlyHours,
    browseOpportunities,
} from "../services/volunteer-service.js";

export const currentVolunteerRouter = Router();

currentVolunteerRouter.get("/opportunities/browse", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { search, category, workType, commitmentLevel, maxHours } = req.query;

        const opportunities = await browseOpportunities({
            search: search as string | undefined,
            category: category as string | undefined,
            workType: workType as "IN_PERSON" | "REMOTE" | "HYBRID" | undefined,
            commitmentLevel: commitmentLevel as "FLEXIBLE" | "PART_TIME" | "FULL_TIME" | undefined,
            maxHours: maxHours ? Number(maxHours) : undefined,
        });

        res.status(200).json(opportunities);
    } catch (error) {
        next(error);
    }
});

currentVolunteerRouter.get("/opportunities", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const opportunities = await getYourOpportunities(userId);
        res.status(200).json(opportunities);
    } catch (error) {
        next(error);
    }
});

currentVolunteerRouter.get("/organizations", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const organizations = await getVolunteerOrganizations(userId);
        res.status(200).json(organizations);
    } catch (error) {
        next(error);
    }
});

currentVolunteerRouter.get("/monthly-hours", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const monthlyHours = await getMonthlyHours(userId);
        res.status(200).json(monthlyHours);
    } catch (error) {
        next(error);
    }
});

currentVolunteerRouter.get("/", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized", message: "User context missing." });
        const user = await getCurrentVolunteer(userId);
        if (!user) return res.status(404).json({ error: "Not Found", message: "Volunteer not found." });
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
});

currentVolunteerRouter.put("/", async (req, res, next) => {
    try {
        const userId = req.auth!.userId;
        console.log("got req");
        const { firstName, lastName, location, bio, availability, hourlyValue } = req.body;
        const user = await getCurrentVolunteer(userId);
        let modified_user;
        if (!user) {
            modified_user = await createCurrentVolunteer(userId, firstName, lastName);
        } else {
            modified_user = await updateCurrentVolunteer(userId, firstName, lastName, location, bio, availability, hourlyValue);
        }
        if (!modified_user) return res.status(500).json({ error: "Cannot update/create Volunteer", message: "Internal server error." });
        res.status(200).json(modified_user);
    } catch (error) {
        console.error(error);
        next(error);
    }
});