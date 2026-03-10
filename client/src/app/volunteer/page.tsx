"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../providers/auth-provider";
import { Button } from "../../components/ui/button";
import { CurrentUserSchema, type CurrentUser } from "@volunteerly/shared";
import { api } from "../../lib/api";
import { useVltDashboardViewModel } from "./vltDashboardVm";

export default function HomePage() {
  const {loading, session, signOut, router, user, error, currentUser} = useVltDashboardViewModel()

  if (loading || !session ) {
    return <main className="p-6">Loading...</main>
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3x1 space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2x1 font-bold">Volunteer Dashboard</h1>
            <Button
                variant="outline"
                onClick={async () => {
                    await signOut();
                    router.push("/");
                }}>
                    Log out
                </Button>
        </div>

        <div className="space-y-2">
            <p>
                <span className="font-medium">Supabase user:</span>{" "}
                {user?.email ?? "Unknown"}
            </p>
        </div>

        <div className="space-y-2">
            <h2 className="text-lg font-semibold">Backend Current User</h2>
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            {currentUser ? (
                <pre className="rounded-md border p-4 text-sm overflow-x-auto">
                    {JSON.stringify(currentUser, null, 2)}
                </pre>
            ) : (
                <p className="text-sm text-muted-foreground">Loading app user...</p>
            )}
        </div>
      </div>
    </main>
  );
}
