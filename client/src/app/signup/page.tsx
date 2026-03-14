"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import Link from "next/link";
import tms from "@/assets/tms.png"
import { useSignUpViewModel } from "./signupVM";
import { Navbar } from "@/components/custom/login_navbar";

export default function LoginPage() {
    const {email, setEmail, password, setPassword, fName, setfName, lName, role, setRole, setlName, submitting, error, handleSubmit} = useSignUpViewModel()

    return (

        <div className="min-h-screen">
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
                        <CardHeader>Sign Up</CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <Label htmlFor="fName">First Name</Label>
                                    <Input
                                        id="fName"
                                        type="text"
                                        value={fName}
                                        onChange={(e) => setfName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lName">Last Name</Label>
                                    <Input
                                        id="lName"
                                        type="text"
                                        value={lName}
                                        onChange={(e) => setlName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <select
                                        id="role"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        required
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select a role</option>
                                        <option value="VOLUNTEER">Volunteer</option>
                                        <option value="ORGANIZATION">Organization</option>
                                    </select>
                                </div>
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
                                    {submitting ? "Creating account..." : "Sign up"}
                                </Button>

                                <p className="text-sm text-muted-foreground text-center">
                                    Already have an account?{" "}
                                    <Link href="/login" className="underline">
                                        Log in
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