import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/AuthService";

export function useLoginViewModel() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const {error} = await AuthService.loginUserWithEmailPass(email, password)

        if (error) {
            setError(error.message);
            setSubmitting(false);
            return;
        }
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