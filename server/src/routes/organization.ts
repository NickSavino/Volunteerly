
import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { applyOrganization, approveOrganization, createCurrentOrganization, getCurrentOrganization, updateCurrentOrganization } from "../services/organization-service.js";
import { getCurrentUser } from "../services/user-service.js";

type AuthenticatedRequest = {
    auth?: {
        userId: string;
        email?: string;
    }
}

export const OrganizationRouter = Router();


OrganizationRouter.put("/approve", auth, async (req, res, next) => {
  try {
    const typedReq = req as typeof req & AuthenticatedRequest;

    const userId = typedReq.auth?.userId;

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "User context missing."
        });
    }

    const mod = await getCurrentUser(userId);
    
    if (!mod) {
        return res.status(404).json({
            error: "Not Found",
            message: "User not found."
        });
    }else {
        if (!(mod.role == "MODERATOR")) {
            return res.status(500).json({
                error: "Only moderators can approve.",
                message: "Cannot Approve."
            });

        } else {
            const { orgId} = req.body;
            
            const org = await getCurrentOrganization(orgId);
    
            if (!org) {
                return res.status(404).json({
                    error: "Not Found",
                    message: "Organization not found."
                });
            }else {
                if (!(org.status == "APPLIED")) {
                    return res.status(500).json({
                        error: "Organization has not applied.",
                        message: "Cannot Approve."
                    });
            }}
            
            const approved_org = await approveOrganization(orgId)
                if (!approved_org) {
                    return res.status(500).json({
                        error: "Cannot approve Organization",
                        message: "Internal server error."
                    });
                }
            res.status(200).json(approved_org);
        }
    }

  } catch (error) {
    console.error(error);
    next(error);
    }

});