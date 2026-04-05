"use client";

import { OrganizationLoadingPage } from "../../../organization_loading";
import { OrganizationNavbar } from "../../../organization_navbar";
import { useCreateOpportunityViewModel } from "../../create/orgCreateOpportunityVm";
import OpportunityForm from "../../opportunityForm";
import { use } from "react";

export default function OppUpdatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
    const { id } = use(params);
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
    } = useCreateOpportunityViewModel(id)

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
                editing={true}
                handleSubmit={handleSubmit}
                deadlineDate={deadlineDate}
            />     
            </main>
        </div>
        
    );
}
