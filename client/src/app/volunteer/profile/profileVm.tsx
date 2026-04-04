"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { VolunteerService } from "@/services/VolunteerService";
import { CurrentVolunteer } from "@volunteerly/shared";
import { toast } from "sonner";

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
    const [availability, setAvailability] = useState<string[]>([]);

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
                setAvailability((vol.availability as string[]) ?? []);
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
        setAvailability((currentVolunteer.availability as string[]) ?? []);
        setEditing(false);
        setErrors({});
    }

    function toggleDay(day: string) {
        setAvailability((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    }

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
        firstName, setFirstName,
        lastName, setLastName,
        location, setLocation,
        bio, setBio,
        availability,
        toggleDay,
        memberSince,
        handleEdit,
        handleCancel,
        handleSave,
        signOut,
        DAYS,
    };
}