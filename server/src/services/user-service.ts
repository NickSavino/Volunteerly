/**
 * user-service.ts
 * Server-side data access for user accounts, auth deletion, and avatar storage
 */

import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { supabase } from "../lib/supabase.js";
import { getDisplayName } from "./helpers/service-utils.js";
import { chatUserArgs } from "./helpers/prisma-shapes.js";

/**
 * Finds a user by ID
 * @param userId - The user's ID
 * @returns The user record or null
 */
export async function getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    return user;
}

/**
 * Creates a new application user record after Supabase auth signup
 * @param userId - Auth user ID to use as the primary key
 * @param userRole - Role string (VOLUNTEER, ORGANIZATION, MODERATOR, ADMIN)
 * @param email - User's email address
 * @returns The created user
 */
export async function createCurrentUser(userId: string, userRole: string, email: string) {
    const user = await prisma.user.create({
        data: {
            id: userId,
            email: email,
            // Fall back to VOLUNTEER if no role was provided
            role: userRole ? (userRole as UserRole) : UserRole.VOLUNTEER,
        },
    });
    if (!user) {
        throw new Error("Error creating the User.");
    }

    return user;
}

/**
 * Updates an existing user's role and email
 * @param userId - User ID to update
 * @param userRole - New role string
 * @param email - New email address
 * @returns The updated user
 */
export async function updateCurrentUser(userId: string, userRole: string, email: string) {
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            email: email,
            role: userRole ? (userRole as UserRole) : UserRole.VOLUNTEER,
        },
    });
    if (!user) {
        throw new Error("Error updating the User.");
    }

    return user;
}

/**
 * Fully deletes a user account. This is a multi-step cleanup:
 * 1. Removes their avatar from Supabase storage
 * 2. Nullifies their sent chat messages (preserving message history with a name snapshot)
 * 3. Removes them from all chat conversations
 * 4. Deletes any moderator record
 * 5. Clears their name from open tickets
 * 6. Deletes the Supabase auth account
 *
 * Steps 2-5 run inside a transaction to keep the DB consistent.
 * @param userId - ID of the user to delete
 */
export async function deleteCurrentUser(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        ...chatUserArgs,
    });

    // Remove avatar file - we don't care if this fails (user may not have one)
    await supabase.storage
        .from("avatars")
        .remove([`${userId}.jpeg`])
        .catch(() => {});

    // Capture the display name and role before deletion for message history snapshots
    const deletedDisplayName = getDisplayName(user);
    const deletedRole = user.role;

    await prisma.$transaction(async (tx) => {
        // Clear user reference from tickets they were the subject of
        await tx.ticket.updateMany({
            where: { targetId: userId },
            data: { targetId: null },
        });

        // Anonymize sent chat messages rather than deleting them (preserves conversation context)
        await tx.chatMessage.updateMany({
            where: { senderId: userId },
            data: {
                senderId: null,
                senderDisplayNameSnapshot: deletedDisplayName,
                senderRoleSnapshot: deletedRole,
            },
        });

        // Remove from all conversation participant lists
        await tx.chatConversationParticipant.deleteMany({
            where: { userId },
        });

        // Remove any moderator-specific record if applicable
        await tx.moderator.deleteMany({
            where: { id: userId },
        });
    });

    // Finally delete from Supabase auth - must be last since other steps depend on the user existing
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
        throw new Error(`Failed to delete auth user: ${error.message}`);
    }
}

/**
 * Uploads a user's avatar image to Supabase storage, overwriting any existing one
 * @param userId - User ID (used as the file name)
 * @param file - Multer file containing the image buffer
 * @returns The full storage path of the uploaded avatar
 */
export async function saveAvatar(userId: string, file: Express.Multer.File) {
    const fileName = `${userId}.jpeg`;

    const { data, error } = await supabase.storage.from("avatars").upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true, // overwrite existing avatar
    });

    if (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }
    return data.fullPath;
}
