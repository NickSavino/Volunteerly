/**
 * volunteer-organization.ts
 * Express router for volunteer-facing organization endpoints
 */
import { Router } from "express";
import { getPublicOrgProfile } from "../services/volunteer-organization-service.js";

export const volunteerOrganizationRouter = Router();

/**
 * GET /volunteer-organization/:orgId
 * Returns the public profile for a single organization
 * Auth: required (JWT via req.auth)
 * Params: orgId - the organization's UUID
 * Returns: 200 with PublicOrgProfile JSON
 * Errors:
 *   401 - missing or invalid auth token
 *   404 - no organization found with the given ID
 */
volunteerOrganizationRouter.get("/:orgId", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { orgId } = req.params;
        const profile = await getPublicOrgProfile(orgId);

        if (!profile)
            return res.status(404).json({ error: "Not Found", message: "Organization not found." });

        res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
});
