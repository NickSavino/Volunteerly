import { supabase } from "@/lib/supabase";

export class AuthService {

    static async loginUserWithEmailPass(email:string, password:string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return {data, error}
    }


}