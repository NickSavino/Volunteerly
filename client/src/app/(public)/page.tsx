"use client";

import tms from "@/assets/tms.png";
import avtImg from "@/assets/volunteerly_logo.png";
import { Navbar } from "@/components/custom/login_navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { HandHeart, HouseHeart, Merge, Upload, User } from "lucide-react";
import Image from "next/image";
import { useAuth } from "../../providers/auth-provider";

export default function LandingPage() {
    const { loading } = useAuth();

    if (loading) {
        return <main className="p-6">Loading...</main>;
    }
    return (
        <div className="min-h-screen">
            <title>Home - Volunteerly</title>
            <Navbar></Navbar>
            <main
                className="
                    flex flex-col
                    md:h-[calc(100vh-64px)] md:flex-row
                "
            >
                <div
                    className="
                        relative flex h-screen w-full flex-col overflow-hidden
                        md:h-full md:w-1/2
                    "
                >
                    <Image
                        src={tms.src}
                        alt="Preview"
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 w-full bg-black/65"></div>
                    <div className="
                        absolute bottom-20
                        md:bottom-10
                        left-5
                        md:left-6
                        text-left
                    ">
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
                        flex size-full flex-col items-center px-8
                        md:w-1/2
                    "
                >
                    <h1 className="text-4xl pt-5 text-left font-bold tracking-tight">
                        How It Works?
                    </h1>
                    <div className="flex flex-1 flex-col justify-around">
                        <div className="space-y-0 text-left">
                            <h2
                                className="
                                    mb-2 flex items-center gap-2 text-xl font-semibold
                                    text-muted-foreground
                                "
                            >
                                <User className="inline-block" />
                                For Volunteers
                            </h2>
                            <Item>
                                <ItemMedia variant="icon">
                                    <Upload />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle>UPLOAD EXPERIENCE</ItemTitle>
                                    <ItemDescription>
                                        Share your professional background to find the perfect
                                        match.
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item>
                                <ItemMedia variant="icon">
                                    <Merge />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle>MATCH WITH OPPORTUNITIES</ItemTitle>
                                    <ItemDescription>
                                        Browse curated high-impact projects that align with your
                                        passion.
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item>
                                <ItemMedia variant="icon">
                                    <HandHeart />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle>VOLUNTEER YOUR SKILLS</ItemTitle>
                                    <ItemDescription>
                                        Collaborate with non-profits and drive real social change.
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                        </div>
                        <div className="space-y-0 text-left">
                            <h2
                                className="
                                    mb-2 flex items-center gap-2 text-xl font-semibold
                                    text-muted-foreground
                                "
                            >
                                <HouseHeart className="inline-block" />
                                For Organizations
                            </h2>
                            <Item>
                                <ItemMedia variant="icon">
                                    <Upload />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle>POST AN OPPURTUNITY</ItemTitle>
                                    <ItemDescription>
                                        Define your needs and create a listing for expert help.
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item>
                                <ItemMedia variant="icon">
                                    <Merge />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle>BROWSE SKILLED TALENT</ItemTitle>
                                    <ItemDescription>
                                        Review profiles of vetted professionals ready to contribute.
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item>
                                <ItemMedia variant="icon">
                                    <HandHeart />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle>GROW YOUR IMPACT</ItemTitle>
                                    <ItemDescription>
                                        Successfully complete projects and scale your
                                        organization&apos;s reach.
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
