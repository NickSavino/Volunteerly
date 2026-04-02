import { Spinner } from "@/components/ui/spinner";

export function OrganizationLoadingPage(){
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center">
            <Spinner className="size-20 text-primary" />
            <h2>Processing Content</h2>
            <p>Please wait a moment while we load your content.</p>
        </div>

    )
}