import { Router } from "express";
import { getPublicOrgProfile } from "../services/volunteer-organization-service.js";

export const volunteerOrganizationRouter = Router();

volunteerOrganizationRouter.get("/:orgId", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { orgId } = req.params;
        const profile = await getPublicOrgProfile(orgId);

        if (!profile) return res.status(404).json({ error: "Not Found", message: "Organization not found." });

        res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
});