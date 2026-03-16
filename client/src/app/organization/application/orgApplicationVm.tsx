import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { UserService } from "@/services/UserService";
import { useAuth } from "@/providers/auth-provider";
import { CurrentOrganization, CurrentOrganizationUpdateSchema, CurrentUser, CurrentUserSchema } from "@volunteerly/shared";
import { api } from "@/lib/api";
import { OrganizationService } from "@/services/OrganizationService";

export function useOrgApplicationViewModel() {
  const router = useRouter();
  const { session, user, loading, signOut } = useAuth();
  const [currentOrg, setCurrentOrg] = useState<CurrentOrganization>();


  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login")
    }
    }, [loading, session, router]);

  useEffect(() => {
    async function loadCurrentUser() {
        if (!session?.access_token || currentOrg) return;
        setSubmitting(true)
        const org = await OrganizationService.getCurrentOrganization()

        if (!org.success) {
            console.error(org.error);
            setError("Received invalid user data from the server.");
            return;
        }
        console.log(org.data)
        setCurrentOrg(org.data)
        setSubmitting(false)
      }
      loadCurrentUser()
    },[session]);

async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const createdOrg = CurrentOrganizationUpdateSchema.parse(currentOrg);
    
    const {data, error, success} = await OrganizationService.apply(createdOrg)

    if (success) {
      router.replace("/organization/appliedDashboard");
    }else {
      setError("Error submitting application.")
      console.error(error)
    }

    setSubmitting(false);

    if (error) {
        setError(error.message);
        return;
    }

    router.push("/bootstrap");
}
  

    return {
        loading,
        error,
        submitting,
        currentOrg,
        setCurrentOrg,
        signOut,
        handleSubmit
    } 
}