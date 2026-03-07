"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../providers/auth-provider";
import { useEffect } from "react";
import { api } from "../../lib/api";
import { CurrentUserSchema } from "@volunteerly/shared";

export default function BootstrapPage() {
    const router = useRouter();
    const { session, loading } = useAuth();

    useEffect(() => {
        async function bootstrap() {
            if (loading) return;

            if (!session?.access_token) {
                router.replace("/login");
                return;
            }

            try {
                const json = await api<unknown>("/current-user");
                const parsed = CurrentUserSchema.safeParse(json);

                if (!parsed.success) {
                    console.error(parsed.error);
                    router.replace("/login");
                    return;
                }
                
                switch (parsed.data.role) {
                    case "VOLUNTEER":
                        router.replace("/volunteer");
                        break;
                    case "ORGANIZATION":
                        router.replace("/organization");
                        break;
                    case "MODERATOR":
                        router.replace("/moderator");
                        break;
                }
            } catch (error) {
                console.error(error);
                router.replace("/login");
            }
        }

        bootstrap();
    }, [session, loading, router]);

    return <main className="p-6">Loading your dashboard...</main>
}