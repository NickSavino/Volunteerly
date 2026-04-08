import { supabase } from "@/lib/supabase";

export class AuthService {

    static async loginUserWithEmailPass(email:string, password:string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return {data, error}
    }

    static async SignUpUserWithEmailPass(email:string, password:string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        return {data, error}
    }

    static async changePassword(newPassword: string) {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            throw error
        }
    }
}