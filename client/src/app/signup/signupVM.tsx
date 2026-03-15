import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/AuthService";
import { CurrentUserUpdateSchema } from "@volunteerly/shared";
import { UserService } from "@/services/UserService";

export function useSignUpViewModel() {
 const router = useRouter();

    const [fName, setfName] = useState("");
    const [lName, setlName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("VOLUNTEER");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const {data, error} = await AuthService.SignUpUserWithEmailPass(email, password)

        setSubmitting(false);

        if (error) {
            console.log(error.message)
            setError(error.message);
            return;
        }

        const createdUser = CurrentUserUpdateSchema.parse({
            email: email,
            firstName: fName,
            lastName: lName,
            role: role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const result = await UserService.update_create_User(createdUser);
        
        if (result.success) {
            console.log("Updated user:", result.data);
            if (data.session) {
                router.push("/bootstrap");
                return;
            }
        } else {
            console.error("Failed to parse user:", result.error);
            setError("Cannot sign-up, try again later.")
            //Add section to delete user-auth if not logged in
        }


        router.push("/login")
    }
    return {
        email,
        setEmail,
        password,
        setPassword,
        fName,
        setfName,
        lName,
        setlName,
        role, 
        setRole,
        submitting,
        error,
        handleSubmit
    }
}