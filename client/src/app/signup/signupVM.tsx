import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/AuthService";
import { CurrentOrganizationUpdateSchema, CurrentUserUpdateSchema, UpdateCurrentVolunteerSchema } from "@volunteerly/shared";
import { UserService } from "@/services/UserService";
import { VolunteerService } from "@/services/VolunteerService";
import { OrganizationService } from "@/services/OrganizationService";

export function useSignUpViewModel() {
 const router = useRouter();

    const [fName, setfName] = useState("");
    const [lName, setlName] = useState("");
    const [orgName, setorgName] = useState("");
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
            setError("Error Signing Up User.");
            return;
        }

        const createdUser = CurrentUserUpdateSchema.parse({
            email: email,
            role: role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const result = await UserService.update_create_User(createdUser);
        
        if (result.success) {
            if (role == "VOLUNTEER") {
                const createdVolunteer = UpdateCurrentVolunteerSchema.parse({
                    firstName: fName,
                    lastName: lName,
                });
                const result = await VolunteerService.update_create_Volunteer(createdVolunteer);
                if (result.success) {
                    console.log("Updated user:", result.data);

                    if (data.session) {
                        router.push("/volunteer");
                        return;
                    }

                } else {
                    console.error("Failed to parse volunteer:", result.error);
                }
            } else if (role == "ORGANIZATION") {
                const createdOrg = CurrentOrganizationUpdateSchema.parse({
                    orgName: orgName,
                });
                const result = await OrganizationService.update_create_Organization(createdOrg);
                if (result.success) {
                    if (data.session) {
                        router.push("/organization/application");
                        return;
                    }

                } else {
                    console.error("Failed to parse organization:", result.error);
                }
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
        orgName, 
        setorgName,
        role, 
        setRole,
        submitting,
        error,
        handleSubmit
    }
}