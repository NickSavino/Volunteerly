"use client";

import { UserService } from "@/services/UserService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingScreen } from "@/components/common/loading-screen";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Lock, CalendarDays, Pencil } from "lucide-react";
import { useModProfileViewModel } from "@/app/(protected)/(app-shell)/moderator/profile/modProfileVm";

export default function ModeratorProfilePage() {
    const vm = useModProfileViewModel();

    const { sessionState, profileState, form, securityState, securityForm, actions, fileInputRef } =
        vm;
    const { loading, session } = sessionState;
    const { currentModerator, editing, saving, avatarKey, memberSince } = profileState;
    const { values, errors, setters } = form;
    const {
        changePasswordOpen,
        setChangePasswordOpen,
        changingPassword,
        deleteAccountOpen,
        setDeleteAccountOpen,
        deletingAccount,
    } = securityState;
    const {
        values: securityValues,
        errors: securityErrors,
        setters: securitySetters,
    } = securityForm;

    if (loading || !session) {
        return <LoadingScreen />;
    }

    if (!currentModerator) {
        return <main className="p-6">Loading...</main>;
    }

    const fullName = `${currentModerator.firstName} ${currentModerator.lastName}`;

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <title>Moderator - Profile</title>

                <main
                    className="
                        mx-auto max-w-6xl px-4 py-10
                        sm:px-6
                        lg:px-8
                    "
                >
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900">Profile</h1>
                        <p className="mt-2 text-lg text-gray-500">Manage and update profile</p>
                    </div>

                    <div
                        className="
                            grid grid-cols-1 gap-8
                            lg:grid-cols-[1fr_0.95fr]
                        "
                    >
                        <div className="space-y-8">
                            <div className="rounded-2xl border bg-white p-8 shadow-sm">
                                <div
                                    className="
                                        flex flex-col gap-6
                                        md:flex-row md:items-center
                                    "
                                >
                                    <div className="relative">
                                        <Avatar className="size-32">
                                            <AvatarImage
                                                key={avatarKey}
                                                src={UserService.getAvatarURL(
                                                    currentModerator.id,
                                                    avatarKey,
                                                )}
                                            />
                                            <AvatarFallback className="text-3xl">
                                                {currentModerator.firstName[0]}
                                                {currentModerator.lastName[0]}
                                            </AvatarFallback>
                                        </Avatar>

                                        <Button
                                            type="button"
                                            className="
                                                absolute right-0 bottom-0 size-9 rounded-full
                                                bg-yellow-400 p-0 text-black
                                                hover:bg-yellow-500
                                            "
                                            onClick={actions.handleAvatarButtonClick}
                                        >
                                            <Pencil className="size-4" />
                                        </Button>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".jpg,.jpeg,.png,.webp"
                                            onChange={actions.handleAvatarChange}
                                        />
                                    </div>

                                    <div>
                                        <h2 className="text-4xl font-bold text-gray-900">
                                            {fullName}
                                        </h2>
                                        <div
                                            className="
                                                mt-3 flex items-center gap-2 text-lg text-gray-500
                                            "
                                        >
                                            <CalendarDays className="size-5" />
                                            <span>Moderator since {memberSince}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border bg-white shadow-sm">
                                <div className="border-b px-6 py-5">
                                    <h2 className="text-2xl font-semibold text-gray-900">
                                        General Information
                                    </h2>
                                </div>

                                <div className="space-y-5 p-6">
                                    <div
                                        className="
                                            grid grid-cols-1 gap-5
                                            md:grid-cols-2
                                        "
                                    >
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input
                                                id="firstName"
                                                value={values.firstName}
                                                disabled={!editing}
                                                onChange={(e) =>
                                                    setters.setFirstName(e.target.value)
                                                }
                                                placeholder="John"
                                                className={
                                                    errors.firstName ? "border-destructive" : ""
                                                }
                                            />
                                            {errors.firstName && (
                                                <p className="text-xs text-destructive">
                                                    {errors.firstName}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                value={values.lastName}
                                                disabled={!editing}
                                                onChange={(e) =>
                                                    setters.setLastName(e.target.value)
                                                }
                                                placeholder="Smith"
                                                className={
                                                    errors.lastName ? "border-destructive" : ""
                                                }
                                            />
                                            {errors.lastName && (
                                                <p className="text-xs text-destructive">
                                                    {errors.lastName}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {errors.general && (
                                        <p className="text-sm text-destructive">{errors.general}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {editing && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={actions.handleCancel}
                                        disabled={saving}
                                        className="min-w-28"
                                    >
                                        Cancel
                                    </Button>
                                )}

                                <Button
                                    type="button"
                                    onClick={editing ? actions.handleSave : actions.handleEdit}
                                    disabled={saving}
                                    className="
                                        min-w-40 bg-yellow-400 text-black
                                        hover:bg-yellow-500
                                    "
                                >
                                    {saving
                                        ? "Saving..."
                                        : editing
                                          ? "Save Changes"
                                          : "Edit Profile"}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="rounded-2xl border bg-white shadow-sm">
                                <div className="flex items-center gap-3 border-b px-6 py-5">
                                    <Shield className="size-5 text-gray-700" />
                                    <h2 className="text-2xl font-semibold text-gray-900">
                                        Account Security
                                    </h2>
                                </div>

                                <div className="p-6">
                                    <div className="rounded-xl bg-gray-50 p-5">
                                        <div className="flex items-start gap-4">
                                            <Lock className="mt-1 size-5 text-yellow-500" />
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    Password Management
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Update your password for this account.
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    className="
                                                        mt-3 px-0 text-base font-semibold
                                                        text-yellow-600
                                                    "
                                                    onClick={() => setChangePasswordOpen(true)}
                                                >
                                                    Change Password
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-red-200 bg-white shadow-sm">
                                <div className="p-6">
                                    <div className="rounded-xl bg-red-50 p-5">
                                        <h2 className="text-2xl font-semibold text-red-600">
                                            Danger Zone
                                        </h2>
                                        <p className="mt-3 max-w-md text-sm text-red-400">
                                            Deleting your account will permanently remove all of
                                            your moderator data and access.
                                        </p>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="
                                                mt-6 w-full border-red-300 text-red-500
                                                hover:bg-red-100
                                            "
                                            onClick={() => setDeleteAccountOpen(true)}
                                        >
                                            Deactivate Account
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>Enter your new password below.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={securityValues.newPassword}
                                onChange={(e) => securitySetters.setNewPassword(e.target.value)}
                            />
                            {securityErrors.password.newPassword && (
                                <p className="text-xs text-destructive">
                                    {securityErrors.password.newPassword}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={securityValues.confirmPassword}
                                onChange={(e) => securitySetters.setConfirmPassword(e.target.value)}
                            />
                            {securityErrors.password.confirmPassword && (
                                <p className="text-xs text-destructive">
                                    {securityErrors.password.confirmPassword}
                                </p>
                            )}
                        </div>

                        {securityErrors.password.general && (
                            <p className="text-sm text-destructive">
                                {securityErrors.password.general}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setChangePasswordOpen(false)}
                            disabled={changingPassword}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={actions.handleChangePassword}
                            disabled={changingPassword}
                            className="
                                bg-yellow-400 text-black
                                hover:bg-yellow-500
                            "
                        >
                            {changingPassword ? "Updating..." : "Update Password"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                        <DialogDescription>
                            This action is permanent. Type{" "}
                            <span className="font-semibold">DELETE</span> to confirm.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="deleteConfirmation">Confirmation</Label>
                            <Input
                                id="deleteConfirmation"
                                value={securityValues.deleteConfirmation}
                                onChange={(e) =>
                                    securitySetters.setDeleteConfirmation(e.target.value)
                                }
                                placeholder='Type "DELETE"'
                            />
                            {securityErrors.delete.confirmation && (
                                <p className="text-xs text-destructive">
                                    {securityErrors.delete.confirmation}
                                </p>
                            )}
                        </div>

                        {securityErrors.delete.general && (
                            <p className="text-sm text-destructive">
                                {securityErrors.delete.general}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteAccountOpen(false)}
                            disabled={deletingAccount}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={actions.handleDeleteAccount}
                            disabled={deletingAccount}
                            className="
                                bg-red-600 text-white
                                hover:bg-red-700
                            "
                        >
                            {deletingAccount ? "Deleting..." : "Delete Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
