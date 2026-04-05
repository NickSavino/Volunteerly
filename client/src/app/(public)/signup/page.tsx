"use client";

import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link";
import tms from "@/assets/tms.png"
import avtImg from "@/assets/avatarImg.png"
import { useSignUpViewModel } from "./signupVM";
import { Navbar } from "@/components/custom/login_navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
    const {email, setEmail, password, setPassword, fName, setfName, lName, role, orgName, setorgName, setRole, setlName, submitting, error, handleSubmit} = useSignUpViewModel()

    return (

        <div className="min-h-screen">
            <title>Sign Up - Volunteerly</title>
            <Navbar></Navbar>
            <main className="flex flex-col md:flex-row h-screen md:h-[calc(100vh-64px)]">
                <div className="hidden md:flex w-full md:w-1/2 relative h-screen md:h-full overflow-hidden flex-col">
                    <img
                        src={tms.src}
                        alt="Preview"
                        className="w-full h-auto md:h-full"
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
                        &quot;Through Volunteerly, we were able to find volunteers for our most complex tasks, allowing us to devote more funds to hepling our cause.&quot;
                        </p>
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={avtImg.src} />
                                <AvatarFallback>TMS</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col justify-center">
                                <p className="text-secondary text-sm">Joshua Bright</p>
                                <p className="text-secondary text-sm">Verified Volunteer</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/2 flex-1 flex items-center justify-center md:justify-around px-8">
                    <Card className="w-full max-w-md min-w-0">
                        <CardHeader>Sign Up</CardHeader>
                        <CardContent>
                            <Tabs defaultValue="VOLUNTEER" value={role} onValueChange={setRole}>
                                <TabsList className="w-full flex justify-center">
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
                            </TabsContent>
                            <TabsContent value="ORGANIZATION">
                                <div>
                                    <p className="text-sm text-center text-foreground bg-warning my-2 p-1 radius-2 rounded-sm">Must Complete Application upon account creation.</p>
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
                            </TabsContent>
                            </Tabs>
                        </CardContent>
            
                    </Card> 
                </div>
            </main>
        </div>
    )
}