/**
 * organization-service.ts
 * Server-side data access and business logic for organizations and opportunities
 */

import { CommitmentLevel, OrganizationState, Prisma, WorkType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { supabase } from "../lib/supabase.js";
import { callDocumentAnalysis } from "./azure-service.js";
import { embedText } from "./gemini-service.js";
import { extractSkillsFromOpportunity } from "./groq-service.js";

/**
 * Finds an organization by its ID
 * @param orgId - The organization's user ID
 * @returns The organization record or null
 */
export async function getCurrentOrganization(orgId: string) {
    const org = await prisma.organization.findUnique({
        where: { id: orgId },
    });

    return org;
}

/**
 * Creates a new organization record with CREATED status
 * @param orgId - The user's ID (used as the org ID)
 * @param orgName - Display name of the organization
 * @returns The newly created organization
 */
export async function createCurrentOrganization(orgId: string, orgName: string) {
    const org = await prisma.organization.create({
        data: {
            id: orgId,
            orgName: orgName,
            status: OrganizationState.CREATED,
        },
    });
    if (!org) {
        throw new Error("Error creating the Organization.");
    }

    return org;
}

/**
 * Updates the public and contact details of an existing organization
 * @param orgId - Organization ID to update
 * @param contactName - Primary contact's name
 * @param contactEmail - Primary contact's email
 * @param contactNum - Primary contact's phone number
 * @param missionStmt - Organization mission statement
 * @param causeCat - Cause category (e.g. Education)
 * @param website - Organization website URL
 * @param impactHighlights - JSON array of impact stat objects
 * @param hqAdr - Headquarters address string
 * @returns The updated organization
 */
export async function updateCurrentOrganization(
    orgId: string,
    contactName: string,
    contactEmail: string,
    contactNum: string,
    missionStmt: string,
    causeCat: string,
    website: string,
    impactHighlights: Prisma.InputJsonValue,
    hqAdr: string,
) {
    const organization = await prisma.organization.update({
        where: { id: orgId },
        data: {
            contactName: contactName,
            contactEmail: contactEmail,
            contactNum: contactNum,
            missionStatement: missionStmt,
            causeCategory: causeCat,
            website: website,
            impactHighlights: impactHighlights,
            hqAdr: hqAdr,
        },
    });
    if (!organization) {
        throw new Error("Error updating the Organization.");
    }

    return organization;
}

/**
 * Submits an organization's verification application.
 * Uploads the document to storage, attempts auto-approval via Azure Document Intelligence,
 * then sets the status to VERIFIED or APPLIED accordingly.
 * @param orgId - Organization ID
 * @param orgName - Legal name of the organization
 * @param charityNum - CRA charity registration number
 * @param contactName - Primary contact name
 * @param contactEmail - Primary contact email
 * @param contactNum - Primary contact phone
 * @param missionStmt - Mission statement
 * @param causeCat - Cause category
 * @param website - Website URL
 * @param hqAdr - Headquarters address
 * @param file - Uploaded PDF document from multer
 * @returns The updated organization with new status
 */
export async function applyOrganization(
    orgId: string,
    orgName: string,
    charityNum: number,
    contactName: string,
    contactEmail: string,
    contactNum: string,
    missionStmt: string,
    causeCat: string,
    website: string,
    hqAdr: string,
    file: Express.Multer.File,
) {
    const savedFilePath = await saveFile(orgId, file);

    // Try to auto-approve by extracting and matching data from the submitted PDF
    const autoApprove = await autoApproval(orgName, charityNum, file);

    const status: OrganizationState = autoApprove ? "VERIFIED" : "APPLIED";

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
            hqAdr: hqAdr,
        },
    });

    if (!organization) {
        throw new Error("Error applying for the Organization.");
    }

    return organization;
}

/**
 * Attempts to auto-approve an organization by analyzing its submitted PDF with Azure DI.
 * Extracts the official name and charity number from the document and compares them
 * against what the org submitted. If they match and exist in the CRA DB, auto-approves.
 * @param orgName - Name the org submitted on the form
 * @param charityNum - Charity number the org submitted
 * @param file - The PDF uploaded for verification
 * @returns true if auto-approval criteria are met, false otherwise
 */
