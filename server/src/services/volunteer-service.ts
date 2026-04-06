import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { OpportunityFilters } from "@volunteerly/shared";

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

export async function getYourOpportunities(volunteerId: string) {
    return prisma.opportunity.findMany({
        where: { volId: volunteerId, status: { in: ["FILLED", "CLOSED"] }},
        include: {
            organization: {
                select: { id: true, orgName: true },
            },
        },
    });
}

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

export async function addProgressUpdate(
    userId: string,
    oppId: string,
    input: { title: string; description: string; hoursContributed: number },
) {
    return prisma.progressUpdate.create({
        data: {
            opportunityId: oppId,
            senderId: userId,
            senderRole: "VOLUNTEER",
            title: input.title,
            description: input.description,
            hoursContributed: input.hoursContributed,
        },
    });
}

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

    const allReviews = await prisma.review.findMany({
        where: { revieweeId },
        select: { rating: true },
    });
     
    const newAverage = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await prisma.volunteer.update({
        where: { id: revieweeId },
        data: { averageRating: newAverage },
    });
}

export async function postFlag(
    issuerId: string,
    flaggedUserId: string,
    reason: string,
) {
    return prisma.flag.create({
        data: {
            flagIssuerId: issuerId,
            flaggedUserId,
            reason,
        },
    });
}

export async function getVolunteerOrganizations(volunteerId: string) {
    const opportunities = await prisma.opportunity.findMany({
        where: { volId: volunteerId, status: { in: ["FILLED", "CLOSED"] }},
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
                        { organization: { orgName: { contains: filters.search, mode: "insensitive" } } },
                    ],
                }
                : {}),
            ...(filters.category ? { category: { equals: filters.category, mode: "insensitive" } } : {}),
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

export async function applyToOpportunity(volId: string, oppId: string, message: string) {
    const existing = await prisma.application.findUnique({
        where: { oppId_volId: { oppId, volId } },
    });
    if (existing) throw new Error("ALREADY_APPLIED");

    return prisma.application.create({
        data: { oppId, volId, message, matchPercentage: 0 },
    });
}

export async function getAppliedOppIds(volId: string): Promise<string[]> {
    const applications = await prisma.application.findMany({
        where: { volId },
        select: { oppId: true },
    });
    return applications.map((a) => a.oppId);
}
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

export async function getOpportunitySkills(volId: string, oppId: string): Promise<string[]> {
    const skills = await prisma.opportunitySkill.findMany({
        where: { volId, opportunityId: oppId },
        select: { skillName: true },
    });
    return skills.map((s) => s.skillName);
}

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