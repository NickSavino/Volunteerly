import { Router } from "express";
import multer from "multer";
import { auth } from "../middleware/auth.js";
import { applyOrganization, createCurrentOrganization, getCurrentOrganization, getAllOpportunities, updateCurrentOrganization, getActiveOpportunities, sumTotalOpportunityHours, countActiveOpportunities, countAllOpportunities, getOrgOpportunity, getApplications, getOrgApplication, selectOppVolunteer, completeOpportunity, getOpportunityAnalytics, createOrgProgressUpdate, createOpportunity, updateOpportunity, getOppVltApplication } from "../services/organization-service.js";
import { getCurrentUser } from "../services/user-service.js";
import { sendEmail } from "../services/azure-service.js";

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

    const { orgName, contactName, contactEmail, contactNum, missionStatement, causeCategory, website, impactHighlights, hqAdr} = req.body;

    const user = await getCurrentOrganization(userId);
    let modified_user;
    if (!user) {
        modified_user = await createCurrentOrganization(userId, orgName);
    } else {
        modified_user = await updateCurrentOrganization(userId, contactName, contactEmail, contactNum, missionStatement, causeCategory, website, impactHighlights, hqAdr);    
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

currentOrganizationRouter.put("/apply", upload.single("document"),async (req, res, next) => {
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

currentOrganizationRouter.get("/opportunities", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const opportunities = await getAllOpportunities(userId);
        res.status(200).json(opportunities);
    } catch (error) {
        next(error);
    }
});

currentOrganizationRouter.get("/opportunities/active", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const opportunities = await getActiveOpportunities(userId);
        res.status(200).json(opportunities);
    } catch (error) {
        next(error);
    }
});

currentOrganizationRouter.get("/opportunities/totalCount", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const opportunities = await countAllOpportunities(userId);
        res.status(200).json(opportunities);
    } catch (error) {
        next(error);
    }
});


currentOrganizationRouter.get("/awards", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const awards: Record<string, string> = {};

        const org = await getCurrentOrganization(userId)
        if (org?.impactHighlights) {
            awards["Strong Presence"] = "Completed all organization profile details!";
        }

        const opportunities = await countAllOpportunities(userId);
        if (opportunities > 1) {
            awards["First Step"] = "Post first opportunity!";
        }
        if (opportunities > 100){
            awards["Community Builder"] = "100 Opportunities on Volunteerly";
        } else if (opportunities > 50){
            awards["Community Builder"] = "50 Opportunities on Volunteerly";
        } else if (opportunities > 10) {
            awards["Community Builder"] = "10 Opportunities on Volunteerly";
        }

        res.status(200).json(awards);
    } catch (error) {
        next(error);
    }
});
currentOrganizationRouter.get("/opportunities/hoursTotal", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const opportunities = await sumTotalOpportunityHours(userId);
        res.status(200).json(opportunities);
    } catch (error) {
        next(error);
    }
});

currentOrganizationRouter.get("/opportunities/activeTotal", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
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

        if (!opportunity) {
            return res.status(500).json({
                error: "Cannot fetch Opportunity",
                message: "Opportunity doesn't exist or not owned by this organization."
            });
        }

        res.status(200).json(opportunity);
    } catch (error) {
        next(error);
    }
});

currentOrganizationRouter.get("/opportunity/applications", auth, async (req, res, next) => {
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
        const applications = await getApplications(userId, opp_id);

        if (!applications) {
            return res.status(500).json({
                error: "Cannot fetch Applications",
                message: "Opportunity doesn't exist or not owned by this organization."
            });
        }

        res.status(200).json(applications);
    } catch (error) {
        next(error);
    }
});

currentOrganizationRouter.get("/opportunity/application", auth, async (req, res, next) => {
    try {
        const userId = (req as typeof req & AuthenticatedRequest).auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized", message: "User context missing." });
        }

        const { app_id } = req.query;
        if (!app_id || typeof app_id !== "string") {
            return res.status(401).json({ error: "Unavailable", message: "Application context missing or invalid." });
        }
        const application = await getOrgApplication(userId, app_id);

        if (!application) {
            return res.status(500).json({
                error: "Cannot fetch Application",
                message: "Application doesn't exist or opportunity not owned by this organization."
            });
        }

        res.status(200).json(application);
    } catch (error) {
        next(error);
    }
});

