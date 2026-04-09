"use client";

import { useLoginViewModel } from "@/app/(public)/login/loginVM";
import tms from "@/assets/tms.png";
import avtImg from "@/assets/volunteerly_logo.png";
import { LoadingScreen } from "@/components/common/loading-screen";
import { Navbar } from "@/components/custom/login_navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
    const {
        email,
        setEmail,
        password,
        setPassword,
        submitting,
        pendingRedirect,
        error,
        handleSubmit,
    } = useLoginViewModel();

    if (submitting || pendingRedirect) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen">
            <title>Log In - Volunteerly</title>
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
                    <Image
                        src={tms.src}
                        alt="Preview"
                        width={tms.width}
                        height={tms.height}
                        className="
                            h-auto w-full
                            md:h-full
                        "
                    />
                    <div className="absolute inset-0 w-full bg-black/50"></div>
                    <div className="absolute bottom-20 left-12 text-left">
                        <h1 className="text-4xl pb-2 font-bold tracking-tight text-muted">
                            Turn Skills Into Real Impact
                        </h1>
                        <h3 className="text-2xl pb-5 font-bold tracking-tight text-muted">
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

                                <Button
                                    type="submit"
                                    className="w-full cursor-pointer"
                                    disabled={submitting}
                                >
                                    {submitting ? "Logging in..." : "Log In"}
                                </Button>
                                <p className="text-center text-sm text-muted-foreground">
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
