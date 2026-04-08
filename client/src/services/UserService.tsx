import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { CurrentUserSchema, CurrentUserUpdateSchema } from "@volunteerly/shared";


export class UserService {
    static async getCurrentUser() {
        const response = await api<unknown>("/current-user");
        const parsed = CurrentUserSchema.safeParse(response)

        return parsed
    }

    static async update_create_User(user: CurrentUserUpdateSchema) {
        const response = await api<unknown>("/current-user", {
            method:"PUT",
            body: JSON.stringify(user)
        });
        const parsed = CurrentUserSchema.safeParse(response)

        return parsed
    }

    static async deleteCurrentUser(): Promise<void> {
        await api<unknown>("/current-user", {
            method:"DELETE",
        })
    }

    static async uploadAvatar(formData: FormData) {
        const response = await api<unknown>("/current-user/avatar", {
            method: "POST",
            body: formData
        });
        return response;
    }

    static getAvatarURL(userID?: string, version?: number | string) : string | undefined {
        if (userID === undefined) {
            return
        }
        const {data: {publicUrl}} = supabase.storage.from('avatars').getPublicUrl(`${userID}.jpeg`)
        return version ? `${publicUrl}?v=${version}` : publicUrl;
    }
}