export async function autoApproval(orgName: string, charityNum: number, file: Express.Multer.File) {
    try {
        const result = await callDocumentAnalysis(file);

        // Look for specific paragraphs that contain the name and business number
        const officialNameParagraph = result.find((p: any) =>
            p.content.toLowerCase().includes("registered under the name"),
        );

        const businessNumberParagraph = result.find((p: any) =>
            p.content.toLowerCase().includes("business number is"),
        );

        // Parse the values out of the paragraph text
        const officialName =
            officialNameParagraph?.content.split(":")[1]?.trim().slice(0, -1) || null;
        const officialNumber = Number(
            businessNumberParagraph?.content.toLowerCase().split("business number is")[1]?.trim() ||
                null,
        );

        if (officialName == orgName && charityNum == officialNumber) {
            const exists = await checkCharityExistence(officialName, officialNumber);
            if (exists) {
                return true;
            } else {
                console.log("Values did not match CRA DB.", officialName, officialNumber);
                return false;
            }
        } else {
            console.log(
                "Values did not match those given.",
                officialName,
                orgName,
                charityNum,
                officialNumber,
            );
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}

/**
 * Checks if an organization exists in the registered charities table by name and number
 * @param orgName - Charity's legal name
 * @param charityNum - CRA registration number
 * @returns true if a matching charity record exists
 */
export async function checkCharityExistence(orgName: string, charityNum: number) {
    const charity = await prisma.registeredCharity.findFirst({
        where: {
            organizationName: orgName,
            registrationNumber: charityNum,
        },
    });

    return !!charity;
}

/**
 * Uploads an organization's verification document PDF to Supabase storage
 * @param orgId - Organization ID used to name the file
 * @param file - Multer file object with the PDF buffer
 * @returns The full storage path of the uploaded file
 */
export async function saveFile(orgId: string, file: Express.Multer.File) {
    const fileName = `org_${orgId}.pdf`;

    const { data, error } = await supabase.storage
        .from("organization-documents")
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true, // overwrite if they resubmit
        });

    if (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }
    return data.fullPath;
}

/**
 * Downloads a file from Supabase storage and returns it as a Buffer
 * @param bucket - The Supabase storage bucket name
 * @param filePath - The path within the bucket
 * @returns Buffer containing the file data
 */
