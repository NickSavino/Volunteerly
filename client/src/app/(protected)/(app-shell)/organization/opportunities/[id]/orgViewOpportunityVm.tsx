import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { UserService } from "@/services/UserService";
import { useAuth } from "@/providers/auth-provider";
import { Application, CurrentOrganization, CurrentUser, CurrentUserSchema, Opportunity, ProgressUpdate } from "@volunteerly/shared";
import { api } from "@/lib/api";
import { OrganizationService } from "@/services/OrganizationService";
import { toast } from "sonner";

export function useOrgViewOpportunityViewModel(id: string) {
  const router = useRouter();
  const { session, user, loading, signOut } = useAuth();
  const [currentUser, setCurrentUser] = useState<CurrentOrganization | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [opportunity, setOpportunity] = useState<Opportunity>()
  const [totalHours, setTotalHours] = useState(0)
  const [monetaryValue, setMonetaryValue] = useState(0)
  const [applications, setApplications] = useState<Application[]>([])
  const [fetching, setFetching] = useState(true)
  const [reload, setReload] = useState(false)
  const [progressUpdate, setProgressUpdate] = useState<ProgressUpdate>({
    title: "",
    description: "",
    hoursContributed: 0
  })

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
        setFetching(true)
        const opp = await OrganizationService.getOpportunity(id)
        if (!opp.success) { 
          console.error(opp.error)
          setError("Failed to load opportunities."); return; }

        const sortedApp = {
          ...opp.data,
          progressUpdates: opp.data?.progressUpdates?.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
        };

        setOpportunity(opp.data);   
        
        if (opp.data.status == "OPEN") {
          const apps = await OrganizationService.getApplications(opp.data.id)
          if (!apps.success) { 
            console.error(apps.error)
            setError("Failed to load opportunities."); return; }
          setApplications(apps.data);   
        }

        if (opp.data.status == "CLOSED"){
          const analytics = await OrganizationService.getOpportunityAnalytics(opp.data.id)
          if (analytics.success){
            setTotalHours(analytics.data?.hours)
            setMonetaryValue(analytics.data?.value)
          }
        }

        setFetching(false)
        setReload(false)
      }
      loadOpportunities()
    }, [id, reload])

    async function completeOpportunity() {
      if (opportunity?.status == "FILLED"){
        const completed_opp = await OrganizationService.completeOpportunity(opportunity.id)
        if (completed_opp.success) {
            toast.success("Opportunity completed!", { position: "top-right" })
            setReload(true)
            return
        }
      }
      setError("Cannot Complete Opportunity")
    }
    async function addUpdate() {
      if (progressUpdate){
        setFetching(true)
        const payload = {
          ...progressUpdate,
          opportunityId: opportunity?.id
        }
        const updated = await OrganizationService.addProgressUpdate(payload)
        if (updated.success){
          toast.success("Progress Updated Added!", { position: "top-right" })
          setProgressUpdate({
            title: "",
            description: "",
            hoursContributed: 0
          })
          setFetching(false)
          setReload(true)
          return
        }
      }
    }

    

    return {loading, fetching, session, signOut, router, user, error, currentUser, opportunity, applications, completeOpportunity, totalHours, monetaryValue, setProgressUpdate, addUpdate} 
}