import { z } from "zod";

export const UserRoleSchema = z.enum(["VOLUNTEER", "ORGANIZATION", "MODERATOR", "ADMIN"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const AccountStateSchema = z.enum(["VERIFIED", "UNVERIFIED", "FLAGGED", "BANNED"]);
export type AccountState = z.infer<typeof AccountStateSchema>;

export const UserSchema = z.object({
    id: z.uuid(),
    email: z.email(),
    role: UserRoleSchema,
    status: AccountStateSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});
export type User = z.infer<typeof UserSchema>;

export const CurrentUserSchema = z.object({
    id: z.uuid(),
    email: z.email(),
    role: UserRoleSchema,
    status: AccountStateSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});
export type CurrentUser = z.infer<typeof CurrentUserSchema>;

export const CurrentUserUpdateSchema = z.object({
    email: z.email(),
    role: UserRoleSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});
export type CurrentUserUpdateSchema = z.infer<typeof CurrentUserUpdateSchema>;