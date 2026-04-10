/**
 * volunteer-service.ts
 * Server-side service functions for all volunteer data operations — wraps Prisma queries for volunteer routes
 */
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { OpportunityFilters } from "@volunteerly/shared";

/**
 * Fetches a volunteer by ID along with their review count
 * @param volunteerId - the volunteer's user ID
 * @returns the volunteer row with an added reviewCount field, or null if not found
 */
export async function getCurrentVolunteer(volunteerId: string) {
    const volunteer = await prisma.volunteer.findUnique({
        where: { id: volunteerId },
    });
    if (!volunteer) return null;
    const reviewCount = await prisma.review.count({
        where: { revieweeId: volunteerId },
    });
    return { ...volunteer, reviewCount };
}

/**
 * Creates a new volunteer record with just a name — called during initial account setup
 * @param userId - the Supabase user ID to use as the volunteer's primary key
 * @param firstName
 * @param lastName
 * @returns the created Volunteer record
 * @throws if creation fails
 */
export async function createCurrentVolunteer(userId: string, firstName: string, lastName: string) {
    const volunteer = await prisma.volunteer.create({
        data: {
            id: userId,
            firstName,
            lastName,
        },
    });
    if (!volunteer) throw new Error("Error creating the Volunteer.");
    return volunteer;
}

/**
 * Updates the volunteer's editable profile fields
 * @param userId - the volunteer to update
 * @param firstName
 * @param lastName
 * @param location - city/province string
 * @param bio - about me text
 * @param availability - JSON array of full day names e.g. ["Monday", "Wednesday"]
 * @param hourlyValue - the volunteer's estimated hourly rate in CAD
 * @returns the updated Volunteer record
 * @throws if update fails
 */
export async function updateCurrentVolunteer(
    userId: string,
    firstName: string,
    lastName: string,
    location: string,
    bio: string,
    availability: Prisma.InputJsonValue,
    hourlyValue: number,
) {
    const volunteer = await prisma.volunteer.update({
        where: { id: userId },
        data: { location, firstName, lastName, bio, availability, hourlyValue },
    });
    if (!volunteer) throw new Error("Error updating the Volunteer.");
    return volunteer;
}

/**
 * Fetches all FILLED and CLOSED opportunities assigned to a volunteer for the dashboard table
 * @param volunteerId
 * @returns array of opportunities with organization name included
 */
export async function getYourOpportunities(volunteerId: string) {
    return prisma.opportunity.findMany({
        where: { volId: volunteerId, status: { in: ["FILLED", "CLOSED"] } },
        include: {
            organization: {
                select: { id: true, orgName: true },
            },
        },
    });
}

/**
 * Fetches a single opportunity by ID, scoped to the volunteer — includes organization info and progress updates
 * @param volunteerId - ensures the volunteer owns this opportunity
 * @param oppId
 * @returns the opportunity with nested relations, or null if not found
 */
export async function getOpportunityById(volunteerId: string, oppId: string) {
    return prisma.opportunity.findFirst({
        where: { id: oppId, volId: volunteerId },
        include: {
            organization: {
                select: { id: true, orgName: true, hqAdr: true, causeCategory: true },
            },
            progressUpdates: {
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    senderRole: true,
                    title: true,
                    description: true,
                    hoursContributed: true,
                    createdAt: true,
                },
            },
        },
    });
}

/**
 * Adds a progress update to an opportunity and increments its total hours in a single transaction
 * @param userId - the volunteer submitting the update
 * @param oppId - the opportunity being updated
 * @param input - title, description, and hours contributed this update
 * @returns the created ProgressUpdate record
 */
export async function addProgressUpdate(
    userId: string,
    oppId: string,
    input: { title: string; description: string; hoursContributed: number },
) {
    return prisma.$transaction(async (tx) => {
        const update = await tx.progressUpdate.create({
            data: {
                opportunityId: oppId,
                senderId: userId,
                senderRole: "VOLUNTEER",
                title: input.title,
                description: input.description,
                hoursContributed: input.hoursContributed,
            },
        });

        await tx.opportunity.update({
            where: { id: oppId },
            data: {
                hours: {
                    increment: input.hoursContributed,
                },
            },
        });

        return update;
    });
}

/**
 * Creates a system-generated "Completion Requested" progress update to notify the organization
 * @param volunteerId
 * @param oppId
 */
export async function requestCompletion(volunteerId: string, oppId: string) {
    const opp = await prisma.opportunity.findFirst({
        where: { id: oppId, volId: volunteerId },
    });
    if (!opp) throw new Error("Opportunity not found.");

    await prisma.progressUpdate.create({
        data: {
            opportunityId: oppId,
            senderId: volunteerId,
            senderRole: "VOLUNTEER",
            title: "Completion Requested",
            description: "Volunteer has requested this opportunity be marked as complete.",
            hoursContributed: 0,
        },
    });
}

