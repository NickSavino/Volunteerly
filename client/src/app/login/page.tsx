"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import Link from "next/link";
import { useLoginViewModel } from "./loginVM";
import tms from "@/assets/tms.png"
import { Navbar } from "@/components/custom/login_navbar";

export default function LoginPage() {
    const {email, setEmail, password, setPassword, submitting, error, handleSubmit} = useLoginViewModel()

    return (
        <div className="min-h-screen">
            <title>Log In - Volunteerly</title>
            <Navbar></Navbar>
            <main className="flex flex-col md:flex-row h-screen md:h-[calc(100vh-64px)]">
                <div className="hidden md:flex w-full md:w-1/2 relative h-screen md:h-full overflow-hidden flex-col">
                    <img
                        src={tms.src}
                        alt="Preview"
                        className="w-full w-full h-auto md:h-full"
                    />
                    <div className="absolute inset-0 w-full bg-black/50"></div>
                    <div className="absolute bottom-20 left-12 text-left">
                        <h1 className="text-4x1 text-muted font-bold tracking-tight pb-2">
                        Turn Skills Into Real Impact
                        </h1>
                        <h3 className="text-2x1 text-muted font-bold tracking-tight pb-5">
                        AI-Powered Matching for Skilled Volunteering
                        </h3>
                        <p className="text-muted text-lg">
                        "Through Volunteerly, we were able to find volunteers for our most complex tasks, allowing us to devote more funds to hepling our cause."
                        </p>
                    </div>
                </div>
                <div className="w-full md:w-1/2 flex-1 flex items-center justify-center md:justify-around px-8">
                    <Card className="w-full max-w-md">
                        <CardHeader>Log In</CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
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
                                        placeholder="••••••••"
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

                </div>
            </main>
        </div>
    )
}