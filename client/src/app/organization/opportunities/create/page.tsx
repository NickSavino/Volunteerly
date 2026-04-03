"use client";

import { OrganizationNavbar } from "../../organization_navbar";
import { useCreateOpportunityViewModel } from "./orgCreateOpportunityVm";
import { OrganizationLoadingPage } from "../../organization_loading";
import OpportunityForm from "../opportunityForm";

export default function OppCreatePage() {
  const {        
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
    handleDayToggle,
    setDeadlineDate
  } = useCreateOpportunityViewModel()

  if (loading || submitting) {
    return <OrganizationLoadingPage />
  }

  return (
      <div className="min-h-screen">
          <title>Organization Application - Volunteerly</title>
            <OrganizationNavbar
                currentOrg={currentOrg}
                onSignOut={async () => {
                    await signOut();
                    router.push("/");
                }}
            />            
        <main className="w-full items-center h-full flex flex-col p-8 ">       
          <OpportunityForm
            opportunity={opportunity}
            handleDayToggle={handleDayToggle}
            setDeadlineDate={setDeadlineDate}
            setOpportunity={setOpportunity}
            editing={false}
            handleSubmit={handleSubmit}
            deadlineDate={deadlineDate}
          />     
        </main>
      </div>
    
  );
}
