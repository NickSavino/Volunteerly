import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { UserService } from "@/services/UserService";
import { useAuth } from "@/providers/auth-provider";
import { CurrentOrganization, CurrentOrganizationUpdateSchema, CurrentUser, CurrentUserSchema } from "@volunteerly/shared";
import { api } from "@/lib/api";
import { OrganizationService } from "@/services/OrganizationService";
import { toast } from "sonner";

export function useOrgApplicationViewModel() {
  const router = useRouter();
  const { session, user, loading, signOut } = useAuth();
  const [currentOrg, setCurrentOrg] = useState<CurrentOrganization>();
  const [address, setAddress] = useState({
    streetAdr: "",
    city:"",
    province: "AB",
    postalCode: ""
  })
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
        const adrData = org.data.hqAdr?.split(", ") || []
        setAddress({streetAdr: adrData[0] || "", city: adrData[1] || "", province: adrData[2] || "AB", postalCode: adrData[3] || ""})
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
      const createdOrg = CurrentOrganizationUpdateSchema.parse({...currentOrg, hqAdr: `${address.streetAdr}, ${address.city}, ${address.province}, ${address.postalCode}`});
      const formData = new FormData();
      if (file && createdOrg){
        formData.append("document", file);

        Object.entries(createdOrg).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });

      const {data, error, success} = await OrganizationService.apply(formData)

      if (success) {
        if (data.status == "VERIFIED") {
            toast.success("Application was automatically approved!", { position: "top-right" })
            router.replace("/organization");
        }else {
          toast.success("Application submitted, Awaiting moderator review", { position: "top-right" })
          router.replace("/organization/appliedDashboard");
        }
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

      router.replace("/");
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
        router,
        setCurrentOrg,
        signOut,
        handleSubmit,
        viewSubmittedDoc,
        address, 
        setAddress
    } 
}