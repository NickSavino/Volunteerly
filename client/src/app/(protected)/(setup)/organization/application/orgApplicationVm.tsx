import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { CurrentOrganization, CurrentOrganizationUpdateSchema } from "@volunteerly/shared";
import { OrganizationService } from "@/services/OrganizationService";
import { toast } from "sonner";
import { useAppSession } from "@/providers/app-session-provider";

export function useOrgApplicationViewModel() {
  const router = useRouter();
  const { refresh } = useAppSession();
  const { session, loading, signOut } = useAuth();
  const [currentOrg, setCurrentOrg] = useState<CurrentOrganization>();
  const [address, setAddress] = useState({
    streetAdr: "",
    city:"",
    province: "AB",
    postalCode: ""
  })
  const [file, setFile] = useState<File | null>();


  const [error, setError] = useState<string | null>(null);
  const [bootstrapping, setBootStrapping] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadCurrentUser() {
        if (!session?.access_token || currentOrg) {
          setBootStrapping(false);
          return;
        };

        try {
          const org = await OrganizationService.getCurrentOrganization()

            if (!org.success) {
              console.error(org.error);
              setError("Received invalid user data from the server.");
              return;
          }

          const adrData = org.data.hqAdr?.split(", ") || []
          setAddress({
            streetAdr: adrData[0] || "",
            city: adrData[1] || "",
            province: adrData[2] || "AB",
            postalCode: adrData[3] || ""
          })
          setCurrentOrg(org.data)
        } catch (err) {
          console.error(err);
          setError("Failed to load organization.");
        } finally {
          setBootStrapping(false)
        }     
      }
      loadCurrentUser()
    },[session, currentOrg]);

  const isReadOnly = currentOrg?.status === "APPLIED" || currentOrg?.status === "VERIFIED" || currentOrg?.status === "REJECTED";

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
      e.preventDefault();

      if (isReadOnly || !currentOrg) {return}
      setSubmitting(true);
      setError(null);

      try {
          const createdOrg = CurrentOrganizationUpdateSchema.parse({
        ...currentOrg,
        hqAdr: `${address.streetAdr}, ${address.city}, ${address.province}, ${address.postalCode}`});

        const formData = new FormData();
        
        if (!file) {
          setError("Please upload a verification document.")
          return
        }

        formData.append("document", file);

          Object.entries(createdOrg).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });

        const {data, error, success} = await OrganizationService.apply(formData)

        if (!success) {
          setError("Error submitting application.");
          console.error(error);
          return;
        }

        await refresh();
        
        if (data.status == "VERIFIED") {
            toast.success("Application was automatically approved!", { position: "top-right" })
            router.replace("/organization");
            return;
        }
        toast.success("Application submitted, Awaiting moderator review", { position: "top-right" })
        router.replace("/organization/appliedDashboard");
      } catch (err) {
        console.error(err);
        setError("Error submitting application.")
      } finally {
        setSubmitting(false);
      }
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
        bootstrapping,
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