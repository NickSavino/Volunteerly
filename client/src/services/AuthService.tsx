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

}