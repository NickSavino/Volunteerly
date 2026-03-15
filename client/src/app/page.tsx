"use client";

import { Button } from "../components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/auth-provider";
import { useEffect } from "react";
import { Navbar } from "@/components/custom/login_navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import tms from "@/assets/tms.png"
import avtImg from "@/assets/avatarImg.png"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { InboxIcon, User, Upload, Merge, HandHeart, HouseHeart } from "lucide-react";

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
    <div className="min-h-screen">
      <title>Home - Volunteerly</title>
      <Navbar></Navbar>
      <main className="flex flex-col md:flex-row md:h-[calc(100vh-64px)]">
        <div className="w-full md:w-1/2 relative h-screen md:h-full overflow-hidden flex flex-col">
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
        <div className="w-full md:w-1/2 items-center h-full flex flex-col px-8 ">
          <h1 className="text-4x1 font-bold tracking-tight pt-5 text-left">How It Works?</h1>
          <div className="flex flex-col flex-1 justify-around">
            <div className="space-y-0 text-left">
              <h2 className="text-xl font-semibold text-muted-foreground mb-2 flex items-center gap-2"> 
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
                    Share your professional background to find the perfect match.
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
                    Browse curated high-impact projects that align with your passion.
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
              <h2 className="text-xl font-semibold text-muted-foreground mb-2 flex items-center gap-2"> 
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
                    Define your needs and create a  listing for expert help.
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
                    Successfully complete projects and scale your organization's reach.
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
