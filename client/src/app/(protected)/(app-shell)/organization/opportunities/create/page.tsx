"use client";

import { useCreateOpportunityViewModel } from "./orgCreateOpportunityVm";
import OpportunityForm from "../opportunityForm";
import { LoadingScreen } from "@/components/common/loading-screen";

export default function OppCreatePage() {
    const {
        loading,
        submitting,
        opportunity,
        setOpportunity,
        handleSubmit,
        deadlineDate,
        handleDayToggle,
        setDeadlineDate,
    } = useCreateOpportunityViewModel();

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
                    editing={false}
                    handleSubmit={handleSubmit}
                    deadlineDate={deadlineDate}
                />
            </main>
        </div>
    );
}
