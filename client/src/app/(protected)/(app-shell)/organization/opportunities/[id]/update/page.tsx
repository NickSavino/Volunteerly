"use client";

import { LoadingScreen } from "@/components/common/loading-screen";
import { useCreateOpportunityViewModel } from "../../create/orgCreateOpportunityVm";
import OpportunityForm from "../../opportunityForm";
import { use } from "react";

export default function OppUpdatePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const {
        loading,
        submitting,
        opportunity,
        setOpportunity,
        handleSubmit,
        deadlineDate,
        handleDayToggle,
        setDeadlineDate,
    } = useCreateOpportunityViewModel(id);

    if (loading || submitting) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen">
            <title>Organization Application - Volunteerly</title>
            <main className="flex size-full flex-col items-center p-8">
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