/**
 * Posts a star rating review from a volunteer to an organization for a specific opportunity.
 * Throws if the volunteer has already reviewed this opportunity.
 * @param issuerId - the volunteer posting the review
 * @param revieweeId - the organization being reviewed
 * @param opportunityId - the opportunity context
 * @param input - rating (1–5)
 */
export async function postReview(
    issuerId: string,
    revieweeId: string,
    opportunityId: string,
    input: { rating: number },
) {
    const existing = await prisma.review.findUnique({
        where: { issuerId_opportunityId: { issuerId, opportunityId } },
    });
    if (existing) throw new Error("ALREADY_REVIEWED");

    await prisma.review.create({
        data: {
            issuerId,
            revieweeId,
            opportunityId,
            rating: input.rating,
        },
    });
}

/**
 * Flags an organization for moderator review. Also marks the organization's user as FLAGGED.
 * Throws if the volunteer has already flagged this organization for this opportunity.
 * @param issuerId - the volunteer submitting the flag
 * @param flaggedUserId - the organization's user ID
 * @param opportunityId - the opportunity context
 * @param reason - the volunteer's stated reason
 * @returns the created Flag record
 */
export async function postFlag(
    issuerId: string,
    flaggedUserId: string,
    opportunityId: string,
    reason: string,
) {
    const existing = await prisma.flag.findUnique({
        where: { flagIssuerId_opportunityId: { flagIssuerId: issuerId, opportunityId } },
    });
    if (existing) throw new Error("ALREADY_FLAGGED");

    return prisma.$transaction(async (tx) => {
        const flag = await tx.flag.create({
            data: {
                flagIssuerId: issuerId,
                flaggedUserId,
                opportunityId,
                reason,
            },
        });

        const flaggedOrg = await tx.organization.findUnique({
            where: { id: flaggedUserId },
            select: { id: true },
        });

        if (flaggedOrg) {
            await tx.user.updateMany({
                where: { id: flaggedUserId, status: { not: "FLAGGED" } },
                data: { status: "FLAGGED" },
            });
        }

        return flag;
    });
}

/**
 * Gets the distinct organizations a volunteer has worked with, along with their total hours per org.
 * Used for the partner organizations list and org-count KPI on the dashboard.
 * @param volunteerId
 * @returns array of { id, orgName, totalHours }
 */
export async function getVolunteerOrganizations(volunteerId: string) {
    const opportunities = await prisma.opportunity.findMany({
        where: { volId: volunteerId, status: { in: ["FILLED", "CLOSED"] } },
        select: {
            orgId: true,
            hours: true,
            organization: {
                select: { id: true, orgName: true },
            },
        },
    });

    const map = new Map<string, { id: string; orgName: string; totalHours: number }>();
    for (const opp of opportunities) {
        if (!opp.organization) continue;
        const existing = map.get(opp.orgId);
        if (existing) {
            existing.totalHours += opp.hours;
        } else {
            map.set(opp.orgId, {
                id: opp.organization.id,
                orgName: opp.organization.orgName,
                totalHours: opp.hours,
            });
        }
    }

    return Array.from(map.values());
}

/**
 * Builds a "YYYY-MM" → hours map from the volunteer's completed opportunities.
 * Used to drive the contribution chart on the dashboard.
 * @param volunteerId
 * @returns Record of month key to total hours volunteered in that month
 */
export async function getMonthlyHours(volunteerId: string) {
    const opportunities = await prisma.opportunity.findMany({
        where: { volId: volunteerId, status: { in: ["FILLED", "CLOSED"] } },
        select: {
            hours: true,
            postedDate: true,
        },
    });

    const map = new Map<string, number>();
    for (const opp of opportunities) {
        const key = `${opp.postedDate.getFullYear()}-${String(opp.postedDate.getMonth() + 1).padStart(2, "0")}`;
        map.set(key, (map.get(key) ?? 0) + opp.hours);
    }

    return Object.fromEntries(map);
}

/**
 * Fetches open opportunities with optional server-side filtering.
 * Category filtering and availability matching are done client-side in the VM.
 * @param filters - optional search query, workType, commitmentLevel, and maxHours
 * @returns array of opportunities with basic organization info included
 */
