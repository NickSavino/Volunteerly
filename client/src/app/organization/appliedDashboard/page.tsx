"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { CurrentUserSchema, type CurrentUser } from "@volunteerly/shared";
import { Button } from "@/components/ui/button";

export default function HomePage() {
    const router = useRouter();
    const auth = useAuth()

  if (auth.loading || !auth.session ) {
    return <main className="p-6">Loading...</main>
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3x1 space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2x1 font-bold">Organization Unverified Dashboard</h1>
            <Button
                variant="outline"
                onClick={async () => {
                    await auth.signOut();
                    router.push("/");
                }}>
                    Log out
                </Button>
        </div>
      </div>
    </main>
  );
}
