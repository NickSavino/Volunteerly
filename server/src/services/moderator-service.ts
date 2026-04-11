/**
 * moderator-service.ts
 * Handles current moderator records and moderator dashboard summary data.
 */

import { ModeratorDashboardSummary } from "@volunteerly/shared";
import { prisma } from "../lib/prisma.js";

/**
 * Builds the moderator dashboard summary payload.
 * @returns Promise<ModeratorDashboardSummary>
 */
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

/**
 * Fetches the current moderator record by moderator id.
 * @param moderatorId
 * @returns Promise<Moderator | null>
 */
export async function getCurrentModerator(moderatorId: string) {
    const moderator = await prisma.moderator.findUnique({
        where: { id: moderatorId },
    });

    return moderator;
}

/**
 * Creates a moderator profile for an authenticated user.
 * @param userId
 * @param firstName
 * @param lastName
 * @returns Promise<Moderator>
 */
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

/**
 * Updates an existing moderator profile.
 * @param userId
 * @param firstName
 * @param lastName
 * @returns Promise<Moderator>
 */
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
