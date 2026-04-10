/**
 * UserService.tsx
 * Client-side service for current user profile and avatar management
 */

import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { CurrentUserSchema, CurrentUserUpdateSchema } from "@volunteerly/shared";

export class UserService {
    /**
     * Fetches the authenticated user's profile from the server
     * @returns Promise with parsed CurrentUser
     */
    static async getCurrentUser() {
        const response = await api<unknown>("/current-user");
        const parsed = CurrentUserSchema.safeParse(response);

        return parsed;
    }

    /**
     * Creates or updates the current user's profile record
     * @param user - Updated user data to send
     * @returns Promise with parsed CurrentUser
     */
    static async update_create_User(user: CurrentUserUpdateSchema) {
        const response = await api<unknown>("/current-user", {
            method: "PUT",
            body: JSON.stringify(user),
        });
        const parsed = CurrentUserSchema.safeParse(response);

        return parsed;
    }

    /**
     * Deletes the current user's account entirely
     * @returns Promise that resolves when deletion is complete
     */
    static async deleteCurrentUser(): Promise<void> {
        await api<unknown>("/current-user", {
            method: "DELETE",
        });
    }

    /**
     * Uploads a new avatar image for the current user
     * @param formData - Form data containing the image file under the "image" key
     * @returns Promise with the uploaded file path or response
     */
    static async uploadAvatar(formData: FormData) {
        const response = await api<unknown>("/current-user/avatar", {
            method: "POST",
            body: formData,
        });
        return response;
    }

    /**
     * Generates a public avatar URL from Supabase storage for a given user
     * An optional version param can be appended to bust the browser cache after an update
     * @param userID - The user's ID used as the file name
     * @param version - Optional cache-busting version string or number
     * @returns Public URL string, or undefined if no userID was provided
     */
    static getAvatarURL(userID?: string, version?: number | string): string | undefined {
        if (userID === undefined) {
            return;
        }
        const {
            data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(`${userID}.jpeg`);
        return version ? `${publicUrl}?v=${version}` : publicUrl;
    }
}
