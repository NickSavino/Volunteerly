import { Prisma} from "@prisma/client";
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
    if (!volunteer) {
        throw new Error("Error creating the Volunteer.");
    }

    return volunteer;
}

export async function updateCurrentVolunteer(userId: string, firstName: string, lastName: string, location: string, bio: string, availability:Prisma.InputJsonValue, hourlyValue: number) {
    const volunteer = await prisma.volunteer.update({
        where: { id: userId },
        data: {
        location: location,
        firstName: firstName,
        lastName: lastName,
        bio:bio,
        availability: availability,
        hourlyValue: hourlyValue
    },
    });
    if (!volunteer) {
        throw new Error("Error updating the Volunteer.");
    }

    return volunteer;
}

//call to retrieve volunteers opps
export async function getYourOpportunities(volunteerId: string) {
    return prisma.opportunity.findMany({
        where: { volId: volunteerId },
        include: { organization: true },
    });
}


export async function getVolunteerOrganizations(volunteerId: string) {
    const opportunities = await prisma.opportunity.findMany({
        where: { volId: volunteerId },
        select: {
            organization: true,
        },
        distinct: ["orgId"],
    });

    return opportunities.map((opp) => opp.organization);
}   