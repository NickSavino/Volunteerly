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
  const [file, setFile] = useState<File | null>();


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

  const isReadOnly = currentOrg?.status === "APPLIED" || currentOrg?.status === "VERIFIED";
  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {

      if (isReadOnly) {return}
      e.preventDefault();
      setSubmitting(true);
      setError(null);

      const createdOrg = CurrentOrganizationUpdateSchema.parse(currentOrg);

      const formData = new FormData();
      if (file && currentOrg){
        formData.append("document", file);

        Object.entries(currentOrg).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });

      const {data, error, success} = await OrganizationService.apply(formData)

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
      }

      router.push("/bootstrap");
  }

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


    return {
        loading,
        error,
        submitting,
        currentOrg,
        file,
        isReadOnly,
        setFile,
        setCurrentOrg,
        signOut,
        handleSubmit,
        viewSubmittedDoc
    } 
}