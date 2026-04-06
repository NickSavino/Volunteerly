import { z } from "zod";

export const OrganizationStateSchema = z.enum([
  "CREATED",
  "APPLIED",
  "VERIFIED",
  "REJECTED",
]);

export const CountSchema = z.number();
export const TotalHoursSchema = z.object({
  _sum: z.object({
    hours: z.number().nullable(),
  }),
})
export const organizationAwardsSchema = z.record(z.string(), z.string());

export const OrganizationSchema = z.object({
  id: z.uuid(),
  orgName: z.string(),
  status: OrganizationStateSchema.optional(),

  charityNum: z.number().int(),
  docId: z.string(),

  contactName: z.string(),
  contactEmail: z.string(),
  contactNum: z.string(),

  hqAdr: z.string(),
  missionStatement: z.string(),
  causeCategory: z.string(),
  website: z.string(),

  impactHighlights: z.array(z.any()).optional(),
  rejectionReason: z.string().optional(),

  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const OrganizationsSchema = z.array(OrganizationSchema);
export type Organizations = z.infer<typeof OrganizationsSchema>;

export const CurrentOrganizationSchema = z.object({
  id: z.uuid(),
  orgName: z.string(),
  status: OrganizationStateSchema.optional(),

  charityNum: z.number().int(),
  docId: z.string(),

  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  contactNum: z.string().optional(),

  hqAdr: z.string().optional(),
  missionStatement: z.string().optional(),
  causeCategory: z.string().optional(),
  website: z.string().optional(),

  impactHighlights: z.array(z.any()).optional(),
  rejectionReason: z.string().optional(),

  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
});
export type CurrentOrganization = z.infer<typeof CurrentOrganizationSchema>;

export const CurrentOrganizationUpdateSchema = z.object({
  orgName: z.string(),
  charityNum: z.number().int().optional(),

  contactName: z.string().optional(),
  contactEmail: z.email().optional(),
  contactNum: z.string().optional(),

  hqAdr: z.string().optional(),
  missionStatement: z.string().optional(),
  causeCategory: z.string().optional(),
  website: z.string().optional(),

  impactHighlights: z.array(z.any()).optional(),
});
export type CurrentOrganizationUpdate = z.infer<typeof CurrentOrganizationUpdateSchema>;

export const ModeratorOrganizationListItemSchema = z.object({
  id: z.uuid(),
  orgName: z.string(),
  status: OrganizationStateSchema,

  charityNum: z.number().int().catch(0),
  docId: z.string().catch(""),

  website: z.string().catch(""),
  hqAdr: z.string().catch(""),
  causeCategory: z.string().catch(""),

  createdAt: z.string(),
  updatedAt: z.string(),
})
export type ModeratorOrganizationListItem = z.infer<typeof ModeratorOrganizationListItemSchema>;

export const ModeratorOrganizationListSchema = z.array(ModeratorOrganizationListItemSchema);
export type ModeratorOrganizationList = z.infer<typeof ModeratorOrganizationListSchema>;