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

  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
});
export type CurrentVolunteer = z.infer<typeof CurrentVolunteerSchema>;

export const UpdateCurrentVolunteerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),

  location: z.string().optional(),
  bio: z.string().optional(),

  availability: z.array(z.any()).optional().optional(),

  hourlyValue: z.number().int().optional(),
});
export type UpdateCurrentVolunteer = z.infer<typeof UpdateCurrentVolunteerSchema>;
