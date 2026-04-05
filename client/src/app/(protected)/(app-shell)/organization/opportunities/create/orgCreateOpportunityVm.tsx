import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { UserService } from "@/services/UserService";
import { useAuth } from "@/providers/auth-provider";
import { CurrentOrganization, CurrentOrganizationUpdateSchema, CurrentUser, CurrentUserSchema, Opportunity, OpportunitySchema, UpdateOpportunitySchema } from "@volunteerly/shared";
import { api } from "@/lib/api";
import { OrganizationService } from "@/services/OrganizationService";
import { toast } from "sonner";

export function useCreateOpportunityViewModel(oppId?: string) {
  const router = useRouter();
  const { session, user, loading, signOut } = useAuth();
  const [currentOrg, setCurrentOrg] = useState<CurrentOrganization>();
  const [opportunity, setOpportunity] = useState<UpdateOpportunitySchema>(
    {
      orgId: "",
      name: "",
      category: "",
      description: "",
      candidateDesc: "",
      workType: "IN_PERSON",   
      commitmentLevel: "FLEXIBLE",
      length: "Days",
      deadlineDate: new Date(),    
      availability: [],    
    }
  )  
  const [deadlineDate, setDeadlineDate] = useState("")
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

        if (oppId) {
          const opp = await OrganizationService.getOpportunity(oppId)
          setOpportunity(opp.data as UpdateOpportunitySchema)
          setDeadlineDate(opp.data?.deadlineDate?.toLocaleDateString('en-CA') || "")
        }

        setSubmitting(false)
      }
      loadCurrentUser()
    },[session, router]);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    if (opportunity && currentOrg) {
        setSubmitting(true);
        setError(null);
        
        if (oppId){
          const orgId = currentOrg.id
          const deadlineDate = new Date(opportunity.deadlineDate)
          const opp: UpdateOpportunitySchema = {
            ...opportunity,
            orgId: orgId,
            deadlineDate: deadlineDate
          }
          const {data, error, success} = await OrganizationService.updateOpportunity(oppId, opp)

          if (success) {
              toast.success("Opportunity Successfully Updated!", { position: "top-right" })
              router.replace(`/organization/opportunities/${oppId}`);
              return
          }else {          
              setError("Error updating Opportunity.")
              console.error(error)
          }
        } else {
          const orgId = currentOrg.id
          const deadlineDate = new Date(opportunity.deadlineDate)
          const opp: UpdateOpportunitySchema = {
            ...opportunity,
            orgId: orgId,
            deadlineDate: deadlineDate
          }
          const {data, error, success} = await OrganizationService.addOpportunity(opp)
          if (success) {
              toast.success("Opportunity Successfully Created!", { position: "top-right" })
              router.replace("/organization/opportunities");
              return
          }else {          
              setError("Error creating Opportunity.")
              console.error(error)
          }
        }
        setSubmitting(false);
    }
    }
    async function handleDayToggle(day: string) {
      if (opportunity.availability.includes(day)){
        const newAv = opportunity.availability.filter(d => d != day)
        setOpportunity((prev) => prev ? { ...prev, availability: newAv}: prev)
      }else {
        const newAv = [...(opportunity.availability || []), day]
        setOpportunity((prev) => prev ? { ...prev, availability: newAv}: prev)
      }
    }

    return {
        loading,
        error,
        submitting,
        currentOrg,
        router,
        opportunity,
        setOpportunity,
        signOut,
        handleSubmit,
        deadlineDate, 
        setDeadlineDate,
        handleDayToggle
    } 
}