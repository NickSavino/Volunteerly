import { prisma } from "../lib/prisma.js";

export async function getPublicOrgProfile(orgId: string) {
    const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: {
            id: true,
            orgName: true,
            missionStatement: true,
            causeCategory: true,
            website: true,
            hqAdr: true,
            impactHighlights: true,
        },
    });

    if (!org) return null;

    const totalVolunteersHired = await prisma.application.count({
        where: {
            opportunity: {
                orgId,
                status: { in: ["FILLED", "CLOSED"] },
            },
        },
    });

    const activeOpportunities = await prisma.opportunity.count({
        where: {
            orgId,
            status: "OPEN",
        },
    });

    const rawHighlights = Array.isArray(org.impactHighlights) ? org.impactHighlights : [];
    const impactHighlights = rawHighlights
        .filter((h: any) => h && typeof h.value === "number" && typeof h.label === "string")
        .slice(0, 2);

    return {
        id: org.id,
        orgName: org.orgName,
        missionStatement: org.missionStatement,
        causeCategory: org.causeCategory,
        website: org.website,
        hqAdr: org.hqAdr,
        impactHighlights,
        totalVolunteersHired,
        activeOpportunities,
    };
}