currentOrganizationRouter.put("/opportunity/select", auth, async (req, res, next) => {
    try {
        const userId = (req as typeof req & AuthenticatedRequest).auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { oppId, vltId } = req.body;

        const application = await getOppVltApplication(userId, oppId, vltId);

        if (!application) {
            return res.status(500).json({
                error: "Cannot fetch Application",
                message: "Either Volunteer hasn't applied, or Opportunity doesn't exist, or not owned by Organization."
            });
        }

        const selected_vlt = await selectOppVolunteer(oppId, vltId);
        if (!selected_vlt) {
            return res.status(500).json({
                error: "Cannot Select Volunteer",
                message: "Error selecting Volunteer for this opportunity."
            });
        }

        const vltDetails = await getCurrentUser(vltId)

        if (vltDetails)
        {
            const emailSubject = "Volunteerly - Opportunity Confirmation"
            const emailContentPlain = 
            `Hi,
            We're pleased to let you know that you have been selected for the volunteer opportunity "${selected_vlt.name}".
        
            Please log in to your Volunteerly account to review the opportunity details.

            Best regards,
            Volunteerly Team
            `
            const emailContentHTML =
            `
            <html>
				<body>
					<p>
						Hi, \n
					</p>
                    <p>
						We're pleased to let you know that you have been selected for the volunteer opportunity "${selected_vlt.name}". \n
					</p>
                    <p>
						Please log in to your Volunteerly account to review the opportunity details. \n
					</p>
                    <p>
                        Best regards, \n
                        Volunteerly Team
                    </p>
				</body>
			</html>`;            
            const emailResult = await sendEmail(vltDetails.email, emailSubject, emailContentPlain, emailContentHTML)
            console.log(emailResult)
        }
        
        res.status(200).json(selected_vlt);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

currentOrganizationRouter.put("/opportunity/complete", auth, async (req, res, next) => {
    try {
        const userId = (req as typeof req & AuthenticatedRequest).auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { oppId } = req.body;

        const opportunity = await getOrgOpportunity(userId, oppId);

        if (!opportunity) {
            return res.status(500).json({
                error: "Cannot fetch Opportunity",
                message: "Opportunity doesn't exist or not owned by this organization."
            });
        } 

        if (!(opportunity.status == "FILLED")){
            return res.status(500).json({
                error: "Cannot Complete Opportunity",
                message: "Opportunity must be filled status to complete."
            });
        }

        const completed_opp = await completeOpportunity(oppId);
        if (!completed_opp) {
            return res.status(500).json({
                error: "Cannot Complete Opportunity",
                message: "Error completing this opportunity."
            });
        }
        
        res.status(200).json(completed_opp);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

currentOrganizationRouter.get("/opportunity/analytics", auth, async (req, res, next) => {
    try {
        const userId = (req as typeof req & AuthenticatedRequest).auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { oppId } = req.query;
        if (!oppId || typeof oppId !== "string") {
            return res.status(401).json({ error: "Unavailable", message: "Application context missing or invalid." });
        }

        const analytics = await getOpportunityAnalytics(userId, oppId);

        if (!analytics) {
            return res.status(500).json({
                error: "Cannot get Opportunity Analytics",
                message: "Ensure opportunity owned by this organization."
            });
        }

        res.status(200).json(analytics);
    } catch (error) {
        next(error);
    }
});

currentOrganizationRouter.post("/opportunity/progressUpdate", auth, async (req, res, next) => {
  try {
    const typedReq = req as typeof req & AuthenticatedRequest;

    const userId = typedReq.auth?.userId;

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "User context missing."
        });
    }
    const { opportunityId, title, description, hoursContributed} = req.body;

    if (!opportunityId || !title || !description || !hoursContributed){
        return res.status(404).json({
            error: "Not Enought Information",
            message: "Ensure proper parameters are given."
        });
    }
    const opp = await getOrgOpportunity(userId, opportunityId);
    
    if (!opp) {
        return res.status(404).json({
            error: "Not Found",
            message: "Opportunity not found, or not owned by organization"
        });
    }
    
    else {
        if (!(opp.status == "FILLED")) {
            return res.status(500).json({
                error: "Cannot add progress update.",
                message: "Opportunity is not eligible for progress update."
            });

        } else {
            const added_update = await createOrgProgressUpdate(userId, opportunityId, title, description, Number(hoursContributed))
            if (!added_update){
                return res.status(404).json({
                    error: "Error Adding Update",
                    message: "Cannot Add Update."
                });
            }
            res.status(200).json(added_update);
        }

    }

  } catch (error) {
    console.error(error);
    next(error);
    }

});

currentOrganizationRouter.post("/opportunity", auth, async (req, res, next) => {
  try {
    const typedReq = req as typeof req & AuthenticatedRequest;

    const userId = typedReq.auth?.userId;

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "User context missing."
        });
    }
    const { name, category, description, candidateDesc, workType,
        commitmentLevel, length, deadlineDate, availability } = req.body;

    const created_opp = await createOpportunity(userId, name, category, description, candidateDesc, workType,
        commitmentLevel, length, deadlineDate, availability as string[]);
    
    if (!created_opp){
        return res.status(404).json({
            error: "Error Creating Opportunity",
            message: "Cannot Create."
        });
    }
    res.status(200).json(created_opp);
  } catch (error) {
    console.error(error);
    next(error);
    }

});

currentOrganizationRouter.put("/opportunity", auth, async (req, res, next) => {
  try {
    const typedReq = req as typeof req & AuthenticatedRequest;

    const userId = typedReq.auth?.userId;

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "User context missing."
        });
    }
    const { opportunityId, name, category, description, candidateDesc, workType,
        commitmentLevel, length, deadlineDate, availability } = req.body;

    const created_opp = await updateOpportunity(opportunityId, userId, name, category, description, candidateDesc, workType,
        commitmentLevel, length, deadlineDate, availability as string[]);
    
    if (!created_opp){
        return res.status(404).json({
            error: "Error Updating Opportunity",
            message: "Cannot Update."
        });
    }
    res.status(200).json(created_opp);
  } catch (error) {
    console.error(error);
    next(error);
    }

});