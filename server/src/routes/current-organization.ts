/**
 * current-organization.ts
 * Routes for the authenticated organization's own data and opportunities
 */

import { Router } from "express";
import multer from "multer";
import { auth } from "../middleware/auth.js";
import { sendEmail } from "../services/azure-service.js";
import { getOrCreateDirectConversation } from "../services/chat/chat-service.js";
import {
    applyOrganization,
    completeOpportunity,
    countActiveOpportunities,
    countAllOpportunities,
    createCurrentOrganization,
    createOpportunity,
    createOrgProgressUpdate,
    getActiveOpportunities,
    getAllOpportunities,
    getApplications,
    getCurrentOrganization,
    getOpportunityAnalytics,
    getOppVltApplication,
    getOrgApplication,
    getOrgOpportunity,
    getReviewSummary,
    orgPostFlag,
    orgPostReview,
    selectOppVolunteer,
    sumTotalOpportunityHours,
    updateCurrentOrganization,
    updateOpportunity,
} from "../services/organization-service.js";
import { getCurrentUser } from "../services/user-service.js";

type AuthenticatedRequest = {
    auth?: {
        userId: string;
        email?: string;
    };
};

export const currentOrganizationRouter = Router();

// Store uploads in memory rather than disk - we pass the buffer directly to Supabase
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
        fileSize: 5 * 1024 * 1024, // 5 MB max file size
    },
});

/**
 * GET /current-organization
 * Returns the authenticated organization's profile.
 * Auth: required
 * Returns: 200 with organization data
 * Errors: 401, 404, 500
 */
