/**
 * signupVM.tsx
 * View model for the signup page - handles account creation for volunteers and organizations
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/AuthService";
import {
    CurrentOrganizationUpdateSchema,
    CurrentUserUpdateSchema,
    UpdateCurrentVolunteerSchema,
} from "@volunteerly/shared";
import { UserService } from "@/services/UserService";
import { VolunteerService } from "@/services/VolunteerService";
import { OrganizationService } from "@/services/OrganizationService";
import { useAuth } from "@/providers/auth-provider";

export function useSignUpViewModel() {
    const router = useRouter();
    const { session, loading } = useAuth();

    // Hold the intended next route until the session is fully established
    const [pendingRoute, setPendingRoute] = useState<string | null>(null);

    const [fName, setfName] = useState("");
    const [lName, setlName] = useState("");
    const [orgName, setorgName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("VOLUNTEER");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handles the full multi-step signup flow:
    // 1. Create the Supabase auth account
    // 2. Create the app-level user record
    // 3. Create the role-specific profile (volunteer or org)
    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const { data, error } = await AuthService.SignUpUserWithEmailPass(email, password);

            if (error) {
                setError("Error Signing Up User.");
                setSubmitting(false);
                return;
            }

            // Create the shared user record with role assignment
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

            // Create the role-specific profile record
            if (role == "VOLUNTEER") {
                const createdVolunteer = UpdateCurrentVolunteerSchema.parse({
                    firstName: fName,
                    lastName: lName,
                });

                const volunteerResult =
                    await VolunteerService.update_create_Volunteer(createdVolunteer);

                if (!volunteerResult.success) {
                    console.error("Failed to create volunteer:", volunteerResult.error);
                    setError("Cannot sign-up, try again later.");
                    setSubmitting(false);
                    return;
                }
            } else if (role == "ORGANIZATION") {
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

            // Queue the redirect - we wait for the session to be live before navigating
            if (data.session) {
                const nextRoute =
                    role === "VOLUNTEER"
                        ? "/volunteer/experience-input"
                        : "/organization/application";

                setPendingRoute(nextRoute);
                return;
            }
        } catch (err) {
            console.error(err);
            setError("Cannot sign up. Try again later.");
        }
    }

    // Navigate once the session is confirmed live after signup
    useEffect(() => {
        async function continueAfterAuth() {
            if (!pendingRoute) return;
            if (loading) return;
            if (!session?.access_token) return;

            router.replace(pendingRoute);
            setPendingRoute(null);
        }

        void continueAfterAuth();
    }, [pendingRoute, loading, session, router]);

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
        handleSubmit,
    };
}
