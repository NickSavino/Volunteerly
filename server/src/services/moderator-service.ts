import { prisma } from "../lib/prisma.js";
import { ModeratorDashboardSummary } from "@volunteerly/shared";

export async function getModeratorDashboardSummary(): Promise<ModeratorDashboardSummary> {
    // add real code/query once organization model is migrated
    const pendingOrgs: ModeratorDashboardSummary["recentPendingOrganizations"] = [];
    const pendingOrganizationsCount = pendingOrgs.length;

    // add real code/query once flagged account model is migrated
    const flaggedAccounts: ModeratorDashboardSummary["recentFlaggedAccounts"] = [];
    const flaggedAccountsCount = flaggedAccounts.length;

    // add real code/query once support ticket model is migrated
    const openTickets: ModeratorDashboardSummary["recentTickets"] = [];
    const openTicketsCount = openTickets.length;

    return {
        pendingOrganizationsCount,
        flaggedAccountsCount,
        openTicketsCount,
        recentPendingOrganizations: pendingOrgs,
        recentFlaggedAccounts: flaggedAccounts,
        recentTickets: openTickets,
    };
}

export async function getCurrentModerator(moderatorId: string) {
    const moderator = await prisma.moderator.findUnique({
        where: { id: moderatorId },
    });

    return moderator;
}

export async function createCurrentModerator(userId: string, firstName: string, lastName: string) {
    const moderator = await prisma.moderator.create({
        data: {
            id: userId,
            firstName: firstName,
            lastName: lastName,
        },
    });

    if (!moderator) {
        throw new Error("Error creating the Moderator.");
    }

    return moderator;
}

export async function updateCurrentModerator(userId: string, firstName: string, lastName: string) {
    const moderator = await prisma.moderator.update({
        where: { id: userId },
        data: {
            firstName: firstName,
            lastName: lastName,
        },
    });

    if (!moderator) {
        throw new Error("Error updating the Moderator.");
    }

    return moderator;
}
