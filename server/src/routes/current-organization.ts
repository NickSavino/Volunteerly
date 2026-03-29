import { Router } from "express";
import multer from "multer";
import { auth } from "../middleware/auth.js";
import { applyOrganization, createCurrentOrganization, getCurrentOrganization, getAllOpportunities, updateCurrentOrganization, getActiveOpportunities, sumTotalOpportunityHours, countActiveOpportunities, countAllOpportunities, getOrgOpportunity } from "../services/organization-service.js";

type AuthenticatedRequest = {
    auth?: {
        userId: string;
        email?: string;
    }
}

export const currentOrganizationRouter = Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["application/pdf"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only PDFs are allowed!"));
    }

    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

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
                message: "Organization not found."
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

currentOrganizationRouter.put("/apply", auth, upload.single("document"),async (req, res, next) => {
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
            const charityNum_int = Number(charityNum)
            const file = req.file

            if (!file) {
                return res.status(500).json({
                error: "Must submit verification document.",
                message: "No Document Submitted."
            });
            }
            const updated_org = await applyOrganization(userId, orgName, charityNum_int, "APPLIED" ,contactName, contactEmail, contactNum, missionStatement, causeCategory, website, hqAdr, file);  
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

currentOrganizationRouter.get("/opportunities", auth, async (req, res, next) => {
    try {
        const userId = (req as typeof req & AuthenticatedRequest).auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const opportunities = await getAllOpportunities(userId);
        res.status(200).json(opportunities);
    } catch (error) {
        next(error);
    }
});

currentOrganizationRouter.get("/opportunities/active", auth, async (req, res, next) => {
    try {
        const userId = (req as typeof req & AuthenticatedRequest).auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const opportunities = await getActiveOpportunities(userId);
        res.status(200).json(opportunities);
    } catch (error) {
        next(error);
    }
});

currentOrganizationRouter.get("/opportunities/totalCount", auth, async (req, res, next) => {
    try {
        const userId = (req as typeof req & AuthenticatedRequest).auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const opportunities = await countAllOpportunities(userId);
        res.status(200).json(opportunities);
    } catch (error) {
        next(error);
    }
});


currentOrganizationRouter.get("/opportunities/hoursTotal", auth, async (req, res, next) => {
    try {
        const userId = (req as typeof req & AuthenticatedRequest).auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const opportunities = await sumTotalOpportunityHours(userId);
        res.status(200).json(opportunities);
    } catch (error) {
        next(error);
    }
});

currentOrganizationRouter.get("/opportunities/activeTotal", auth, async (req, res, next) => {
    try {
        const userId = (req as typeof req & AuthenticatedRequest).auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const opportunities = await countActiveOpportunities(userId);
        res.status(200).json(opportunities);
    } catch (error) {
        next(error);
    }
});

currentOrganizationRouter.get("/opportunity", auth, async (req, res, next) => {
    try {
        const userId = (req as typeof req & AuthenticatedRequest).auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized", message: "User context missing." });
        }

        const { opp_id } = req.query;
        if (!opp_id || typeof opp_id !== "string") {
            return res.status(401).json({ error: "Unavailable", message: "Opportunity context missing or invalid." });
        }
        const opportunity = await getOrgOpportunity(userId, opp_id);


        res.status(200).json(opportunity);
    } catch (error) {
        next(error);
    }
});

