/**
 * profileVm.tsx
 * View model for the volunteer profile page. Handles loading, editing, saving, and avatar upload
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { VolunteerService } from "@/services/VolunteerService";
import { UserService } from "@/services/UserService";
import { CurrentVolunteer } from "@volunteerly/shared";
import { toast } from "sonner";
import { useAppSession } from "@/providers/app-session-provider";

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export type ProfileErrors = {
    firstName?: string;
    lastName?: string;
    location?: string;
    bio?: string;
    availability?: string;
};

/**
 * Drives all state and logic for the volunteer profile edit page
 * @returns all the state and handlers needed by the profile page component
 */
export function useProfileViewModel() {
    const router = useRouter();
    const { session, loading, signOut } = useAuth();
    const { refresh } = useAppSession();

    const [currentVolunteer, setCurrentVolunteer] = useState<CurrentVolunteer | undefined>(
        undefined,
    );
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [avatarKey, setAvatarKey] = useState(Date.now());

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [location, setLocation] = useState("");
    const [bio, setBio] = useState("");
    const [availability, setAvailability] = useState<string[]>([]);
    const [errors, setErrors] = useState<ProfileErrors>({});
    const [fetching, setFetching] = useState(true);
    const [awards, setAwards] = useState<Record<string, string>>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!loading && !session) router.replace("/login");
    }, [loading, session, router]);

    useEffect(() => {
        async function loadData() {
            if (!session?.access_token) return;
            try {
                const result = await VolunteerService.getCurrentVolunteer();
                if (result.success) {
                    const vol = result.data;
                    setCurrentVolunteer(vol);
                    setFirstName(vol.firstName);
                    setLastName(vol.lastName);
                    setLocation(vol.location);
                    setBio(vol.bio);
                    setAvailability((vol.availability as string[]) ?? []);

                    const awardsResult = await VolunteerService.getVolAwards();
                    if (awardsResult.success) {
                        setAwards(awardsResult.data);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setFetching(false);
            }
        }
        loadData();
    }, [session]);

    /**
     * Handles a new avatar file being selected — uploads it and busts the image cache
     * @param e - the file input change event
     */
    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("image", file);
        await UserService.uploadAvatar(formData);
        setAvatarKey(Date.now());
    }

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
        setAvailability((currentVolunteer.availability as string[]) ?? []);
        setEditing(false);
        setErrors({});
    }

    /**
     * Toggles a day in the availability selection
     * @param day - the full day name to add or remove
     */
    function toggleDay(day: string) {
        setAvailability((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
        );
    }

    /**
     * Validates all required fields before saving
     * @returns true if all fields pass, false if any are empty
     */
    function validate(): boolean {
        const newErrors: ProfileErrors = {};
        if (!firstName.trim()) newErrors.firstName = "First name is required.";
        if (!lastName.trim()) newErrors.lastName = "Last name is required.";
        if (!location.trim()) newErrors.location = "Location is required.";
        if (!bio.trim()) newErrors.bio = "Bio is required.";
        if (availability.length === 0) newErrors.availability = "Please select at least one day.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    /**
     * Saves the edited profile to the server, refreshes the session cache, and shows a toast
     */
    async function handleSave() {
        if (!validate()) return;
        setSaving(true);
        setErrors({});
        try {
            const result = await VolunteerService.update_create_Volunteer({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                location: location.trim(),
                bio: bio.trim(),
                availability,
                hourlyValue: currentVolunteer?.hourlyValue,
            });
            if (result.success) {
                setCurrentVolunteer(result.data);
                setEditing(false);
                await refresh();
                toast.success("Account Changes Saved", {
                    description: "Your profile has been updated.",
                    position: "top-right",
                });
            } else {
                setErrors({ firstName: "Failed to save profile. Please try again." });
            }
        } catch (err) {
            console.error(err);
            setErrors({ firstName: "Something went wrong. Please try again." });
        } finally {
            setSaving(false);
        }
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
        firstName,
        setFirstName,
        lastName,
        setLastName,
        location,
        setLocation,
        bio,
        setBio,
        availability,
        toggleDay,
        memberSince,
        handleEdit,
        handleCancel,
        handleSave,
        handleAvatarChange,
        fileInputRef,
        avatarKey,
        signOut,
        DAYS,
        loading,
        session,
        fetching,
        awards,
    };
}
