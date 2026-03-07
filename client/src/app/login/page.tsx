"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setSubmitting(false);

        if (error) {
            setError(error.message);
            return;
        }

        router.push("/bootstrap");
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-6">
            <Card className="w-full max-w-md">
                <CardHeader>Log In</CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error ? (
                            <p className="text-sm text-red-500">{error}</p>
                        ) : null}

                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? "Logging in..." : "Log In"}
                        </Button>
                        <p className="text-sm text-muted-foreground text-center">
                            Need an account?{" "}
                            <Link href="/signup" className="underline">
                                Sign up
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}