currentOrganizationRouter.get("/", async (req, res, next) => {
    try {
        const userId = req.auth!.userId;

        const org = await getCurrentOrganization(userId);

        if (!org) {
            return res.status(404).json({
                error: "Not Found",
                message: "Organization not found.",
            });
        }
        res.status(200).json(org);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /current-organization
 * Creates or updates the organization profile for the authenticated user.
 * Auth: required
 * Body: orgName, contactName, contactEmail, contactNum, missionStatement, causeCategory, website, impactHighlights, hqAdr
 * Returns: 200 with updated organization
 * Errors: 401, 500
 */
currentOrganizationRouter.put("/", async (req, res, next) => {
    try {
        const userId = req.auth!.userId;

        const {
            orgName,
            contactName,
            contactEmail,
            contactNum,
            missionStatement,
            causeCategory,
            website,
            impactHighlights,
            hqAdr,
        } = req.body;

        // Check if org already exists to decide between create vs. update
        const user = await getCurrentOrganization(userId);
        let modified_user;
        if (!user) {
            modified_user = await createCurrentOrganization(userId, orgName);
        } else {
            modified_user = await updateCurrentOrganization(
                userId,
                contactName,
                contactEmail,
                contactNum,
                missionStatement,
                causeCategory,
                website,
                impactHighlights,
                hqAdr,
            );
        }
        if (!modified_user) {
            return res.status(500).json({
                error: "Cannot update/create Organization",
                message: "Internal server error.",
            });
        }

        res.status(200).json(modified_user);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

/**
 * PUT /current-organization/apply
 * Submits the organization's verification application with a PDF document.
 * Auth: required
 * Body: multipart/form-data with document file + org fields
 * Returns: 200 with updated organization (status APPLIED or VERIFIED if auto-approved)
 * Errors: 401, 404, 500
 */
currentOrganizationRouter.put("/apply", upload.single("document"), async (req, res, next) => {
    try {
        const userId = req.auth!.userId;

        const org = await getCurrentOrganization(userId);

        if (!org) {
            return res.status(404).json({
                error: "Not Found",
                message: "Organization not found.",
            });
        } else {
            // Prevent re-applying if already submitted or verified
            if (org.status == "APPLIED" || org.status == "VERIFIED") {
                return res.status(500).json({
                    error: "Organization is not eligible to apply.",
                    message: "Cannot Apply.",
                });
            } else {
                const {
                    orgName,
                    charityNum,
                    contactName,
                    contactEmail,
                    contactNum,
                    missionStatement,
                    causeCategory,
                    website,
                    hqAdr,
                } = req.body;
                const charityNum_int = Number(charityNum);
                const file = req.file;

                if (!file) {
                    return res.status(500).json({
                        error: "Must submit verification document.",
                        message: "No Document Submitted.",
                    });
                }
                const updated_org = await applyOrganization(
                    userId,
                    orgName,
                    charityNum_int,
                    contactName,
                    contactEmail,
                    contactNum,
                    missionStatement,
                    causeCategory,
                    website,
                    hqAdr,
                    file,
                );
                if (!updated_org) {
                    return res.status(500).json({
                        error: "Cannot update Organization",
                        message: "Internal server error.",
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

/**
 * GET /current-organization/opportunities
 * Returns all opportunities posted by the authenticated organization.
 * Auth: required
 * Returns: 200 with opportunities array
 * Errors: 401, 500
 */
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

/**
 * GET /current-organization/opportunities/active
 * Returns active (OPEN or FILLED) opportunities for the current organization.
 * Auth: required
 * Returns: 200 with active opportunities array
 * Errors: 401, 500
 */
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

/**
 * GET /current-organization/opportunities/totalCount
 * Returns the total number of opportunities ever posted by this organization.
 * Auth: required
 * Returns: 200 with count
 * Errors: 401, 500
 */
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

/**
 * GET /current-organization/reviews
 * Returns the review summary (average rating, total count) for this organization.
 * Auth: required
 * Returns: 200 with review stats
 * Errors: 401, 500
 */
currentOrganizationRouter.get("/reviews", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const reviewSummary = await getReviewSummary(userId);
        res.status(200).json(reviewSummary);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /current-organization/awards
 * Computes and returns earned achievement badges for this organization.
 * Auth: required
 * Returns: 200 with awards object (badge title to description)
 * Errors: 401, 500
 */
currentOrganizationRouter.get("/awards", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const awards: Record<string, string> = {};

        const org = await getCurrentOrganization(userId);

        // Award for having a complete profile with impact highlights
        if (Array.isArray(org?.impactHighlights) && org?.impactHighlights?.length >= 2) {
            awards["Strong Presence"] = "Completed all organization profile details!";
        }

        // Awards based on total opportunities posted - tiered milestones
        const opportunities = await countAllOpportunities(userId);
        if (opportunities >= 1) {
            awards["First Step"] = "Post first opportunity!";
        }
        if (opportunities >= 100) {
            awards["Community Builder"] = "100 Opportunities on Volunteerly";
        } else if (opportunities >= 50) {
            awards["Community Builder"] = "50 Opportunities on Volunteerly";
        } else if (opportunities >= 10) {
            awards["Community Builder"] = "10 Opportunities on Volunteerly";
        }

        res.status(200).json(awards);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /current-organization/opportunities/hoursTotal
 * Returns the sum of all volunteer hours logged across this org's opportunities.
 * Auth: required
 * Returns: 200 with total hours aggregate
 * Errors: 401, 500
 */
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

/**
 * GET /current-organization/opportunities/activeTotal
 * Returns the count of currently active (FILLED) volunteers for this organization.
 * Auth: required
 * Returns: 200 with count
 * Errors: 401, 500
 */
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

/**
 * GET /current-organization/opportunity
 * Returns a single opportunity by ID, scoped to the authenticated organization.
 * Auth: required
 * Query: opp_id
 * Returns: 200 with opportunity
 * Errors: 401, 500
 */
currentOrganizationRouter.get("/opportunity", auth, async (req, res, next) => {
    try {
        const userId = (req as typeof req & AuthenticatedRequest).auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        if (!userId) {
            return res
                .status(401)
                .json({ error: "Unauthorized", message: "User context missing." });
        }

        const { opp_id } = req.query;
        if (!opp_id || typeof opp_id !== "string") {
            return res
                .status(401)
                .json({ error: "Unavailable", message: "Opportunity context missing or invalid." });
        }
        const opportunity = await getOrgOpportunity(userId, opp_id);

        if (!opportunity) {
            return res.status(500).json({
                error: "Cannot fetch Opportunity",
                message: "Opportunity doesn't exist or not owned by this organization.",
            });
        }

        res.status(200).json(opportunity);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /current-organization/opportunity/applications
 * Returns all applications for a given opportunity owned by this organization.
 * Auth: required
 * Query: opp_id
 * Returns: 200 with applications array
 * Errors: 401, 500
 */
currentOrganizationRouter.get("/opportunity/applications", auth, async (req, res, next) => {
    try {
        const userId = (req as typeof req & AuthenticatedRequest).auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        if (!userId) {
            return res
                .status(401)
                .json({ error: "Unauthorized", message: "User context missing." });
        }

        const { opp_id } = req.query;
        if (!opp_id || typeof opp_id !== "string") {
            return res
                .status(401)
                .json({ error: "Unavailable", message: "Opportunity context missing or invalid." });
        }
        const applications = await getApplications(userId, opp_id);

        if (!applications) {
            return res.status(500).json({
                error: "Cannot fetch Applications",
                message: "Opportunity doesn't exist or not owned by this organization.",
            });
        }

        res.status(200).json(applications);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /current-organization/opportunity/application
 * Returns a single application by ID, ensuring the opportunity belongs to this org.
 * Auth: required
 * Query: app_id
 * Returns: 200 with application details
 * Errors: 401, 500
 */
currentOrganizationRouter.get("/opportunity/application", auth, async (req, res, next) => {
    try {
        const userId = (req as typeof req & AuthenticatedRequest).auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        if (!userId) {
            return res
                .status(401)
                .json({ error: "Unauthorized", message: "User context missing." });
        }

        const { app_id } = req.query;
        if (!app_id || typeof app_id !== "string") {
            return res
                .status(401)
                .json({ error: "Unavailable", message: "Application context missing or invalid." });
        }
        const application = await getOrgApplication(userId, app_id);

        if (!application) {
            return res.status(500).json({
                error: "Cannot fetch Application",
                message: "Application doesn't exist or opportunity not owned by this organization.",
            });
        }

        res.status(200).json(application);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /current-organization/opportunity/select
 * Selects a volunteer for an opportunity, marking it as FILLED, and sends a confirmation email.
 * Auth: required
 * Body: oppId, vltId
 * Returns: 200 with updated opportunity
 * Errors: 401, 500
 */
currentOrganizationRouter.put("/opportunity/select", auth, async (req, res, next) => {
    try {
        const userId = (req as typeof req & AuthenticatedRequest).auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { oppId, vltId } = req.body;

        // Verify that the volunteer actually applied to this opportunity
        const application = await getOppVltApplication(userId, oppId, vltId);

        if (!application) {
            return res.status(500).json({
                error: "Cannot fetch Application",
                message:
                    "Either Volunteer hasn't applied, or Opportunity doesn't exist, or not owned by Organization.",
            });
        }

        const selected_vlt = await selectOppVolunteer(oppId, vltId);
        if (!selected_vlt) {
            return res.status(500).json({
                error: "Cannot Select Volunteer",
                message: "Error selecting Volunteer for this opportunity.",
            });
        }

        // Send a confirmation email to the selected volunteer
        const vltDetails = await getCurrentUser(vltId);

        if (vltDetails) {
            const emailSubject = "Volunteerly - Opportunity Confirmation";
            const emailContentPlain = `Hi,
            We're pleased to let you know that you have been selected for the volunteer opportunity "${selected_vlt.name}".
        
            Please log in to your Volunteerly account to review the opportunity details.

            Best regards,
            Volunteerly Team
            `;
            const emailContentHTML = `
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
            const emailResult = await sendEmail(
                vltDetails.email,
                emailSubject,
                emailContentPlain,
                emailContentHTML,
            );
            console.log(emailResult);
        }

        res.status(200).json(selected_vlt);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

/**
 * PUT /current-organization/opportunity/complete
 * Marks a FILLED opportunity as CLOSED (completed).
 * Auth: required
 * Body: oppId
 * Returns: 200 with completed opportunity
 * Errors: 401, 500
 */
currentOrganizationRouter.put("/opportunity/complete", auth, async (req, res, next) => {
    try {
        const userId = (req as typeof req & AuthenticatedRequest).auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { oppId } = req.body;

        const opportunity = await getOrgOpportunity(userId, oppId);

        if (!opportunity) {
            return res.status(500).json({
                error: "Cannot fetch Opportunity",
                message: "Opportunity doesn't exist or not owned by this organization.",
            });
        }

        // Can only complete an opportunity that's currently in FILLED state
        if (!(opportunity.status == "FILLED")) {
            return res.status(500).json({
                error: "Cannot Complete Opportunity",
                message: "Opportunity must be filled status to complete.",
            });
        }

        const completed_opp = await completeOpportunity(oppId);
        if (!completed_opp) {
            return res.status(500).json({
                error: "Cannot Complete Opportunity",
                message: "Error completing this opportunity.",
            });
        }

        res.status(200).json(completed_opp);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

/**
 * GET /current-organization/opportunity/analytics
 * Returns hours and estimated monetary value for a completed opportunity.
 * Auth: required
 * Query: oppId
 * Returns: 200 with analytics data
 * Errors: 401, 500
 */
currentOrganizationRouter.get("/opportunity/analytics", auth, async (req, res, next) => {
    try {
        const userId = (req as typeof req & AuthenticatedRequest).auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { oppId } = req.query;
        if (!oppId || typeof oppId !== "string") {
            return res
                .status(401)
                .json({ error: "Unavailable", message: "Application context missing or invalid." });
        }

        const analytics = await getOpportunityAnalytics(userId, oppId);

        if (!analytics) {
            return res.status(500).json({
                error: "Cannot get Opportunity Analytics",
                message: "Ensure opportunity owned by this organization.",
            });
        }

        res.status(200).json(analytics);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /current-organization/opportunity/progressUpdate
 * Adds a progress update entry to a currently active (FILLED) opportunity.
 * Auth: required
 * Body: opportunityId, title, description, hoursContributed
 * Returns: 200 with the new progress update
 * Errors: 401, 404, 500
 */
currentOrganizationRouter.post("/opportunity/progressUpdate", auth, async (req, res, next) => {
    try {
        const typedReq = req as typeof req & AuthenticatedRequest;

        const userId = typedReq.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "User context missing.",
            });
        }
        const { opportunityId, title, description, hoursContributed } = req.body;

        if (!opportunityId || !title || !description || !hoursContributed) {
            return res.status(404).json({
                error: "Not Enought Information",
                message: "Ensure proper parameters are given.",
            });
        }
        const opp = await getOrgOpportunity(userId, opportunityId);

        if (!opp) {
            return res.status(404).json({
                error: "Not Found",
                message: "Opportunity not found, or not owned by organization",
            });
        } else {
            // Only FILLED opportunities can receive progress updates
            if (!(opp.status == "FILLED")) {
                return res.status(500).json({
                    error: "Cannot add progress update.",
                    message: "Opportunity is not eligible for progress update.",
                });
            } else {
                const added_update = await createOrgProgressUpdate(
                    userId,
                    opportunityId,
                    title,
                    description,
                    Number(hoursContributed),
                );
                if (!added_update) {
                    return res.status(404).json({
                        error: "Error Adding Update",
                        message: "Cannot Add Update.",
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

/**
 * POST /current-organization/opportunity
 * Creates a new volunteer opportunity posting for this organization.
 * Auth: required
 * Body: name, category, description, candidateDesc, workType, commitmentLevel, length, deadlineDate, availability
 * Returns: 200 with created opportunity
 * Errors: 401, 404, 500
 */
currentOrganizationRouter.post("/opportunity", auth, async (req, res, next) => {
    try {
        const typedReq = req as typeof req & AuthenticatedRequest;

        const userId = typedReq.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "User context missing.",
            });
        }
        const {
            name,
            category,
            description,
            candidateDesc,
            workType,
            commitmentLevel,
            length,
            deadlineDate,
            availability,
        } = req.body;

        const created_opp = await createOpportunity(
            userId,
            name,
            category,
            description,
            candidateDesc,
            workType,
            commitmentLevel,
            length,
            deadlineDate,
            availability as string[],
        );

        if (!created_opp) {
            return res.status(404).json({
                error: "Error Creating Opportunity",
                message: "Cannot Create.",
            });
        }
        res.status(200).json(created_opp);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

/**
 * POST /current-organization/reviews
 * Submits a star rating review for a volunteer after an opportunity.
 * Auth: required
 * Body: revieweeId, rating, opportunityId
 * Returns: 201 with success flag
 * Errors: 401, 409 (already reviewed), 500
 */
currentOrganizationRouter.post("/reviews", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const { revieweeId, rating, opportunityId } = req.body;
        await orgPostReview(userId, revieweeId, opportunityId, rating);
        res.status(201).json({ success: true });
    } catch (error: any) {
        // Special case - service throws a known string error for duplicate reviews
        if (error?.message === "ALREADY_REVIEWED") {
            return res.status(409).json({ error: "Already reviewed for this opportunity." });
        }
        next(error);
    }
});

/**
 * POST /current-organization/flags
 * Flags a volunteer for problematic behavior during an opportunity.
 * Auth: required
 * Body: flaggedUserId, opportunityId, reason
 * Returns: 201 with success flag
 * Errors: 401, 409 (already flagged), 500
 */
currentOrganizationRouter.post("/flags", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const { flaggedUserId, opportunityId, reason } = req.body;
        await orgPostFlag(userId, flaggedUserId, opportunityId, reason);
        res.status(201).json({ success: true });
    } catch (error: any) {
        // Special case - service throws a known string error for duplicate flags
        if (error?.message === "ALREADY_FLAGGED") {
            return res.status(409).json({ error: "Already flagged for this opportunity." });
        }
        next(error);
    }
});

/**
 * PUT /current-organization/opportunity
 * Updates an existing opportunity's details.
 * Auth: required
 * Body: opportunityId, name, category, description, candidateDesc, workType, commitmentLevel, length, deadlineDate, availability
 * Returns: 200 with updated opportunity
 * Errors: 401, 404, 500
 */
currentOrganizationRouter.put("/opportunity", auth, async (req, res, next) => {
    try {
        const typedReq = req as typeof req & AuthenticatedRequest;

        const userId = typedReq.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "User context missing.",
            });
        }
        const {
            opportunityId,
            name,
            category,
            description,
            candidateDesc,
            workType,
            commitmentLevel,
            length,
            deadlineDate,
            availability,
        } = req.body;

        const created_opp = await updateOpportunity(
            opportunityId,
            userId,
            name,
            category,
            description,
            candidateDesc,
            workType,
            commitmentLevel,
            length,
            deadlineDate,
            availability as string[],
        );

        if (!created_opp) {
            return res.status(404).json({
                error: "Error Updating Opportunity",
                message: "Cannot Update.",
            });
        }
        res.status(200).json(created_opp);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

/**
 * POST /current-organization/opportunity/message-thread
 * Gets or creates a direct message conversation between the org and the assigned volunteer.
 * Auth: required
 * Body: oppId
 * Returns: 200 with conversationId
 * Errors: 400, 401, 404, 500
 */
currentOrganizationRouter.post("/opportunity/message-thread", auth, async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "User context missing.",
            });
        }

        const { oppId } = req.body;
        if (!oppId || typeof oppId !== "string") {
            return res.status(400).json({
                error: "Bad Request",
                message: "Opportunity ID is required.",
            });
        }

        const opportunity = await getOrgOpportunity(userId, oppId);

        // Opportunity must have a volunteer assigned before messaging is possible
        if (!opportunity || !opportunity.volId) {
            return res.status(404).json({
                error: "Not Found",
                message: "Assigned volunteer not found for this opportunity.",
            });
        }

        const conversation = await getOrCreateDirectConversation(userId, opportunity.volId);

        return res.status(200).json({ conversationId: conversation.id });
    } catch (err) {
        next(err);
    }
});