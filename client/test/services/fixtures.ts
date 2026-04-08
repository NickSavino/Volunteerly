export const UUID_A = "123e4567-e89b-12d3-a456-426614174000";
export const UUID_B = "123e4567-e89b-12d3-a456-426614174001";
export const ISO_DATE = "2026-01-01T00:00:00.000Z";

export const validCurrentUserResponse = {
    id: UUID_A,
    email: "person@example.com",
    role: "VOLUNTEER",
    status: "VERIFIED",
    createdAt: ISO_DATE,
    updatedAt: ISO_DATE,
};

export const validCurrentModeratorResponse = {
    id: UUID_A,
    firstName: "Mod",
    lastName: "Erator",
    createdAt: ISO_DATE,
    updatedAt: ISO_DATE,
};

export const validModeratorTicketResponse = {
    id: UUID_A,
    title: "Bug report",
    description: "desc",
    status: "OPEN",
    category: "BUG",
    urgencyRating: "MINOR",
    createdAt: ISO_DATE,
    issuerId: UUID_B,
    targetId: UUID_A,
};

export const validModeratorVolunteerResponse = {
    id: UUID_A,
    firstName: "Jane",
    lastName: "Doe",
    location: "Calgary",
    flaggedByDisplayName: "Org Name",
    latestFlagReason: "Spam",
    pastFlagsCount: 1,
    completedOpportunities: 2,
    averageRating: 4.5,
    state: "FLAGGED",
};

export const validOpportunityResponse = {
    id: UUID_A,
    orgId: UUID_B,
    volId: null,
    status: "OPEN",
    name: "Opportunity",
    category: "General",
    description: "desc",
    candidateDesc: "cand",
    workType: "REMOTE",
    commitmentLevel: "FLEXIBLE",
    hours: 2,
    length: "2 weeks",
    deadlineDate: null,
    availability: [],
    postedDate: ISO_DATE,
    createdAt: ISO_DATE,
    updatedAt: ISO_DATE,
};

export const validPublicOrgProfileResponse = {
    id: UUID_A,
    orgName: "Org",
    missionStatement: "Mission",
    causeCategory: "Community",
    website: "https://example.org",
    hqAdr: "Calgary",
    impactHighlights: [{ value: 10, label: "Volunteers" }],
    totalVolunteersHired: 12,
    activeOpportunities: 3,
    averageRating: 4.2,
    reviewCount: 5,
};

export const validModeratorOrganizationListItemResponse = {
    id: UUID_A,
    orgName: "Org",
    status: "APPLIED",
    charityNum: 123,
    docId: "doc.pdf",
    website: "https://example.org",
    hqAdr: "Calgary",
    causeCategory: "Community",
    createdAt: ISO_DATE,
    updatedAt: ISO_DATE,
};
