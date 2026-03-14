"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import Link from "next/link";
import { useLoginViewModel } from "./loginVM";
import { Navbar } from "@/components/custom/login_navbar";

export default function LoginPage() {
    const {email, setEmail, password, setPassword, submitting, error, handleSubmit} = useLoginViewModel()

    return (
        <div className="min-h-screen px-6">
            <Navbar></Navbar>
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
        </div>
    )
}