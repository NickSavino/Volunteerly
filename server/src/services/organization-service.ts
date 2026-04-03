import { Prisma, OrganizationState, CommitmentLevel, WorkType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { supabase } from "../lib/supabase.js";
import { callDocumentAnalysis } from "./azure-service.js";


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

    const autoApprove = await autoApproval(orgName, charityNum, file)

    if (autoApprove) {
        status = "VERIFIED"
    }

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

export async function autoApproval(orgName:string, charityNum: number, file:Express.Multer.File) {
    
    try {    
        const result = await callDocumentAnalysis(file)

        const officialNameParagraph = result.find((p: any) =>
        p.content.toLowerCase().includes("registered under the name")
        );

        const businessNumberParagraph = result.find((p: any) =>
        p.content.toLowerCase().includes("business number is")
        );

        const officialName = officialNameParagraph?.content.split(":")[1]?.trim().slice(0, -1) || null
        const officialNumber = Number(businessNumberParagraph?.content.toLowerCase().split("business number is")[1]?.trim() || null)

        if (officialName == orgName && charityNum ==  officialNumber) {
            const temporary_CRA_Mapping: Record<string, number> = {"World Impact": 123456789};
            if (officialName in temporary_CRA_Mapping && temporary_CRA_Mapping[officialName] == officialNumber) {
                return true
            }else {
                console.log("Values did not match CRA DB.", officialName, officialNumber)
                return false
            }
        }else {
            console.log("Values did not match those given.", officialName, orgName, charityNum, officialNumber)
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }

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

export async function getAllOpportunities(organizationId: string) {
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
            _count: {
                select: {
                    applications:true
                },
            },
        },
    });
}

export async function countAllOpportunities(organizationId: string) {
    return prisma.opportunity.count({
        where: { orgId: organizationId }
    });
}

export async function countActiveOpportunities(organizationId: string) {
    return prisma.opportunity.count({
        where: { orgId: organizationId, status: "FILLED"}
    });
}

export async function sumTotalOpportunityHours(organizationId: string) {
    return prisma.opportunity.aggregate({
        where: { orgId: organizationId },
        _sum: {
            hours:true,
        }
    });
}

export async function getActiveOpportunities(organizationId: string) {
    return prisma.opportunity.findMany({
        where: { orgId: organizationId, status: {in: ["OPEN", "FILLED"]}},
        include: {
            volunteer: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                },                
            },
            _count: {
                select: {
                    applications:true
                },
            },
        },
    });
}

export async function getOrgOpportunity(orgId: string, oppId: string) {
    const org = await prisma.opportunity.findFirst({
        where: { id: oppId, orgId:orgId },
        include: {
        volunteer: {
            select: { id: true, firstName: true, lastName: true },
        },
        progressUpdates: {
            select:{id:true, senderRole:true, title:true, description:true, hoursContributed:true, createdAt:true}
        }
    }
    });
    return org;
}

export async function getApplications(orgId: string, oppId: string) {
    const org = await prisma.application.findMany({
        where: { oppId: oppId, opportunity: {orgId: orgId} },
        include: {
        volunteer: {
            select: { id: true, firstName: true, lastName: true, bio:true },
        },       
    }
    });
    return org;
}

export async function getOrgApplication(orgId: string, appId: string) {
    const org = await prisma.application.findFirst({
        where: { id: appId, opportunity:{orgId:orgId} },
        include: {
        volunteer: {
            select: { id: true, firstName: true, lastName: true, bio:true, location:true, availability:true },
        },       
    }
    });
    return org;
}

export async function getOppVltApplication(orgId:string, oppId: string, vltId: string) {
    const app = await prisma.application.findFirst({
        where: { oppId: oppId, volId:vltId, opportunity:{orgId: orgId} },
    });
    return app;
}


export async function selectOppVolunteer(oppId:string, vltId:string) {
    const organization = await prisma.opportunity.update({
        where: { id: oppId },
        data: {
            volId: vltId,
            status: "FILLED",
            updatedAt: new Date()
        },
    });
    if (!organization) {
        throw new Error("Error selecting the Volunteer.");
    }

    return organization;
}

export async function completeOpportunity(oppId:string) {
    const updateTotals = await prisma.progressUpdate.aggregate({
        where: {
            opportunityId: oppId,
        },
        _sum: {
        hoursContributed: true,
        },
    });

    const totalHours = updateTotals._sum.hoursContributed ?? 0

    const organization = await prisma.opportunity.update({
        where: { id: oppId },
        data: {
            status: "CLOSED",
            updatedAt: new Date(),
            hours: totalHours
        },
    });
    if (!organization) {
        throw new Error("Error completing Opportunity.");
    }

    return organization;
}


export async function getOpportunityAnalytics(organizationId: string, opportunityId:string) {
  const opp = await prisma.opportunity.findFirst({
    where: { orgId: organizationId, id: opportunityId},
    select: {
      hours: true,
      volunteer: {
        select: {
          hourlyValue: true,
        },
      },
    },
  });

    if (!opp) {
        throw new Error("Error getting Opportunity Analytics.");
    }

  return {
    hours: opp.hours,
    value: opp.hours*(opp.volunteer?.hourlyValue || 0),
  };
}

export async function createOrgProgressUpdate(orgId: string, oppId: string, title: string, description:string, hoursContributed:number) {
    const org = await prisma.progressUpdate.create({
            data: {
                opportunityId:oppId,
                senderId:orgId,
                senderRole:"ORGANIZATION",
                title: title,
                description:description,
                hoursContributed: hoursContributed,
                createdAt: new Date()
            },
        });
    if (!org) {
        throw new Error("Error creating the Progress Update.");
    }

    return org;
}

export async function createOpportunity(orgId:string, name:string, category:string, description:string, candidateDesc:string, workType:WorkType,
        commitmentLevel: CommitmentLevel, length:string, deadlineDate:Date, availability:Prisma.InputJsonValue) {
    const org = await prisma.opportunity.create({
            data: {
                orgId:orgId,
                name:name,
                category:category,
                status: "OPEN",
                description:description,
                candidateDesc:candidateDesc,
                workType:workType,
                commitmentLevel:commitmentLevel,
                length:length,
                deadlineDate:deadlineDate,
                availability: availability,
                createdAt: new Date(),
                updatedAt: new Date()
            },
        });
    if (!org) {
        throw new Error("Error creating the Opportunity.");
    }

    return org;
}


export async function updateOpportunity(oppId:string, orgId:string, name:string, category:string, description:string, candidateDesc:string, workType:WorkType,
        commitmentLevel: CommitmentLevel, length:string, deadlineDate:Date, availability:Prisma.InputJsonValue) {
    const org = await prisma.opportunity.update({
        where:{id: oppId},
        data: {
            orgId:orgId,
            name:name,
            category:category,
            status: "OPEN",
            description:description,
            candidateDesc:candidateDesc,
            workType:workType,
            commitmentLevel:commitmentLevel,
            length:length,
            deadlineDate:deadlineDate,
            availability: availability,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        });
    if (!org) {
        throw new Error("Error updating the Opportunity.");
    }

    return org;
}
