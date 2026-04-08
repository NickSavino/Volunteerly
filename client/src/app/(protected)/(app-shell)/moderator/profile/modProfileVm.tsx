"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/providers/auth-provider";
import { useAppSession } from "@/providers/app-session-provider";
import { UserService } from "@/services/UserService";
import { ModeratorService } from "@/services/ModeratorService";
import { AuthService } from "@/services/AuthService";

export type ModProfileErrors = {
    firstName?: string;
    lastName?: string;
    general?: string;
};

export type PasswordErrors = {
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
};

export type DeleteAccountErrors = {
    confirmation?: string;
    general?: string;
};

export function useModProfileViewModel() {
    const router = useRouter();
    const { session, user, loading: authLoading, signOut } = useAuth();

    const { loading: appLoading, initialized, currentModerator, refresh, clear } = useAppSession();

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [avatarKey, setAvatarKey] = useState(Date.now());

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [errors, setErrors] = useState<ModProfileErrors>({});

    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});

    const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [deleteErrors, setDeleteErrors] = useState<DeleteAccountErrors>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!authLoading && !session) {
            router.replace("/login");
        }
    }, [authLoading, session, router]);

    useEffect(() => {
        if (!initialized || !currentModerator) return;

        setFirstName(currentModerator.firstName ?? "");
        setLastName(currentModerator.lastName ?? "");
    }, [initialized, currentModerator]);

    function validateProfile() {
        const newErrors: ModProfileErrors = {};

        if (!firstName.trim()) newErrors.firstName = "First name is required.";
        if (!lastName.trim()) newErrors.lastName = "Last name is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function validatePassword() {
        const newErrors: PasswordErrors = {};

        if (!newPassword.trim()) {
            newErrors.newPassword = "New password is required.";
        } else if (newPassword.trim().length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters.";
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = "Please confirm your password.";
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        setPasswordErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function validateDeleteAccount() {
        const newErrors: DeleteAccountErrors = {};

        if (deleteConfirmation.trim() !== "DELETE") {
            newErrors.confirmation = 'Type "DELETE" to confirm.';
        }

        setDeleteErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function handleAvatarButtonClick() {
        fileInputRef.current?.click();
    }

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append("image", file);
            await UserService.uploadAvatar(formData);
            setAvatarKey(Date.now());

            toast.success("Profile photo updated", {
                description: "Your avatar has been updated.",
                position: "top-right",
            });
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile photo", {
                description: "Please try again.",
                position: "top-right",
            });
        }
    }

    function handleEdit() {
        setEditing(true);
        setErrors({});
    }

    function handleCancel() {
        if (!currentModerator) return;

        setFirstName(currentModerator.firstName ?? "");
        setLastName(currentModerator.lastName ?? "");
        setEditing(false);
        setErrors({});
    }

    async function handleSave() {
        if (!validateProfile() || !currentModerator) return;

        setSaving(true);
        setErrors({});

        try {
            const result = await ModeratorService.update_create_Moderator({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
            });

            if (result.success) {
                await refresh();
                setEditing(false);

                toast.success("Account Changes Saved", {
                    description: "Your profile has been updated.",
                    position: "top-right",
                });
            } else {
                setErrors({ general: "Failed to save profile. Please try again." });
            }
        } catch (err) {
            console.error(err);
            setErrors({ general: "Something went wrong. Please try again." });
        } finally {
            setSaving(false);
        }
    }

    async function handleChangePassword() {
        if (!validatePassword()) return;

        setChangingPassword(true);
        setPasswordErrors({});

        try {
            await AuthService.changePassword(newPassword.trim());

            setNewPassword("");
            setConfirmPassword("");
            setChangePasswordOpen(false);

            toast.success("Password changed", {
                description: "Your password has been updated.",
                position: "top-right",
            });
        } catch (err) {
            console.error(err);
            setPasswordErrors({
                general: "Failed to change password. Please try again.",
            });
        } finally {
            setChangingPassword(false);
        }
    }

    async function handleDeleteAccount() {
        if (!validateDeleteAccount()) return;

        setDeletingAccount(true);
        setDeleteErrors({});

        try {
            await UserService.deleteCurrentUser();

            clear();

            try {
                await signOut();
            } catch (signOutError) {
                console.error(signOutError);
            }

            toast.success("Account deleted", {
                description: "Your account has been deleted.",
                position: "top-right",
            });
        } catch (err) {
            console.error(err);
            setDeleteErrors({
                general: "Failed to delete account. Please try again.",
            });
        } finally {
            setDeletingAccount(false);
        }
    }

    const memberSince = useMemo(() => {
        if (!currentModerator) return "";

        return new Date(currentModerator.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
    }, [currentModerator]);

    const loading = authLoading || appLoading || !initialized || !currentModerator;

    return {
        sessionState: {
            loading,
            session,
            user,
            signOut,
            router,
        },

        profileState: {
            currentModerator,
            editing,
            saving,
            avatarKey,
            memberSince,
        },

        form: {
            values: {
                firstName,
                lastName,
            },
            errors,
            setters: {
                setFirstName,
                setLastName,
            },
        },

        securityState: {
            changePasswordOpen,
            setChangePasswordOpen,
            changingPassword,
            deleteAccountOpen,
            setDeleteAccountOpen,
            deletingAccount,
        },

        securityForm: {
            values: {
                newPassword,
                confirmPassword,
                deleteConfirmation,
            },
            errors: {
                password: passwordErrors,
                delete: deleteErrors,
            },
            setters: {
                setNewPassword,
                setConfirmPassword,
                setDeleteConfirmation,
            },
        },

        actions: {
            handleEdit,
            handleCancel,
            handleSave,
            handleAvatarChange,
            handleAvatarButtonClick,
            handleChangePassword,
            handleDeleteAccount,
        },

        fileInputRef,
    };
}
