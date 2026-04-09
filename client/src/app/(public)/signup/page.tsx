"use client";

import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import tms from "@/assets/tms.png";
import avtImg from "@/assets/volunteerly_logo.png";
import { useSignUpViewModel } from "./signupVM";
import { Navbar } from "@/components/custom/login_navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
    const {
        email,
        setEmail,
        password,
        setPassword,
        fName,
        setfName,
        lName,
        role,
        orgName,
        setorgName,
        setRole,
        setlName,
        submitting,
        error,
        handleSubmit,
    } = useSignUpViewModel();

    return (
        <div className="min-h-screen">
            <title>Sign Up - Volunteerly</title>
            <Navbar></Navbar>
            <main
                className="
                    flex h-screen flex-col
                    md:h-[calc(100vh-64px)] md:flex-row
                "
            >
                <div
                    className="
                        relative hidden h-screen w-full flex-col overflow-hidden
                        md:flex md:h-full md:w-1/2
                    "
                >
                    <img
                        src={tms.src}
                        alt="Preview"
                        className="
                            h-auto w-full
                            md:h-full
                        "
                    />
                    <div className="absolute inset-0 w-full bg-black/50"></div>
                    <div className="absolute bottom-20 left-12 text-left">
                        <h1 className="text-4x1 pb-2 font-bold tracking-tight text-muted">
                            Turn Skills Into Real Impact
                        </h1>
                        <h3 className="text-2x1 pb-5 font-bold tracking-tight text-muted">
                            AI-Powered Matching for Skilled Volunteering
                        </h3>
                        <p className="text-lg text-muted">
                            &quot;Through Volunteerly, we were able to find volunteers for our most
                            complex tasks, allowing us to devote more funds to helping our
                            cause.&quot;
                        </p>
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={avtImg.src} />
                                <AvatarFallback>TMS</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col justify-center">
                                <p className="text-sm text-secondary">World Impact</p>
                                <p className="text-sm text-secondary">Verified Organization</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className="
                        flex w-full flex-1 items-center justify-center px-8
                        md:w-1/2 md:justify-around
                    "
                >
                    <Card className="w-full max-w-md min-w-0">
                        <CardHeader>Sign Up</CardHeader>
                        <CardContent>
                            <Tabs defaultValue="VOLUNTEER" value={role} onValueChange={setRole}>
                                <TabsList className="flex w-full justify-center">
                                    <TabsTrigger value="VOLUNTEER">Volunteer</TabsTrigger>
                                    <TabsTrigger value="ORGANIZATION">Organization</TabsTrigger>
                                </TabsList>
                                <TabsContent value="VOLUNTEER">
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

                                        <Button
                                            type="submit"
                                            className="w-full cursor-pointer"
                                            disabled={submitting}
                                        >
                                            {submitting ? "Creating account..." : "Sign up"}
                                        </Button>

                                        <p className="text-center text-sm text-muted-foreground">
                                            Already have an account?{" "}
                                            <Link href="/login" className="underline">
                                                Log in
                                            </Link>
                                        </p>
                                    </form>
                                </TabsContent>
                                <TabsContent value="ORGANIZATION">
                                    <div>
                                        <p
                                            className="
                                                radius-2 my-2 rounded-sm bg-warning p-1 text-center
                                                text-sm text-foreground
                                            "
                                        >
                                            Must Complete Application upon account creation.
                                        </p>
                                    </div>
                                    <form className="space-y-4" onSubmit={handleSubmit}>
                                        <div className="space-y-2">
                                            <Label htmlFor="orgName">Organization Name</Label>
                                            <Input
                                                id="orgName"
                                                type="text"
                                                value={orgName}
                                                onChange={(e) => setorgName(e.target.value)}
                                                required
                                            />
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

                                        <Button
                                            type="submit"
                                            className="w-full cursor-pointer"
                                            disabled={submitting}
                                        >
                                            {submitting ? "Creating account..." : "Sign up"}
                                        </Button>

                                        <p className="text-center text-sm text-muted-foreground">
                                            Already have an account?{" "}
                                            <Link href="/login" className="underline">
                                                Log in
                                            </Link>
                                        </p>
                                    </form>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
