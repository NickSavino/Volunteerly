import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { UserService } from "@/services/UserService";
import { useAuth } from "@/providers/auth-provider";
import { Application, CurrentOrganization, CurrentUser, CurrentUserSchema, Opportunity } from "@volunteerly/shared";
import { api } from "@/lib/api";
import { OrganizationService } from "@/services/OrganizationService";
import { toast } from "sonner";

export function useOppApplicationViewModel(oppId: string, appId: string) {
  const router = useRouter();
  const { session, user, loading, signOut } = useAuth();
  const [currentUser, setCurrentUser] = useState<CurrentOrganization | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<Application>()
  const [fetching, setFetching] = useState(true)

  // TODO: remove this logic and tie it to useAppSession()
  useEffect(() => {
    async function loadCurrentUser() {
      if (!session?.access_token) return;
      try {
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
      async function loadApplication() {
        try {
          setFetching(true)
          const opp = await OrganizationService.getOpportunity(oppId)
          if (!(opp.data?.status == "OPEN")) {
            router.replace(`/organization/opportunities/${oppId}`);
            return;
          }
          const app = await OrganizationService.getApplication(appId)
          if (!app.success) { 
            console.error(app.error)
            setError("Failed to load application."); 
            setFetching(false)
            return; 
          }
          setApplication(app.data);   
          setFetching(false)
        }catch (error)  {
          console.log(error)
        }
      }
      loadApplication()
    }, [appId])

    async function selectVolunteer() {
      if (application?.volunteer?.id){
        setFetching(true)
        const updated_opp = await OrganizationService.selectOppVolunteer(oppId, application.volunteer.id)
        if (updated_opp.success) {
            toast.success("Opportunity is now filled. Selected Volunteer has been notified.", { position: "top-right" })
            setFetching(false)
            router.replace(`/organization/opportunities/${oppId}`);
            return;
        }
        setFetching(false)
      }
      setError("Cannot Select Volunteer")
    }
    return {loading, fetching, session, signOut, router, user, error, currentUser, application, selectVolunteer} 

  }