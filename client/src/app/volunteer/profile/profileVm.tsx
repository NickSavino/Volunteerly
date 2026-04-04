"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { VolunteerService } from "@/services/VolunteerService";
import { CurrentVolunteer } from "@volunteerly/shared";

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export type ProfileErrors = {
    firstName?: string;
    lastName?: string;
    location?: string;
    bio?: string;
    availability?: string;
};

export function useProfileViewModel() {
    const router = useRouter();
    const { session, loading, signOut } = useAuth();

    const [currentVolunteer, setCurrentVolunteer] = useState<CurrentVolunteer | undefined>(undefined);

    useEffect(() => {
        if (!loading && !session) router.replace("/login");
    }, [loading, session, router]);

    useEffect(() => {
        async function loadData() {
            if (!session) return;
            const result = await VolunteerService.getCurrentVolunteer();
            if (result.success) {
                setCurrentVolunteer(result.data);
            }
        }
        loadData();
    }, [session]);

    const memberSince = currentVolunteer
    ? new Date(currentVolunteer.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
      })
    : "";

    return {
        currentVolunteer,
        memberSince,
        signOut,
        DAYS,
    };

}