export async function downloadFile(bucket: string, filePath: string) {
    console.log(filePath);
    const { data, error } = await supabase.storage.from(bucket).download(filePath);

    if (error) {
        console.log(error);
        throw new Error(`Failed to download file: ${error.message}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Sets an organization's status to VERIFIED (moderator approval action)
 * @param orgId - ID of the organization to approve
 * @returns The updated organization
 */
export async function approveOrganization(orgId: string) {
    const organization = await prisma.organization.update({
        where: { id: orgId },
        data: {
            status: OrganizationState.VERIFIED,
        },
    });
    if (!organization) {
        throw new Error("Error approving the Organization.");
    }

    return organization;
}

/**
 * Sets an organization's status to REJECTED with a reason (moderator rejection action)
 * @param orgId - ID of the organization to reject
 * @param rejectionReason - Message shown to the organization explaining the decision
 * @returns The updated organization
 */
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

/**
 * Returns all organizations with APPLIED status, sorted newest first
 * @returns Array of applied organizations
 */
export async function getAppliedOrganizations() {
    const organizations = await prisma.organization.findMany({
        where: { status: OrganizationState.APPLIED },
        orderBy: { createdAt: "desc" },
    });

    return organizations;
}

/**
 * Returns all organizations in the system, sorted newest first
 * @returns Array of all organizations
 */
export async function getAllOrganizations() {
    const organizations = await prisma.organization.findMany({
        orderBy: { createdAt: "desc" },
    });

    return organizations;
}

/**
 * Returns all opportunities for a given organization with volunteer and application count info
 * @param organizationId - The organization's ID
 * @returns Array of opportunities with nested volunteer and _count data
 */
export async function getAllOpportunities(organizationId: string) {
    return prisma.opportunity.findMany({
        where: { orgId: organizationId },
        include: {
            volunteer: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            },
            _count: {
                select: {
                    applications: true,
                },
            },
        },
    });
}

/**
 * Counts the total number of opportunities ever created by an organization
 * @param organizationId - The organization's ID
 * @returns Total opportunity count
 */
export async function countAllOpportunities(organizationId: string) {
    return prisma.opportunity.count({
        where: { orgId: organizationId },
    });
}

/**
 * Counts opportunities currently in FILLED status (active engagements)
 * @param organizationId - The organization's ID
 * @returns Count of filled opportunities
 */
export async function countActiveOpportunities(organizationId: string) {
    return prisma.opportunity.count({
        where: { orgId: organizationId, status: "FILLED" },
    });
}

/**
 * Sums all volunteer hours logged across an organization's opportunities
 * @param organizationId - The organization's ID
 * @returns Aggregate object with _sum.hours
 */
export async function sumTotalOpportunityHours(organizationId: string) {
    return prisma.opportunity.aggregate({
        where: { orgId: organizationId },
        _sum: {
            hours: true,
        },
    });
}

/**
 * Gets the average rating and total review count for a given organization
 * @param organizationId - The organization's ID (used as revieweeId)
 * @returns Object with avgRating and totalReviews
 */
export async function getReviewSummary(organizationId: string) {
    const stats = await prisma.review.aggregate({
        where: {
            revieweeId: organizationId,
        },
        _avg: {
            rating: true,
        },
        _count: {
            rating: true,
        },
    });

    return {
        avgRating: stats._avg.rating ?? 0,
        totalReviews: stats._count.rating,
    };
}

/**
 * Returns OPEN and FILLED opportunities for an organization with volunteer info
 * @param organizationId - The organization's ID
 * @returns Array of active opportunities
 */
export async function getActiveOpportunities(organizationId: string) {
    return prisma.opportunity.findMany({
        where: { orgId: organizationId, status: { in: ["OPEN", "FILLED"] } },
        include: {
            volunteer: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            },
            _count: {
                select: {
                    applications: true,
                },
            },
        },
    });
}

/**
 * Fetches a single opportunity by ID, scoped to a specific organization, with
 * volunteer details and all progress updates included
 * @param orgId - Organization ID (ownership check)
 * @param oppId - Opportunity ID to fetch
 * @returns Opportunity with volunteer and progressUpdates, or null
 */
export async function getOrgOpportunity(orgId: string, oppId: string) {
    const org = await prisma.opportunity.findFirst({
        where: { id: oppId, orgId: orgId },
        include: {
            volunteer: {
                select: { id: true, firstName: true, lastName: true },
            },
            progressUpdates: {
                select: {
                    id: true,
                    senderRole: true,
                    title: true,
                    description: true,
                    hoursContributed: true,
                    createdAt: true,
                },
            },
        },
    });
    return org;
}

/**
 * Returns all applications for a given opportunity, with basic volunteer info
 * @param orgId - Organization ID (ownership check via related opportunity)
 * @param oppId - Opportunity ID
 * @returns Array of applications
 */
export async function getApplications(orgId: string, oppId: string) {
    const org = await prisma.application.findMany({
        where: { oppId: oppId, opportunity: { orgId: orgId } },
        include: {
            volunteer: {
                select: { id: true, firstName: true, lastName: true, bio: true },
            },
        },
    });
    return org;
}

/**
 * Fetches a detailed view of a single application, including the volunteer's
 * full profile with experience, education, and ratings
 * @param orgId - Organization ID (ownership check)
 * @param appId - Application ID to fetch
 * @returns Detailed application, or null
 */
export async function getOrgApplication(orgId: string, appId: string) {
    const org = await prisma.application.findFirst({
        where: { id: appId, opportunity: { orgId: orgId } },
        include: {
            volunteer: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    bio: true,
                    location: true,
                    availability: true,
                    averageRating: true,
                    workExperiences: {
                        select: {
                            id: true,
                            jobTitle: true,
                            company: true,
                            startDate: true,
                            endDate: true,
                            responsibilities: true,
                        },
                    },
                    educations: {
                        select: {
                            id: true,
                            institution: true,
                            degree: true,
                            graduationYear: true,
                        },
                    },
                },
            },
        },
    });
    return org;
}

/**
 * Verifies that a volunteer has applied to a specific opportunity owned by an org
 * Used to validate before selecting a volunteer
 * @param orgId - Organization ID (ownership check)
 * @param oppId - Opportunity ID
 * @param vltId - Volunteer ID
 * @returns The application if found, or null
 */
export async function getOppVltApplication(orgId: string, oppId: string, vltId: string) {
    const app = await prisma.application.findFirst({
        where: { oppId: oppId, volId: vltId, opportunity: { orgId: orgId } },
    });
    return app;
}

/**
 * Assigns a volunteer to an opportunity and sets its status to FILLED
 * @param oppId - Opportunity ID
 * @param vltId - Volunteer ID to assign
 * @returns The updated opportunity
 */
export async function selectOppVolunteer(oppId: string, vltId: string) {
    const organization = await prisma.opportunity.update({
        where: { id: oppId },
        data: {
            volId: vltId,
            status: "FILLED",
            updatedAt: new Date(),
        },
    });
    if (!organization) {
        throw new Error("Error selecting the Volunteer.");
    }

    return organization;
}

/**
 * Marks an opportunity as CLOSED, tallies up total hours from progress updates,
 * and adds a final "Opportunity Completed" progress entry
 * @param oppId - Opportunity ID to complete
 * @returns The updated opportunity
 */
export async function completeOpportunity(oppId: string) {
    // Sum all logged hours from progress updates before closing
    const updateTotals = await prisma.progressUpdate.aggregate({
        where: {
            opportunityId: oppId,
        },
        _sum: {
            hoursContributed: true,
        },
    });

    const totalHours = updateTotals._sum.hoursContributed ?? 0;

    const organization = await prisma.opportunity.update({
        where: { id: oppId },
        data: {
            status: "CLOSED",
            updatedAt: new Date(),
            hours: totalHours,
        },
    });
    if (!organization) {
        throw new Error("Error completing Opportunity.");
    }

    // Look up the org to attach the completion progress entry
    const opp = await prisma.opportunity.findUnique({
        where: { id: oppId },
        select: { orgId: true },
    });

    if (opp?.orgId) {
        await prisma.progressUpdate.create({
            data: {
                opportunityId: oppId,
                senderId: opp.orgId,
                senderRole: "ORGANIZATION",
                title: "Opportunity Completed",
                description: "The organization has marked this opportunity as complete.",
                hoursContributed: 0,
            },
        });
    }

    return organization;
}

/**
 * Returns hour and monetary value analytics for a completed opportunity.
 * Monetary value is hours times the volunteer's hourly market rate.
 * @param organizationId - Organization ID (ownership check)
 * @param opportunityId - Opportunity ID
 * @returns Object with hours and value fields
 */
export async function getOpportunityAnalytics(organizationId: string, opportunityId: string) {
    const opp = await prisma.opportunity.findFirst({
        where: { orgId: organizationId, id: opportunityId },
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
        value: opp.hours * (opp.volunteer?.hourlyValue || 0),
    };
}

/**
 * Creates a progress update for an active opportunity, incrementing the opportunity's total hours
 * @param orgId - Organization ID (used as sender)
 * @param oppId - Opportunity ID
 * @param title - Summary title for the update
 * @param description - Detailed description of progress made
 * @param hoursContributed - Hours contributed this update
 * @returns The created progress update record
 */
export async function createOrgProgressUpdate(
    orgId: string,
    oppId: string,
    title: string,
    description: string,
    hoursContributed: number,
) {
    // Increment running hour total directly on the opportunity record
    await prisma.opportunity.update({
        where: { id: oppId },
        data: {
            hours: { increment: hoursContributed },
        },
    });

    const org = await prisma.progressUpdate.create({
        data: {
            opportunityId: oppId,
            senderId: orgId,
            senderRole: "ORGANIZATION",
            title: title,
            description: description,
            hoursContributed: hoursContributed,
            createdAt: new Date(),
        },
    });
    if (!org) {
        throw new Error("Error creating the Progress Update.");
    }

    return org;
}

/**
 * Creates a new opportunity posting. After creation, asynchronously extracts skills
 * using Groq and generates an embedding vector via Gemini for AI-powered matching.
 * @param orgId - Organization posting the opportunity
 * @param name - Opportunity name
 * @param category - Category/domain of work
 * @param description - Full description of the opportunity
 * @param candidateDesc - Description of the ideal candidate
 * @param workType - IN_PERSON, REMOTE, or HYBRID
 * @param commitmentLevel - FLEXIBLE, PART_TIME, or FULL_TIME
 * @param length - Duration string (Days, Months, Years, Ongoing)
 * @param deadlineDate - Application deadline
 * @param availability - Days of the week available
 * @returns The created opportunity
 */
export async function createOpportunity(
    orgId: string,
    name: string,
    category: string,
    description: string,
    candidateDesc: string,
    workType: WorkType,
    commitmentLevel: CommitmentLevel,
    length: string,
    deadlineDate: Date,
    availability: Prisma.InputJsonValue,
) {
    const org = await prisma.opportunity.create({
        data: {
            orgId: orgId,
            name: name,
            category: category,
            status: "OPEN",
            description: description,
            candidateDesc: candidateDesc,
            workType: workType,
            commitmentLevel: commitmentLevel,
            length: length,
            deadlineDate: deadlineDate,
            availability: availability,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });
    if (!org) {
        throw new Error("Error creating the Opportunity.");
    }

    // Fire-and-forget: generate the AI skill vector for matching in the background
    // We don't block the response on this since it can take a moment
    (async () => {
        try {
            const skills = await extractSkillsFromOpportunity(
                name,
                category,
                description,
                candidateDesc,
            );
            const allSkills = [...skills.technical, ...skills.nonTechnical].join(", ");
            const vector = await embedText(allSkills);
            await prisma.$executeRaw`
                UPDATE opportunities
                SET skill_vector = ${JSON.stringify(vector)}::vector
                WHERE id = ${org.id}
            `;
        } catch (err) {
            console.warn("Failed to embed opportunity skill vector:", err);
        }
    })();

    return org;
}

/**
 * Updates an existing opportunity's details
 * @param oppId - Opportunity ID to update
 * @param orgId - Organization ID (used to re-scope ownership)
 * @param name - New opportunity name
 * @param category - New category
 * @param description - New description
 * @param candidateDesc - New candidate description
 * @param workType - Updated work type
 * @param commitmentLevel - Updated commitment level
 * @param length - Updated duration
 * @param deadlineDate - Updated deadline
 * @param availability - Updated availability days
 * @returns The updated opportunity
 */
export async function updateOpportunity(
    oppId: string,
    orgId: string,
    name: string,
    category: string,
    description: string,
    candidateDesc: string,
    workType: WorkType,
    commitmentLevel: CommitmentLevel,
    length: string,
    deadlineDate: Date,
    availability: Prisma.InputJsonValue,
) {
    const org = await prisma.opportunity.update({
        where: { id: oppId },
        data: {
            orgId: orgId,
            name: name,
            category: category,
            status: "OPEN",
            description: description,
            candidateDesc: candidateDesc,
            workType: workType,
            commitmentLevel: commitmentLevel,
            length: length,
            deadlineDate: deadlineDate,
            availability: availability,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });
    if (!org) {
        throw new Error("Error updating the Opportunity.");
    }

    return org;
}

/**
 * Posts a star rating review from an organization for a volunteer.
 * Prevents duplicate reviews, then recalculates and updates the volunteer's average rating.
 * @param issuerId - Organization ID posting the review
 * @param revieweeId - Volunteer ID being reviewed
 * @param opportunityId - Opportunity the review is associated with
 * @param rating - Numeric rating (1-5)
 */
export async function orgPostReview(
    issuerId: string,
    revieweeId: string,
    opportunityId: string,
    rating: number,
) {
    const existing = await prisma.review.findUnique({
        where: { issuerId_opportunityId: { issuerId, opportunityId } },
    });
    if (existing) throw new Error("ALREADY_REVIEWED");

    await prisma.review.create({
        data: { issuerId, revieweeId, opportunityId, rating },
    });

    // Recalculate the volunteer's average rating across all reviews
    const allReviews = await prisma.review.findMany({
        where: { revieweeId },
        select: { rating: true },
    });

    const newAverage = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await prisma.volunteer.update({
        where: { id: revieweeId },
        data: { averageRating: newAverage },
    });
}

/**
 * Flags a volunteer from an organization's perspective. Creates a flag record,
 * a volunteer report, and updates the volunteer's status to FLAGGED if not already.
 * Runs inside a transaction to keep all related writes consistent.
 * @param issuerId - Organization ID reporting the issue
 * @param flaggedUserId - Volunteer ID being flagged
 * @param opportunityId - Opportunity context for the flag
 * @param reason - Description of the issue
 */
export async function orgPostFlag(
    issuerId: string,
    flaggedUserId: string,
    opportunityId: string,
    reason: string,
) {
    const existing = await prisma.flag.findUnique({
        where: { flagIssuerId_opportunityId: { flagIssuerId: issuerId, opportunityId } },
    });
    if (existing) throw new Error("ALREADY_FLAGGED");

    return prisma.$transaction(async (tx) => {
        const flag = await tx.flag.create({
            data: { flagIssuerId: issuerId, flaggedUserId, opportunityId, reason },
        });

        const flaggedVolunteer = await tx.volunteer.findUnique({
            where: { id: flaggedUserId },
            select: { id: true, status: true },
        });

        if (flaggedVolunteer) {
            await tx.volunteerReport.create({
                data: {
                    reportedUserId: flaggedUserId,
                    reportingUserId: issuerId,
                    reason,
                },
            });

            // Only update status if not already flagged to avoid redundant writes
            if (flaggedVolunteer.status !== "FLAGGED") {
                await tx.volunteer.update({
                    where: { id: flaggedUserId },
                    data: { status: "FLAGGED" },
                });
            }

            await tx.user.updateMany({
                where: { id: flaggedUserId, status: { not: "FLAGGED" } },
                data: { status: "FLAGGED" },
            });
        }

        return flag;
    });
}