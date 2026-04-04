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
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<ProfileErrors>({});

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [location, setLocation] = useState("");
    const [bio, setBio] = useState("");

    useEffect(() => {
        if (!loading && !session) router.replace("/login");
    }, [loading, session, router]);

    useEffect(() => {
        async function loadData() {
            if (!session) return;
            const result = await VolunteerService.getCurrentVolunteer();
            if (result.success) {
                const vol = result.data;
                setCurrentVolunteer(vol);
                setFirstName(vol.firstName);
                setLastName(vol.lastName);
                setLocation(vol.location);
                setBio(vol.bio);
            }
        }
        loadData();
    }, [session]);

    function handleEdit() {
        setEditing(true);
        setErrors({});
    }

    function handleCancel() {
        if (!currentVolunteer) return;
        setFirstName(currentVolunteer.firstName);
        setLastName(currentVolunteer.lastName);
        setLocation(currentVolunteer.location);
        setBio(currentVolunteer.bio);
        setEditing(false);
        setErrors({});
    }

    const memberSince = currentVolunteer
        ? new Date(currentVolunteer.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
          })
        : "";

    return {
        currentVolunteer,
        editing,
        saving,
        errors,
        firstName, setFirstName,
        lastName, setLastName,
        location, setLocation,
        bio, setBio,
        memberSince,
        handleEdit,
        handleCancel,
        handleSave: async () => {},
        signOut,
        DAYS,
    };
}