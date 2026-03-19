import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function getCurrentVolunteer(volunteerId: string) {
    const volunteer = await prisma.volunteer.findUnique({
        where: { id: volunteerId },
    });
    return volunteer;
}

export async function createCurrentVolunteer(userId: string, firstName: string, lastName: string) {
    const volunteer = await prisma.volunteer.create({
        data: {
            id: userId,
            firstName: firstName,
            lastName: lastName,
        },
    });
    if (!volunteer) throw new Error("Error creating the Volunteer.");
    return volunteer;
}

export async function updateCurrentVolunteer(userId: string, firstName: string, lastName: string, location: string, bio: string, availability: Prisma.InputJsonValue, hourlyValue: number) {
    const volunteer = await prisma.volunteer.update({
        where: { id: userId },
        data: {
            location,
            firstName,
            lastName,
            bio,
            availability,
            hourlyValue,
        },
    });
    if (!volunteer) throw new Error("Error updating the Volunteer.");
    return volunteer;
}

export async function getYourOpportunities(volunteerId: string) {
    return prisma.opportunity.findMany({
        where: { volId: volunteerId },
        include: {
            organization: {
                select: {
                    id: true,
                    orgName: true,
                },
            },
        },
    });
}

export async function getVolunteerOrganizations(volunteerId: string) {
    const opportunities = await prisma.opportunity.findMany({
        where: { volId: volunteerId },
        select: {
            orgId: true,
            hours: true,
            organization: {
                select: {
                    id: true,
                    orgName: true,
                },
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
        where: { volId: volunteerId },
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