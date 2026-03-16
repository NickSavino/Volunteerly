import { z } from "zod";

export const UserRoleSchema = z.enum(["VOLUNTEER", "ORGANIZATION", "MODERATOR"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
    id: z.uuid(),
    email: z.email(),
    role: UserRoleSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});
export type User = z.infer<typeof UserSchema>;

export const CurrentUserSchema = z.object({
    id: z.uuid(),
    email: z.email(),
    role: UserRoleSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
})

export type CurrentUser = z.infer<typeof CurrentUserSchema>

export const CurrentUserUpdateSchema = z.object({
    email: z.email(),
    role: UserRoleSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(), 
})
export type CurrentUserUpdateSchema = z.infer<typeof CurrentUserUpdateSchema>
