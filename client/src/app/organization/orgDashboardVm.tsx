import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { UserService } from "@/services/UserService";
import { useAuth } from "@/providers/auth-provider";
import { CurrentOrganization, CurrentUser, CurrentUserSchema, Opportunity } from "@volunteerly/shared";
import { api } from "@/lib/api";
import { OrganizationService } from "@/services/OrganizationService";

export function useOrgDashboardViewModel() {
  const router = useRouter();
  const { session, user, loading, signOut } = useAuth();
  const [currentUser, setCurrentUser] = useState<CurrentOrganization | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [totalOpps, setTotalOpps] = useState(0)
  const [activeVlt, setActiveVlt] = useState(0)
  const [totalHours, setTotalHours] = useState(0)


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

        const opps = await OrganizationService.getActiveOpportunities()
        if (!opps.success) { 
          console.error(opps.error)
          setError("Failed to load opportunities."); 
        }else {
          setOpportunities(opps.data);   
        }
        
        const totalOpps = await OrganizationService.countAllOpportunities()
        if (!totalOpps.success) { 
          setError("Failed to get total opportunities."); 
        }else{
          setTotalOpps(totalOpps.data)
        }
        
        const hours = await OrganizationService.sumTotalHours()
        if (!hours.success) { 
          setError("Failed to get hours total.")
        }else {
          setTotalHours(hours.data._sum.hours || 0)
        }

        const actVolunteers = await OrganizationService.countActiveVolunteers()
        if (!actVolunteers.success) { 
          setError("Failed to get active volunteer count.");
        }else {
          setActiveVlt(actVolunteers.data)
        }

        setFetching(false)        
      }
      loadOpportunities()
    }, [])



    return {loading, session,fetching, signOut, router, user, error, currentUser, opportunities, totalOpps, totalHours, activeVlt} 
}