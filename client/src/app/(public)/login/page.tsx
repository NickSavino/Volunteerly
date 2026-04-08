"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import tms from "@/assets/tms.png";
import avtImg from "@/assets/volunteerly_logo.png";
import { Navbar } from "@/components/custom/login_navbar";
import { useLoginViewModel } from "@/app/(public)/login/loginVM";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingScreen } from "@/components/common/loading-screen";

export default function LoginPage() {
    const { email, setEmail, password, setPassword, submitting, pendingRedirect, error, handleSubmit } =
        useLoginViewModel();

    if (submitting || pendingRedirect) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen">
            <title>Log In - Volunteerly</title>
            <Navbar></Navbar>
            <main className="flex flex-col md:flex-row h-screen md:h-[calc(100vh-64px)]">
                <div className="hidden md:flex w-full md:w-1/2 relative h-screen md:h-full overflow-hidden flex-col">
                    <img src={tms.src} alt="Preview" className="w-full h-auto md:h-full" />
                    <div className="absolute inset-0 w-full bg-black/50"></div>
                    <div className="absolute bottom-20 left-12 text-left">
                        <h1 className="text-4x1 text-muted font-bold tracking-tight pb-2">
                            Turn Skills Into Real Impact
                        </h1>
                        <h3 className="text-2x1 text-muted font-bold tracking-tight pb-5">
                            AI-Powered Matching for Skilled Volunteering
                        </h3>
                        <p className="text-muted text-lg">
                            &quot;Through Volunteerly, we were able to find volunteers for our most complex tasks,
                            allowing us to devote more funds to helping our cause.&quot;
                        </p>
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={avtImg.src} />
                                <AvatarFallback>TMS</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col justify-center">
                                <p className="text-secondary text-sm">World Impact</p>
                                <p className="text-secondary text-sm">Verified Organization</p>
                            </div>
                        </div>
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

                                {error ? <p className="text-sm text-red-500">{error}</p> : null}

                                <Button type="submit" className="w-full cursor-pointer" disabled={submitting}>
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
    );
}
