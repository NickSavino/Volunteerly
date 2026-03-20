import { Prisma, OrganizationState } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { supabase } from "../lib/supabase.js";


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
    contactNum: string, missionStmt: string, causeCat: string, website:string, hqAdr: string, file:Express.Multer.File) {

    const savedFilePath = await saveFile(orgId, file)
    const organization = await prisma.organization.update({
        where: { id: orgId },
        data: {
            orgName: orgName,
            charityNum: charityNum,
            docId: savedFilePath,
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

export async function saveFile(orgId:string, file:Express.Multer.File){
    const fileName = `org_${orgId}.pdf`;

    const { data, error } = await supabase.storage
    .from("organization-documents")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

    if (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }
    return data.fullPath
}

export async function downloadFile(bucket:string, filePath:string){
    console.log(filePath)
    const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath);

    if (error) {
        console.log(error)
        throw new Error(`Failed to download file: ${error.message}`);
    }
        
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer)
}

export async function approveOrganization(orgId: string) {
    const organization = await prisma.organization.update({
        where: { id: orgId },
        data: {
            status: OrganizationState.VERIFIED
        },
    });
    if (!organization) {
        throw new Error("Error approving the Organization.");
    }

    return organization;
}

export async function rejectOrganization(orgId: string, rejectionReason: string) {
    const organization = await prisma.organization.update({
        where: { id: orgId },
        data: {
            status: OrganizationState.REJECTED,
            rejectionReason: rejectionReason,
        },
    });
    if (!organization) {
        throw new Error("Error rejecting the Organization.");
    }

    return organization;
}

export async function getAppliedOrganizations() {
    const organizations = await prisma.organization.findMany({
        where: { status: OrganizationState.APPLIED },
        orderBy: { createdAt: "desc" },
    });

    return organizations;
}

export async function getAllOrganizations() {
    const organizations = await prisma.organization.findMany({
        orderBy: { createdAt: "desc" },
    });

    return organizations;
}

export async function getYourOpportunities(organizationId: string) {
    return prisma.opportunity.findMany({
        where: { orgId: organizationId },
        include: {
            volunteer: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                },
            },
        },
    });
}
