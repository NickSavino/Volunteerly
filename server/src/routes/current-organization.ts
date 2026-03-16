import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { createCurrentOrganization, getCurrentOrganization, updateCurrentOrganization } from "../services/organization-service.js";

type AuthenticatedRequest = {
    auth?: {
        userId: string;
        email?: string;
    }
}

export const currentOrganizationRouter = Router();

currentOrganizationRouter.get("/", auth, async (req, res, next) => {
    try {
        const typedReq = req as typeof req & AuthenticatedRequest;

        const userId = typedReq.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "User context missing."
            });
        }

        const org = await getCurrentOrganization(userId);
        
        if (!org) {
            return res.status(404).json({
                error: "Not Found",
                message: "Volunteer not found."
            });
        }
        res.status(200).json(org);
    } catch (error) {
        next(error);
    }
})

currentOrganizationRouter.put("/", auth, async (req, res, next) => {
  try {
    const typedReq = req as typeof req & AuthenticatedRequest;

    const userId = typedReq.auth?.userId;

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "User context missing."
        });
    }
    const { orgName, contactName, contactEmail, contactNum, missionStmt, causeCat, website, impactHighlights} = req.body;

    const user = await getCurrentOrganization(userId);
    let modified_user;
    if (!user) {
        modified_user = await createCurrentOrganization(userId, orgName);
    } else {
        modified_user = await updateCurrentOrganization(userId, contactName, contactEmail, contactNum, missionStmt, causeCat, website, impactHighlights);    
    }
    if (!modified_user) {
        return res.status(500).json({
            error: "Cannot update/create Volunteer",
            message: "Internal server error."
        });
    }

    res.status(200).json(modified_user);
  } catch (error) {
    console.error(error);
    next(error);
    }
});