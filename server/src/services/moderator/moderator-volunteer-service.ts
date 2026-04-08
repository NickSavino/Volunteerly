import { Prisma } from "@prisma/client";
import { ModeratorVolunteerDetail, ModeratorVolunteerEscalateInput, ModeratorVolunteerFlagInput, ModeratorVolunteerList, ModeratorVolunteerSuspendInput, ModeratorVolunteerWarnInput } from "@volunteerly/shared";
import { prisma } from "../../lib/prisma.js";

type DisplayUser = {
    id: string;
    role: "VOLUNTEER" | "ORGANIZATION" | "MODERATOR" | "ADMIN";
    email: string;
    organization: { orgName: string } | null;
    volunteer: { firstName: string; lastName: string } | null;
    moderator: { firstName: string; lastName: string } | null;
};

function buildDisplayName(user: DisplayUser): string {
    if (user.organization?.orgName) return user.organization.orgName;
    if (user.volunteer) return `${user.volunteer.firstName} ${user.volunteer.lastName}`.trim();
    if (user.moderator) return `${user.moderator.firstName} ${user.moderator.lastName}`.trim();
    return user.email;
}

function buildModeratorName(moderator: { firstName: string; lastName: string } | null | undefined) {
    if (!moderator) return undefined;
    return `${moderator.firstName} ${moderator.lastName}`.trim() || undefined;
}

function toStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

async function getVolunteerStatusSnapshot(
    tx: Prisma.TransactionClient,
    volunteerId: string,
) {
    return tx.volunteer.findUnique({
        where: { id: volunteerId },
        select: {
            status: true,
            user: {
                select: {
                    status: true,
                },
            },
        },
    });
}

function isVolunteerSuspended(snapshot: Awaited<ReturnType<typeof getVolunteerStatusSnapshot>>) {
    return snapshot?.status === "CLOSED" || snapshot?.user.status === "BANNED";
}

