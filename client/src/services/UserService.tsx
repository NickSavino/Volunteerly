import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { CurrentUser, CurrentUserSchema } from "@volunteerly/shared";


export class UserService {

    static async getCurrentUser() {
        const response = await api<unknown>("/current-user");
        const parsed = CurrentUserSchema.safeParse(response)

        return parsed
    }

}