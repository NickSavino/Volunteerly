import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { UserService } from "@/services/UserService";
import { useAuth } from "@/providers/auth-provider";
import { CurrentOrganization, CurrentUser, CurrentUserSchema, Opportunity } from "@volunteerly/shared";
import { api } from "@/lib/api";
import { OrganizationService } from "@/services/OrganizationService";

export function useOrgProfileViewModel() {
  const router = useRouter();
  const { session, user, loading, signOut } = useAuth();
  const [currentOrg, setCurrentOrg] = useState<CurrentOrganization | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true)
  const [address, setAddress] = useState({
    streetAdr: "",
    city:"",
    province: "AB",
    postalCode: ""
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
        setCurrentOrg(org.data);
        const adrData = org.data.hqAdr?.split(", ") || []
        setAddress({streetAdr: adrData[0] || "", city: adrData[1] || "", province: adrData[2] || "AB", postalCode: adrData[3] || ""})
        console.log(org.data.impactHighlights)
        setFetching(false)
      } catch (error) {
        console.error(error);
        return
      }
    }
    loadCurrentUser();
    }, [session, router]);

    async function viewSubmittedDoc() {
    if (currentOrg?.docId) {
      try {
        const fileBlob = await OrganizationService.getOrganizationDocument(currentOrg.docId);

        const url = URL.createObjectURL(fileBlob);
        const newWindow = window.open(url, "_blank");
        const interval = setInterval(() => {
          if (newWindow?.closed) {
            clearInterval(interval);
            URL.revokeObjectURL(url);
          }
        }, 2000);

      } catch (error) {
        console.error("Failed to load document", error);
      }
    }
    return
   }

    return {loading, session,fetching, signOut, router, user, error, currentOrg, address, viewSubmittedDoc} 
}