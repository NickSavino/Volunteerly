/**
 * volunteer-organization-service.ts
 * Service layer for volunteer-facing organization data - assembles a public org profile from multiple queries
 */
import { prisma } from "../lib/prisma.js";

/**
 * Builds and returns the public profile for an organization
 * Combines core org fields with aggregated stats: volunteer count, active postings, and average rating
 * @param orgId - the organization's UUID
 * @returns a PublicOrgProfile object, or null if the organization doesn't exist
 */
export async function getPublicOrgProfile(orgId: string) {
    // Fetch only the fields we want to expose publicly
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

    // Count volunteers hired across all filled/closed opportunities for this org
    const totalVolunteersHired = await prisma.application.count({
        where: {
            opportunity: {
                orgId,
                status: { in: ["FILLED", "CLOSED"] },
            },
        },
    });

    // Count currently open opportunities so the profile shows live availability
    const activeOpportunities = await prisma.opportunity.count({
        where: {
            orgId,
            status: "OPEN",
        },
    });

    // Fetch all ratings to compute the average - done in application code to keep the query simple
    const reviews = await prisma.review.findMany({
        where: { revieweeId: orgId },
        select: { rating: true },
    });
    const averageRating =
        reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

    // Defensively parse impact highlights - the field is stored as JSON and may be malformed
    const rawHighlights = Array.isArray(org.impactHighlights) ? org.impactHighlights : [];
    const impactHighlights = rawHighlights
        .filter((h: any) => h && typeof h.value === "number" && typeof h.label === "string")
        .slice(0, 2); // Only expose up to 2 highlights on the public profile

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
        averageRating,
        reviewCount: reviews.length,
    };
}
