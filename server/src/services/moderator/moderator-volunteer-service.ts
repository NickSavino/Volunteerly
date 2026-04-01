import { ModeratorVolunteerList } from "@volunteerly/shared";
import { prisma } from "../../lib/prisma.js";


function buildReporterDisplayName(report: {
    reportingUser: {
        email: string
        organization: { orgName: string } | null;
        volunteer: { firstName: string; lastName: string } | null;
        moderator: { firstName: string; lastName: string } | null;
    }
}) : string {
    const { reportingUser } = report;

    if (reportingUser.organization?.orgName) {
        return reportingUser.organization.orgName;
    }

    if (reportingUser.volunteer) {
        return `${reportingUser.volunteer.firstName} ${reportingUser.volunteer.lastName}`.trim()
    }

    if (reportingUser.moderator) {
        return `${reportingUser.moderator.firstName} ${reportingUser.moderator.lastName}`.trim()
    }

    return reportingUser.email
}

export async function getModeratorVolunteerList(): Promise<ModeratorVolunteerList> {
    const volunteers = await prisma.volunteer.findMany({
        orderBy: { createdAt: "desc" },
        include: {
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
                ? buildReporterDisplayName(latestReport)
                : undefined,
            latestFlagReason: latestReport?.reason || undefined,
            pastFlagsCount: reports.length,
            completedOpportunities: volunteer.organizationsAssisted,
            averageRating: volunteer.averageRating,
            state: volunteer.status
        }
    })
}