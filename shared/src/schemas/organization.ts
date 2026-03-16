import { z } from "zod";

export const OrganizationStateSchema = z.enum([
  "CREATED",
  "APPLIED",
  "VERIFIED",
]);


export const OrganizationSchema = z.object({
  id: z.uuid(),
  orgName: z.string(),
  status: OrganizationStateSchema.optional(),

  charityNum: z.number().int(),
  docId: z.string(),

  contactName: z.string(),
  contactEmail: z.email(),
  contactNum: z.number().int(),

  hqAdr: z.string(),
  missionStatement: z.string(),
  causeCategory: z.string(),
  website: z.string(),

  impactHighlights: z.array(z.any()).optional(),

  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const CurrentOrganizationSchema = z.object({
  id: z.uuid(),
  orgName: z.string(),
  status: OrganizationStateSchema.optional(),

  charityNum: z.number().int(),
  docId: z.string(),

  contactName: z.string(),
  contactEmail: z.string(),
  contactNum: z.number().int(),

  hqAdr: z.string(),
  missionStatement: z.string(),
  causeCategory: z.string(),
  website: z.string(),

  impactHighlights: z.array(z.any()).optional(),

  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
})

export type CurrentOrganization = z.infer<typeof CurrentOrganizationSchema>

export const CurrentOrganizationUpdateSchema = z.object({
  orgName: z.string(),
  status: OrganizationStateSchema.optional(),

  contactName: z.string().optional(),
  contactEmail: z.email().optional(),
  contactNum: z.number().int().optional(),

  hqAdr: z.string().optional(),
  missionStatement: z.string().optional(),
  causeCategory: z.string().optional(),
  website: z.string().optional(),

  impactHighlights: z.array(z.any()).optional().optional(),
})
export type CurrentOrganizationUpdateSchema = z.infer<typeof CurrentOrganizationUpdateSchema>
