/**
 * page.tsx
 * Opportunity edit page - reuses the shared OpportunityForm in editing mode
 */

"use client";

import { LoadingScreen } from "@/components/common/loading-screen";
import { use } from "react";
import { useCreateOpportunityViewModel } from "../../create/orgCreateOpportunityVm";
import OpportunityForm from "../../opportunityForm";

export default function OppUpdatePage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap Next.js dynamic route params using React.use()
    const { id } = use(params);

    // Reuse the create view model - passing oppId puts it into edit mode
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
                {/* editing=true changes the form title and submit button label */}
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