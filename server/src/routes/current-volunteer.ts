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

currentVolunteerRouter.post("/flags", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const { flaggedUserId, reason } = req.body;
        await postFlag(userId, flaggedUserId, reason);
        res.status(201).json({ success: true });
    } catch (error) {
        next(error);
    }
});

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

// If the volunteer or an opportunity has no vector yet, those opps default to 1%.
currentVolunteerRouter.get("/opportunities/match-scores", async (req, res, next) => {
    console.log("MATCH SCORES ROUTE HIT");
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const volunteer = await prisma.$queryRaw<{ has_vector: boolean }[]>`
            SELECT (skill_vector IS NOT NULL) AS has_vector
            FROM volunteers
            WHERE id = ${userId}
            LIMIT 1
        `;

        //check if vol has a skill vector
        const hasVector = volunteer?.[0]?.has_vector ?? false;
        if (!hasVector) {
            return res.status(200).json({});
        }

        // Cosine similarity via pgvector: 1 - (a <=> b) where <=> is cosine distance
        // Multiply by 100 and round to integer percentage
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

        (async () => {
            for (const opp of oppsWithoutVector) {
                try {
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

currentVolunteerRouter.get("/awards", async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const awards: Record<string, string> = {};

        const vol = await getCurrentVolunteer(userId);
        const locationLength = vol?.location?.length || 0;
        const bioLength = vol?.bio?.length || 0;

        if (locationLength >= 1 && bioLength >= 1) {
            awards["Profile Pro"] = "Completed all volunteer profile details!";
        }

        const opportunities = await getYourOpportunities(userId);
        const num_opporuntities = opportunities?.length || 0;

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
