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

    const totalVolunteersHired = await prisma.opportunity.count({
        where: {
            orgId,
            status: { in: ["FILLED", "CLOSED"] },
        },
    });

    const progressUpdates = await prisma.progressUpdate.findMany({
        where: {
            opportunity: { orgId },
        },
        select: {
            hoursContributed: true,
            opportunity: {
                select: {
                    volunteer: {
                        select: {
                            hourlyValue: true,
                        },
                    },
                },
            },
        },
    });

    const economicImpact = progressUpdates.reduce((sum, update) => {
        return sum + update.hoursContributed * (update.opportunity.volunteer?.hourlyValue ?? 0);
    }, 0);

    return {
        id: org.id,
        orgName: org.orgName,
        missionStatement: org.missionStatement,
        causeCategory: org.causeCategory,
        website: org.website,
        hqAdr: org.hqAdr,
        impactHighlights: org.impactHighlights,
        totalVolunteersHired,
        economicImpact,
    };
}