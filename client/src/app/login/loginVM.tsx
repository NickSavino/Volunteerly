import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/AuthService";

export function useLoginViewModel() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    //const authService = new AuthService()

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const {data, error} = await AuthService.loginUserWithEmailPass(email, password)

        setSubmitting(false);

        if (error) {
            setError(error.message);
            return;
        }

        router.push("/bootstrap");
    }
    return {
        email,
        setEmail,
        password,
        setPassword,
        submitting,
        error,
        handleSubmit
    }
}