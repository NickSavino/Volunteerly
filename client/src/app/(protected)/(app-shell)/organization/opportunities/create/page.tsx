/**
 * page.tsx
 * Opportunity creation page - renders the shared OpportunityForm in create mode
 */

"use client";

import { LoadingScreen } from "@/components/common/loading-screen";
import OpportunityForm from "../opportunityForm";
import { useCreateOpportunityViewModel } from "./orgCreateOpportunityVm";

export default function OppCreatePage() {
    // No oppId passed - view model starts with a blank form in create mode
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
                {/* editing=false shows "Create New Opportunity" title and "Publish" button */}
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
