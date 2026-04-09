import { Spinner } from "@/components/ui/spinner";

export function VolunteerLoadingPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center text-center">
            <Spinner className="size-20 text-primary" />
            <h2>Processing Content</h2>
            <p>Please wait a moment while we load your content.</p>
        </div>
    );
}
