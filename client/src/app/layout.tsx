/**
 * layout.tsx
 * Configures the root layout, fonts, and global providers.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "../providers/auth-provider";
import "./globals.css";

export const dynamic = "force-dynamic";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Volunteerly",
    description: "Turn Skills Into Real Impact, AI-Powered Matching for Skilled Volunteering.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            </head>
            <body
                className={`
                    ${geistSans.variable}
                    ${geistMono.variable}
                    antialiased
                `}
            >
                <AuthProvider>{children}</AuthProvider>
                <Toaster position="bottom-right" expand={false} richColors={true} />
            </body>
        </html>
    );
}
