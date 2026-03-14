"use client";

import { Button } from "../components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/auth-provider";
import { useEffect } from "react";
import { Navbar } from "@/components/custom/login_navbar";

export default function LandingPage() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      router.replace("/bootstrap");
    }
  }, [loading, session, router])

  if (loading) {
    return <main className="p-6">Loading...</main>
  }
  return (
    <div className="min-h-screen px-6">
      <Navbar></Navbar>
      <main className="flex min-h-screen flex-col items-center justify-between px-6">
        <div className="w-full max-w-2x1 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4x1 font-bold tracking-tight">Volunteerly</h1>
            <p className="text-muted-foreground text-lg">
              Turn skills into real impact.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button asChild>
              <Link href="/login">Log in</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
