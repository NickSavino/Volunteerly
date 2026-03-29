import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { UserService } from "@/services/UserService";
import { useAuth } from "@/providers/auth-provider";
import { Application, CurrentOrganization, CurrentUser, CurrentUserSchema, Opportunity } from "@volunteerly/shared";
import { api } from "@/lib/api";
import { OrganizationService } from "@/services/OrganizationService";

export function useOrgViewOpportunityViewModel(id: string) {
  const router = useRouter();
  const { session, user, loading, signOut } = useAuth();
  const [currentUser, setCurrentUser] = useState<CurrentOrganization | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [opportunity, setOpportunity] = useState<Opportunity>()
  const [applications, setApplications] = useState<Application[]>([])

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login")
    }
  }, [loading, session, router]);

  useEffect(() => {
    async function loadCurrentUser() {
      if (!session?.access_token) return;
      try {
        const user = await UserService.getCurrentUser()

        if (!user.success) {
            console.error(user.error);
            setError("Received invalid user data from the server.");
            return;
        }

        if (user.data.role !== "ORGANIZATION") {
            router.replace("/bootstrap");
            return;
        }

        const org = await OrganizationService.getCurrentOrganization()
        
        if (!org.success) {
          console.error(org.error);
          setError("Received invalid user data from the server.");
          return;
        }
        if (org.data.status == "CREATED") {
            router.replace("/organization/application");
            return;
        } else if (org.data.status == "APPLIED") {
            router.replace("/organization/appliedDashboard");
            return;
        }
        setCurrentUser(org.data);
      } catch (error) {
        console.error(error);
        return
      }
    }
    loadCurrentUser();
    }, [session, router]);

    useEffect(() => {
      async function loadOpportunities() {

        const opp = await OrganizationService.getOpportunity(id)
        if (!opp.success) { 
          console.error(opp.error)
          setError("Failed to load opportunities."); return; }
        setOpportunity(opp.data);   
        
        if (opp.data.status == "OPEN") {
          const apps = await OrganizationService.getApplications(opp.data.id)
          if (!apps.success) { 
            console.error(apps.error)
            setError("Failed to load opportunities."); return; }
          setApplications(apps.data);   
        }
      }
      loadOpportunities()
    }, [id])

    return {loading, session, signOut, router, user, error, currentUser, opportunity, applications} 
}