export async function getModeratorVolunteerList(): Promise<ModeratorVolunteerList> {
    const volunteers = await prisma.volunteer.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            opportunities: { select: { status: true }},
            user: {
                include: {
                    reportsReceived: {
                        orderBy: { createdAt: "desc" },
                        include: {
                            reportingUser: {
                                include: {
                                    organization: true,
                                    volunteer: true,
                                    moderator: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    
    return volunteers.map((volunteer) => {
        const reports = volunteer.user.reportsReceived;
        const latestOpenReport = reports.find((report) => report.isOpen);
        const latestReport = latestOpenReport ?? reports[0];

        return {
            id: volunteer.id,
            firstName: volunteer.firstName,
            lastName: volunteer.lastName,
            location: volunteer.location,
            flaggedByDisplayName: latestReport 
                ? buildDisplayName(latestReport.reportingUser as DisplayUser) : undefined,
            latestFlagReason: latestReport?.reason || undefined,
            pastFlagsCount: reports.length,
            completedOpportunities: volunteer.organizationsAssisted,
            averageRating: volunteer.averageRating,
            state: volunteer.status
        }
    })
}

export async function getModeratorVolunteerDetail(volunteerId: string): Promise<ModeratorVolunteerDetail | null> {
    const volunteer = await prisma.volunteer.findUnique({
        where: { id: volunteerId },
        include: {
            opportunities: { select: { status: true } },
            skillProfile: true,
            user: {
                include: {
                    reportsReceived: {
                        orderBy: { createdAt: "desc" },
                        include: {
                            reportingUser: {
                                include: {
                                    organization: true,
                                    volunteer: true,
                                    moderator: true,
                                },
                            },
                            moderatedBy: true,
                        },
                    },
                },
            },
        },
    });

    if (!volunteer) return null;

    const reports = volunteer.user.reportsReceived.map((report) => ({
        id: report.id,
        reason: report.reason,
        details: report.details || undefined,
        severity: report.severity ?? undefined,
        isOpen: report.isOpen,
        createdAt: report.createdAt.toISOString(),
        reporterId: report.reportingUserId,
        reporterDisplayName: buildDisplayName(report.reportingUser as DisplayUser),
        reporterRole: report.reportingUser.role,
        actionTaken: report.actionTaken ?? undefined,
        moderatorNote: report.moderatorNote || undefined,
        moderatedByDisplayName: buildModeratorName(report.moderatedBy),
        resolvedAt: report.resolvedAt?.toISOString(),
        suspensionUntil: report.suspensionUntil?.toISOString(),
    }));

    return {
        id: volunteer.id,
        firstName: volunteer.firstName,
        lastName: volunteer.lastName,
        location: volunteer.location,
        bio: volunteer.bio,
        availability: Array.isArray(volunteer.availability) ? volunteer.availability : [],
        pastFlagsCount: reports.length,
        completedOpportunities: volunteer.opportunities.filter((opp) => opp.status === "CLOSED").length,
        averageRating: volunteer.averageRating,
        hourlyValue: volunteer.hourlyValue,
        state: reports.some((report) => report.isOpen) ? "FLAGGED" : volunteer.status,
        technicalSkills: toStringArray(volunteer.skillProfile?.technical),
        nonTechnicalSkills: toStringArray(volunteer.skillProfile?.nonTechnical),
        reports,
    };
}

export async function flagVolunteerByModerator(
    volunteerId: string,
    moderatorId: string,
    input: ModeratorVolunteerFlagInput,
) {
    return prisma.$transaction(async (tx) => {
        const volunteer = await getVolunteerStatusSnapshot(tx, volunteerId);

        if (!volunteer) throw new Error("VOLUNTEER_NOT_FOUND");
        if (isVolunteerSuspended(volunteer)) throw new Error("VOLUNTEER_ALREADY_SUSPENDED");

        await tx.flag.create({
            data: {
                flagIssuerId: moderatorId,
                flaggedUserId: volunteerId,
                reason: input.reason.trim(),
            },
        });

        const report = await tx.volunteerReport.create({
            data: {
                reportedUserId: volunteerId,
                reportingUserId: moderatorId,
                reason: input.reason.trim(),
                details: input.details?.trim() ?? "",
                severity: input.severity ?? null,
            },
        });

        await tx.volunteer.update({
            where: { id: volunteerId },
            data: { status: "FLAGGED" },
        });

        await tx.user.update({
            where: { id: volunteerId },
            data: { status: "FLAGGED" },
        });

        return report;
    });
}

export async function warnVolunteer(
    volunteerId: string,
    moderatorId: string,
    input: ModeratorVolunteerWarnInput,
) {
    return prisma.$transaction(async (tx) => {
        const report = await tx.volunteerReport.findFirst({
            where: {
                id: input.reportId,
                reportedUserId: volunteerId,
                isOpen: true,
            },
        });

        if (!report) throw new Error("REPORT_NOT_FOUND");

        await tx.volunteerReport.update({
            where: { id: report.id },
            data: {
                isOpen: false,
                severity: input.severity,
                actionTaken: "WARNING",
                moderatorNote: input.reason.trim(),
                moderatedById: moderatorId,
                resolvedAt: new Date(),
                suspensionUntil: null,
            },
        });

        const remainingOpen = await tx.volunteerReport.count({
            where: { reportedUserId: volunteerId, isOpen: true },
        });

        await tx.volunteer.update({
            where: { id: volunteerId },
            data: { status: remainingOpen > 0 ? "FLAGGED" : "RESOLVED" },
        });

        await tx.user.update({
            where: { id: volunteerId },
            data: { status: remainingOpen > 0 ? "FLAGGED" : "VERIFIED" },
        });
    });
}

export async function suspendVolunteer(
    volunteerId: string,
    moderatorId: string,
    input: ModeratorVolunteerSuspendInput,
) {
    return prisma.$transaction(async (tx) => {
        const volunteer = await getVolunteerStatusSnapshot(tx, volunteerId);

        if (!volunteer) throw new Error("VOLUNTEER_NOT_FOUND");
        if (isVolunteerSuspended(volunteer)) throw new Error("VOLUNTEER_ALREADY_SUSPENDED");

        const report = await tx.volunteerReport.findFirst({
            where: {
                id: input.reportId,
                reportedUserId: volunteerId,
                isOpen: true,
            },
        });

        if (!report) throw new Error("REPORT_NOT_FOUND");

        const suspensionUntil = new Date(Date.now() + input.durationDays * 24 * 60 * 60 * 1000);

        await tx.volunteerReport.update({
            where: { id: report.id },
            data: {
                isOpen: false,
                actionTaken: "SUSPEND",
                moderatorNote: input.reason.trim(),
                moderatedById: moderatorId,
                resolvedAt: new Date(),
                suspensionUntil,
            },
        });

        await tx.volunteer.update({
            where: { id: volunteerId },
            data: { status: "CLOSED" },
        });

        await tx.user.update({
            where: { id: volunteerId },
            data: { status: "BANNED" },
        });
    });
}

export async function escalateVolunteer(
    volunteerId: string,
    moderatorId: string,
    input: ModeratorVolunteerEscalateInput,
) {
    return prisma.$transaction(async (tx) => {
        const report = await tx.volunteerReport.findFirst({
            where: {
                id: input.reportId,
                reportedUserId: volunteerId,
                isOpen: true,
            },
        });

        if (!report) throw new Error("REPORT_NOT_FOUND");

        await tx.volunteerReport.update({
            where: { id: report.id },
            data: {
                isOpen: false,
                actionTaken: "ESCALATE",
                moderatorNote: input.reason.trim(),
                moderatedById: moderatorId,
                resolvedAt: new Date(),
                suspensionUntil: null,
            },
        });

        await tx.volunteer.update({
            where: { id: volunteerId },
            data: { status: "CLOSED" },
        });

        await tx.user.update({
            where: { id: volunteerId },
            data: { status: "BANNED" },
        });
    });
}