export async function browseOpportunities(filters: OpportunityFilters) {
    return prisma.opportunity.findMany({
        where: {
            status: "OPEN",
            ...(filters.search
                ? {
                      OR: [
                          { name: { contains: filters.search, mode: "insensitive" } },
                          { description: { contains: filters.search, mode: "insensitive" } },
                          { category: { contains: filters.search, mode: "insensitive" } },
                          {
                              organization: {
                                  orgName: { contains: filters.search, mode: "insensitive" },
                              },
                          },
                      ],
                  }
                : {}),
            ...(filters.category
                ? { category: { equals: filters.category, mode: "insensitive" } }
                : {}),
            ...(filters.workType ? { workType: filters.workType } : {}),
            ...(filters.commitmentLevel ? { commitmentLevel: filters.commitmentLevel } : {}),
            ...(filters.maxHours !== undefined ? { hours: { lte: filters.maxHours } } : {}),
        },
        include: {
            organization: {
                select: {
                    id: true,
                    orgName: true,
                    hqAdr: true,
                    causeCategory: true,
                },
            },
        },
        orderBy: { postedDate: "desc" },
    });
}

/**
 * Creates an application for a volunteer to an opportunity.
 * Throws if they've already applied to prevent duplicates.
 * @param volId
 * @param oppId
 * @param message - the volunteer's cover message
 * @param matchPercentage - the cosine similarity score at time of application
 * @returns the created Application record
 */
export async function applyToOpportunity(
    volId: string,
    oppId: string,
    message: string,
    matchPercentage: number,
) {
    const existing = await prisma.application.findUnique({
        where: { oppId_volId: { oppId, volId } },
    });
    if (existing) throw new Error("ALREADY_APPLIED");

    return prisma.application.create({
        data: { oppId, volId, message, matchPercentage },
    });
}

/**
 * Gets the IDs of all opportunities the volunteer has applied to.
 * Used to show the "✓ Applied" badge on opportunity cards.
 * @param volId
 * @returns array of opportunity UUIDs
 */
export async function getAppliedOppIds(volId: string): Promise<string[]> {
    const applications = await prisma.application.findMany({
        where: { volId },
        select: { oppId: true },
    });
    return applications.map((a) => a.oppId);
}

/**
 * Logs the skills a volunteer gained from completing an opportunity for the skill tree.
 * Throws if skills have already been submitted for this volunteer/opportunity combination.
 * @param volId
 * @param oppId
 * @param skills - array of skill name strings to log
 */
export async function logOpportunitySkills(volId: string, oppId: string, skills: string[]) {
    const existing = await prisma.opportunitySkill.findFirst({
        where: { volId, opportunityId: oppId },
    });
    if (existing) throw new Error("ALREADY_SUBMITTED");

    if (skills.length === 0) return;

    await prisma.opportunitySkill.createMany({
        data: skills.map((skillName) => ({
            volId,
            opportunityId: oppId,
            skillName,
        })),
        skipDuplicates: true,
    });
}

/**
 * Fetches the skills a volunteer logged for a specific completed opportunity
 * @param volId
 * @param oppId
 * @returns array of skill name strings
 */
export async function getOpportunitySkills(volId: string, oppId: string): Promise<string[]> {
    const skills = await prisma.opportunitySkill.findMany({
        where: { volId, opportunityId: oppId },
        select: { skillName: true },
    });
    return skills.map((s) => s.skillName);
}

/**
 * Counts how many times each skill has been logged across all of a volunteer's opportunities.
 * Used to build the skill tree visualization showing skill frequency/depth.
 * @param volId
 * @returns Record of skillName → count
 */
export async function getVolunteerSkillCounts(volId: string): Promise<Record<string, number>> {
    const skills = await prisma.opportunitySkill.findMany({
        where: { volId },
        select: { skillName: true },
    });

    const counts: Record<string, number> = {};
    for (const { skillName } of skills) {
        counts[skillName] = (counts[skillName] ?? 0) + 1;
    }
    return counts;
}

/**
 * Computes cosine similarity match scores between a volunteer's skill vector
 * and all open opportunity skill vectors using pgvector's <=> operator.
 * Returns an empty object if the volunteer has no vector yet.
 * @param userId - the volunteer to score opportunities for
 * @returns Record of oppId to match percentage (1–100), only for opportunities with vectors
 */
export async function getOpportunityMatchScores(userId: string): Promise<Record<string, number>> {
    const volunteer = await prisma.$queryRaw<{ has_vector: boolean }[]>`
        SELECT (skill_vector IS NOT NULL) AS has_vector
        FROM volunteers
        WHERE id = ${userId}
        LIMIT 1
    `;

    const hasVector = volunteer?.[0]?.has_vector ?? false;
    if (!hasVector) return {};

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

    return scoreMap;
}
