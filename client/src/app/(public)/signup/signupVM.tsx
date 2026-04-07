import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/AuthService";
import { CurrentOrganizationUpdateSchema, CurrentUserUpdateSchema, UpdateCurrentVolunteerSchema } from "@volunteerly/shared";
import { UserService } from "@/services/UserService";
import { VolunteerService } from "@/services/VolunteerService";
import { OrganizationService } from "@/services/OrganizationService";
import { useAppSession } from "@/providers/app-session-provider";

export function useSignUpViewModel() {
    const router = useRouter();
    const { refresh } = useAppSession();

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

        try {
            const {data, error} = await AuthService.SignUpUserWithEmailPass(email, password)

            if (error) {
                setError("Error Signing Up User.");
                setSubmitting(false);
                return;
           }

            const createdUser = CurrentUserUpdateSchema.parse({
            email: email,
            role: role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            });

            const userResult = await UserService.update_create_User(createdUser);

            if (!userResult.success) {
                console.error("Failed to create user:", userResult.error);
                setError("Cannot sign-up, try again later.");
                setSubmitting(false);
                return;
            }

            if (role == "VOLUNTEER") {
                const createdVolunteer = UpdateCurrentVolunteerSchema.parse({
                    firstName: fName,
                    lastName: lName,
                });

                const volunteerResult = await VolunteerService.update_create_Volunteer(createdVolunteer);

                if (!volunteerResult.success) {
                    console.error("Failed to create volunteer:", volunteerResult.error);
                    setError("Cannot sign-up, try again later.");
                    setSubmitting(false);
                    return;
                } 
            } 
            else if (role == "ORGANIZATION") {
                const createdOrg = CurrentOrganizationUpdateSchema.parse({
                    orgName: orgName,
                });

                const orgResult = await OrganizationService.update_create_Organization(createdOrg);
                if (!orgResult.success) {
                    console.error("Failed to create organization:", orgResult.error);
                    setError("Cannot sign-up, try again later.");
                    setSubmitting(false);
                    return;
                } 
            }

            const nextRoute =
                role === "VOLUNTEER"
                    ? "/volunteer/experience-input"
                    : "/organization/application";
            
            router.replace(nextRoute)
        } catch (err) {
            console.error(err);
            setError("Cannot sign up. Try again later.")
        }
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