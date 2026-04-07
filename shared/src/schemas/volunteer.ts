import { z } from "zod";

export const VolunteerSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  location: z.string(),
  bio: z.string(),
  availability: z.array(z.any()).optional(),
  hourlyValue: z.number().int(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
});
export type Volunteer = z.infer<typeof VolunteerSchema>;

export const CurrentVolunteerSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  location: z.string(),
  bio: z.string(),
  availability: z.array(z.any()).optional(),
  hourlyValue: z.number().int(),
  averageRating: z.number().default(0),
  reviewCount: z.number().int().default(0),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  skill_vector: z.array(z.number()).optional(),
});
export type CurrentVolunteer = z.infer<typeof CurrentVolunteerSchema>;

export const UpdateCurrentVolunteerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  availability: z.array(z.any()).optional(),
  hourlyValue: z.number().int().optional(),
});
export type UpdateCurrentVolunteer = z.infer<typeof UpdateCurrentVolunteerSchema>;

export const ExtractedSkillsSchema = z.object({
  technical: z.array(z.string()),
  nonTechnical: z.array(z.string()),
  hourlyRate: z.number().int(),
});
export type ExtractedSkills = z.infer<typeof ExtractedSkillsSchema>;

export const ConfirmSkillsSchema = z.object({
  technical: z.array(z.string()),
  nonTechnical: z.array(z.string()),
  workExperiences: z.array(z.object({
    jobTitle: z.string(),
    company: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    responsibilities: z.string(),
  })),
  educations: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    graduationYear: z.string(),
  })),
});
export type ConfirmSkills = z.infer<typeof ConfirmSkillsSchema>;

export const volunteerAwardsSchema = z.record(z.string(), z.string());