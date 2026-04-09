/**
 * current-volunteer.ts
 * Express router for all endpoints scoped to the authenticated volunteer (profile, opportunities, skills, etc.)
 */
import { Router } from "express";
import {
    createCurrentVolunteer,
    getCurrentVolunteer,
    updateCurrentVolunteer,
    getYourOpportunities,
    getOpportunityById,
    getVolunteerOrganizations,
    getMonthlyHours,
    browseOpportunities,
    applyToOpportunity,
    getAppliedOppIds,
    addProgressUpdate,
    requestCompletion,
    postReview,
    postFlag,
    logOpportunitySkills,
    getOpportunitySkills,
    getVolunteerSkillCounts,
} from "../services/volunteer-service.js";
import { prisma } from "../lib/prisma.js";
import { extractSkillsFromOpportunity } from "../services/groq-service.js";
import { embedText } from "../services/gemini-service.js";

export const currentVolunteerRouter = Router();

/**
 * GET /current-volunteer/skill-counts
 * Returns a map of skill label --> count of times the volunteer has logged that skill
 * Auth: required
 * Returns: 200 with Record<string, number>
 * Errors: 401
 */
currentVolunteerRouter.get("/skill-counts", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const counts = await getVolunteerSkillCounts(userId);
        res.status(200).json(counts);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /current-volunteer/opportunities/:oppId/apply
 * Submits a volunteer application for the specified opportunity
 * Auth: required
 * Params: oppId - opportunity UUID
 * Body: { message: string }
 * Returns: 201 { success: true }
 * Errors: 401, 409 (already applied)
 */
currentVolunteerRouter.post("/opportunities/:oppId/apply", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const { oppId } = req.params;
        const { message } = req.body;
        await applyToOpportunity(userId, oppId, message ?? "");
        res.status(201).json({ success: true });
    } catch (error: any) {
        if (error?.message === "ALREADY_APPLIED") {
            return res.status(409).json({ error: "Already applied to this opportunity." });
        }
        next(error);
    }
});

/**
 * POST /current-volunteer/opportunities/:oppId/progress
 * Adds a progress update (title, description, hours) to an in-progress opportunity
 * Auth: required
 * Params: oppId - opportunity UUID
 * Body: { title: string, description: string, hoursContributed: number }
 * Returns: 201 { success: true }
 * Errors: 401
 */
currentVolunteerRouter.post("/opportunities/:oppId/progress", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const { oppId } = req.params;
        const { title, description, hoursContributed } = req.body;
        await addProgressUpdate(userId, oppId, { title, description, hoursContributed });
        res.status(201).json({ success: true });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /current-volunteer/opportunities/:oppId/request-completion
 * Signals that the volunteer believes the opportunity is done and requests org sign-off
 * Auth: required
 * Params: oppId - opportunity UUID
 * Returns: 200 { success: true }
 * Errors: 401
 */
currentVolunteerRouter.post("/opportunities/:oppId/request-completion", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const { oppId } = req.params;
        await requestCompletion(userId, oppId);
        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /current-volunteer/reviews
 * Posts a star rating review for an organization tied to a specific opportunity
 * Auth: required
 * Body: { revieweeId: string, rating: number, opportunityId: string }
 * Returns: 201 { success: true }
 * Errors: 401, 409 (already reviewed for this opportunity)
 */
currentVolunteerRouter.post("/reviews", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const { revieweeId, rating, opportunityId } = req.body;
        await postReview(userId, revieweeId, opportunityId, { rating });
        res.status(201).json({ success: true });
    } catch (error: any) {
        if (error?.message === "ALREADY_REVIEWED") {
            return res.status(409).json({ error: "Already reviewed for this opportunity." });
        }
        next(error);
    }
});

/**
 * POST /current-volunteer/flags
 * Flags an organization for review by the platform, tied to a specific opportunity
 * Auth: required
 * Body: { flaggedUserId: string, opportunityId: string, reason: string }
 * Returns: 201 { success: true }
 * Errors: 401, 409 (already flagged for this opportunity)
 */
currentVolunteerRouter.post("/flags", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const { flaggedUserId, opportunityId, reason } = req.body;
        await postFlag(userId, flaggedUserId, opportunityId, reason);
        res.status(201).json({ success: true });
    } catch (error: any) {
        if (error?.message === "ALREADY_FLAGGED") {
            return res.status(409).json({ error: "Already flagged for this opportunity." });
        }
        next(error);
    }
});

/**
 * GET /current-volunteer/opportunities/applied-ids
 * Returns the list of opportunity IDs the volunteer has already applied to
 * Used by the browse page to show "Applied" badges without re-fetching full opportunity data
 * Auth: required
 * Returns: 200 string[]
 * Errors: 401
 */
