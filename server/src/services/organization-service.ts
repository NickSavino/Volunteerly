import { Prisma, OrganizationState } from "@prisma/client";
import { prisma } from "../lib/prisma.js";


export async function getCurrentOrganization(orgId: string) {
    const org = await prisma.organization.findUnique({
        where: { id: orgId },
    });

    return org;
}

export async function createCurrentOrganization(orgId: string, orgName: string) {
    const org = await prisma.organization.create({
            data: {
            id: orgId,
            orgName: orgName,
            status: OrganizationState.CREATED
            },
        });
    if (!org) {
        throw new Error("Error creating the Organization.");
    }

    return org;
}

export async function updateCurrentOrganization(orgId: string, contactName: string, contactEmail: string, contactNum: string, missionStmt: string, causeCat: string, website:string, impactHighlights: Prisma.InputJsonValue) {
    const organization = await prisma.organization.update({
        where: { id: orgId },
        data: {
            contactName: contactName,
            contactEmail: contactEmail,
            contactNum: contactNum,
            missionStatement: missionStmt,
            causeCategory: causeCat,
            website: website,
            impactHighlights: impactHighlights
        },
    });
    if (!organization) {
        throw new Error("Error updating the Organization.");
    }

    return organization;
}

export async function applyOrganization(orgId: string, orgName:string, charityNum: number, status:OrganizationState, contactName: string, contactEmail: string,
    contactNum: string, missionStmt: string, causeCat: string, website:string, hqAdr: string) {
    const organization = await prisma.organization.update({
        where: { id: orgId },
        data: {
            orgName: orgName,
            charityNum: charityNum,
            status: status,
            contactName: contactName,
            contactEmail: contactEmail,
            contactNum: contactNum,
            missionStatement: missionStmt,
            causeCategory: causeCat,
            website: website,
            hqAdr: hqAdr
        },
    });
    if (!organization) {
        throw new Error("Error applying for the Organization.");
    }

    return organization;
}