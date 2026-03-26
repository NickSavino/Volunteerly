import { Router } from "express";
import { applyOrganization, createCurrentOrganization, getCurrentOrganization, updateCurrentOrganization } from "../services/organization-service.js";

export const currentOrganizationRouter = Router();

currentOrganizationRouter.get("/", async (req, res, next) => {
    try {
        const userId = req.auth!.userId;

        const org = await getCurrentOrganization(userId);
        
        if (!org) {
            return res.status(404).json({
                error: "Not Found",
                message: "Organization not found."
            });
        }
        res.status(200).json(org);
    } catch (error) {
        next(error);
    }
})

currentOrganizationRouter.put("/", async (req, res, next) => {
  try {
    const userId = req.auth!.userId;

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
            error: "Cannot update/create Organization",
            message: "Internal server error."
        });
    }

    res.status(200).json(modified_user);
  } catch (error) {
    console.error(error);
    next(error);
    }
});

currentOrganizationRouter.put("/apply", async (req, res, next) => {
  try {
    const userId = req.auth!.userId;

    const org = await getCurrentOrganization(userId);
    
    if (!org) {
        return res.status(404).json({
            error: "Not Found",
            message: "Organization not found."
        });
    }else {
        if (org.status == "APPLIED" || org.status == "VERIFIED") {
            return res.status(500).json({
                error: "Organization is not eligible to apply.",
                message: "Cannot Apply."
            });

        } else {
            const { orgName, charityNum, contactName, contactEmail, contactNum, missionStatement, causeCategory, website, hqAdr} = req.body;
            const updated_org = await applyOrganization(userId, orgName, charityNum, "APPLIED" ,contactName, contactEmail, contactNum, missionStatement, causeCategory, website, hqAdr);    
                if (!updated_org) {
                    return res.status(500).json({
                        error: "Cannot update Organization",
                        message: "Internal server error."
                    });
                }
            res.status(200).json(updated_org);
        }

    }

  } catch (error) {
    console.error(error);
    next(error);
    }

});