currentVolunteerRouter.get("/opportunities/applied-ids", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const ids = await getAppliedOppIds(userId);
        res.status(200).json(ids);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /current-volunteer/opportunities/browse
 * Returns a filtered list of open opportunities available to browse
 * Auth: required
 * Query params:
 *   search?: string - full-text search term
 *   category?: string - role/category filter
 *   workType?: "IN_PERSON" | "REMOTE" | "HYBRID"
 *   commitmentLevel?: "FLEXIBLE" | "PART_TIME" | "FULL_TIME"
 *   maxHours?: number - maximum weekly hours filter
 * Returns: 200 Opportunity[]
 * Errors: 401
 */
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

/**
 * GET /current-volunteer/opportunities/match-scores
 * Returns a map of opportunity ID --> match percentage (1–100) based on pgvector cosine similarity
 * Returns an empty object if the volunteer has no skill vector yet
 * Auth: required
 * Returns: 200 Record<string, number>
 * Errors: 401
 */
currentVolunteerRouter.get("/opportunities/match-scores", async (req, res, next) => {
    console.log("MATCH SCORES ROUTE HIT");
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        // Check whether the volunteer has a skill vector before running the similarity query
        const volunteer = await prisma.$queryRaw<{ has_vector: boolean }[]>`
            SELECT (skill_vector IS NOT NULL) AS has_vector
            FROM volunteers
            WHERE id = ${userId}
            LIMIT 1
        `;

        const hasVector = volunteer?.[0]?.has_vector ?? false;
        if (!hasVector) {
            // No vector yet - all opportunities default to 1% on the client
            return res.status(200).json({});
        }

        // Cosine similarity via pgvector: 1 - (a <=> b) where <=> is cosine distance
        // Multiply by 100 and round to integer percentage; floor at 1 so no opp shows 0%
        const scores = await prisma.$queryRaw<{ id: string; match_pct: number }[]>`
            SELECT
                o.id,
                GREATEST(1, ROUND(CAST((1 - (o.skill_vector <=> v.skill_vector)) * 100 AS NUMERIC), 0)::int) AS match_pct
            FROM opportunities o, volunteers v
            WHERE v.id = ${userId}
              AND v.skill_vector IS NOT NULL
              AND o.skill_vector IS NOT NULL
        `;

        const scoreMap: Record<string, number> = {};
        for (const row of scores) {
            scoreMap[row.id] = Math.min(100, Math.max(1, Number(row.match_pct)));
        }

        console.log("SCORE MAP HERE: ", scoreMap);

        res.status(200).json(scoreMap);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /current-volunteer/opportunities/backfill-vectors
 * Fire-and-forget endpoint that generates skill vectors for any OPEN opportunities missing one
 * Responds immediately with the count of opportunities being processed; work happens asynchronously
 * Auth: required
 * Returns: 200 { success: true, count: number } or { skipped: true }
 * Errors: 401
 */
currentVolunteerRouter.post("/opportunities/backfill-vectors", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const oppsWithoutVector = await prisma.$queryRaw<
            {
                id: string;
                name: string;
                category: string;
                description: string;
                candidate_desc: string;
            }[]
        >`
            SELECT id, name, category, description, candidate_desc
            FROM opportunities
            WHERE skill_vector IS NULL
            AND status = 'OPEN'
        `;

        if (oppsWithoutVector.length === 0) {
            return res.status(200).json({ skipped: true });
        }

        // Process in the background so the HTTP response isn't held open
        (async () => {
            for (const opp of oppsWithoutVector) {
                try {
                    // Use Groq to extract skill tags, then Gemini to embed them as a vector
                    const skills = await extractSkillsFromOpportunity(
                        opp.name,
                        opp.category,
                        opp.description,
                        opp.candidate_desc,
                    );
                    const allSkills = [...skills.technical, ...skills.nonTechnical].join(", ");
                    const vector = await embedText(allSkills);
                    await prisma.$executeRaw`
                        UPDATE opportunities
                        SET skill_vector = ${JSON.stringify(vector)}::vector
                        WHERE id = ${opp.id}
                    `;
                } catch (err) {
                    console.warn(`Failed to backfill vector for opportunity ${opp.id}:`, err);
                }
            }
        })();

        res.status(200).json({ success: true, count: oppsWithoutVector.length });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /current-volunteer/opportunities/:oppId
 * Returns the full details for a single opportunity the volunteer is enrolled in
 * Auth: required
 * Params: oppId - opportunity UUID
 * Returns: 200 Opportunity
 * Errors: 401, 404
 */
currentVolunteerRouter.get("/opportunities/:oppId", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const { oppId } = req.params;
        const opp = await getOpportunityById(userId, oppId);
        if (!opp) return res.status(404).json({ error: "Not Found" });
        res.status(200).json(opp);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /current-volunteer/opportunities
 * Returns all opportunities the volunteer is currently enrolled in
 * Auth: required
 * Returns: 200 Opportunity[]
 * Errors: 401
 */
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

/**
 * GET /current-volunteer/organizations
 * Returns all organizations the volunteer has worked with
 * Auth: required
 * Returns: 200 Organization[]
 * Errors: 401
 */
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

/**
 * GET /current-volunteer/monthly-hours
 * Returns the volunteer's logged hours aggregated by month
 * Auth: required
 * Returns: 200 monthly hours data
 * Errors: 401
 */
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

/**
 * GET /current-volunteer/
 * Returns the authenticated volunteer's full profile
 * Auth: required
 * Returns: 200 CurrentVolunteer
 * Errors: 401, 404
 */
currentVolunteerRouter.get("/", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId)
            return res
                .status(401)
                .json({ error: "Unauthorized", message: "User context missing." });
        const user = await getCurrentVolunteer(userId);
        if (!user)
            return res.status(404).json({ error: "Not Found", message: "Volunteer not found." });
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /current-volunteer/
 * Creates or updates the authenticated volunteer's profile
 * Creates a new volunteer record if one doesn't exist yet (e.g. first login after role assignment)
 * Auth: required
 * Body: { firstName, lastName, location?, bio?, availability?, hourlyValue? }
 * Returns: 200 CurrentVolunteer
 * Errors: 401, 500
 */
currentVolunteerRouter.put("/", async (req, res, next) => {
    try {
        const userId = req.auth!.userId;
        console.log("got req");
        const { firstName, lastName, location, bio, availability, hourlyValue } = req.body;
        const user = await getCurrentVolunteer(userId);
        let modified_user;
        if (!user) {
            // First-time setup - create a bare profile with just name
            modified_user = await createCurrentVolunteer(userId, firstName, lastName);
        } else {
            modified_user = await updateCurrentVolunteer(
                userId,
                firstName,
                lastName,
                location,
                bio,
                availability,
                hourlyValue,
            );
        }
        if (!modified_user)
            return res.status(500).json({
                error: "Cannot update/create Volunteer",
                message: "Internal server error.",
            });
        res.status(200).json(modified_user);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

/**
 * GET /current-volunteer/awards
 * Computes and returns the badges/awards the volunteer has earned based on their activity
 * Award criteria are evaluated at request time (not stored separately)
 * Auth: required
 * Returns: 200 Record<string, string> - map of award name to description
 * Errors: 401
 */
currentVolunteerRouter.get("/awards", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const awards: Record<string, string> = {};

        const vol = await getCurrentVolunteer(userId);
        const locationLength = vol?.location?.length || 0;
        const bioLength = vol?.bio?.length || 0;

        // Profile completeness award
        if (locationLength >= 1 && bioLength >= 1) {
            awards["Profile Pro"] = "Completed all volunteer profile details!";
        }

        const opportunities = await getYourOpportunities(userId);
        const num_opporuntities = opportunities?.length || 0;

        // Opportunity milestone awards - only the highest tier is awarded
        if (num_opporuntities >= 1) {
            awards["First Step"] = "Completed your first opportunity!";
        }
        if (num_opporuntities >= 100) {
            awards["Legendary Volunteer"] = "Completed 100 Opportunities on Volunteerly!";
        } else if (num_opporuntities >= 50) {
            awards["Master Volunteer"] = "Completed 50 Opportunities on Volunteerly!";
        } else if (num_opporuntities >= 10) {
            awards["Active Volunteer"] = "Completed Opportunities on Volunteerly!";
        }

        const hours = await getVolunteerOrganizations(userId);
        const num_unique_orgs = hours?.length || 0;

        // Organization diversity awards - same tiered approach
        if (num_unique_orgs >= 1) {
            awards["Helping Hand"] = "Assisted your first Organization!";
        }

        if (num_unique_orgs >= 100) {
            awards["Changemaker"] = "Assisted 100 Organizations!";
        } else if (num_unique_orgs >= 50) {
            awards["Community Pillar"] = "Assisted 50 Organizations!";
        } else if (num_unique_orgs >= 10) {
            awards["Connector"] = "Assisted 10 Organizations!";
        }

        res.status(200).json(awards);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /current-volunteer/opportunities/:oppId/skills
 * Logs the skills a volunteer used during a completed opportunity
 * Auth: required
 * Params: oppId - opportunity UUID
 * Body: { skills: string[] }
 * Returns: 201 { success: true }
 * Errors: 400 (skills not an array), 401, 409 (already submitted)
 */
currentVolunteerRouter.post("/opportunities/:oppId/skills", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const { oppId } = req.params;
        const { skills } = req.body;
        if (!Array.isArray(skills))
            return res.status(400).json({ error: "skills must be an array" });
        await logOpportunitySkills(userId, oppId, skills);
        res.status(201).json({ success: true });
    } catch (error: any) {
        if (error?.message === "ALREADY_SUBMITTED") {
            return res.status(409).json({ error: "ALREADY_SUBMITTED" });
        }
        next(error);
    }
});

/**
 * GET /current-volunteer/opportunities/:oppId/skills
 * Returns the skills the volunteer has already logged for a specific opportunity
 * Auth: required
 * Params: oppId - opportunity UUID
 * Returns: 200 string[]
 * Errors: 401
 */
currentVolunteerRouter.get("/opportunities/:oppId/skills", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const { oppId } = req.params;
        const skills = await getOpportunitySkills(userId, oppId);
        res.status(200).json(skills);
    } catch (error) {
        next(error);
    }
});
