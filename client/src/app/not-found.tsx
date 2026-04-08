import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-background">
            <div
                className="
                absolute inset-0
                bg-[radial-gradient(circle_at_top,rgba(244,209,37,0.16),transparent_32%)]
            "
            />
            <div
                className="
                absolute inset-x-0 top-0 h-44 bg-linear-to-b from-secondary to-transparent
            "
            />

            <header
                className="
                relative z-10 w-full p-6
                lg:px-10
            "
            >
                <Link href="/" className="inline-flex w-fit">
                    <Image src={logo} alt="Volunteerly" width={170} height={40} priority />
                </Link>
            </header>

            <div
                className="
                relative z-10 flex min-h-[calc(100vh-88px)] items-center justify-center px-6 pb-10
                lg:px-10
            "
            >
                <section
                    className="
                    w-full max-w-4xl rounded-[2rem] border border-border bg-card/95 p-8 shadow-sm
                    backdrop-blur-sm
                    sm:p-12
                    lg:p-14
                "
                >
                    <div
                        className="
                        grid gap-8
                        lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10
                    "
                    >
                        <div
                            className="
                            text-7xl leading-none font-black tracking-tight text-primary
                            sm:text-8xl
                            lg:text-9xl
                        "
                        >
                            404
                        </div>

                        <div className="space-y-4">
                            <h1
                                className="
                                text-3xl font-extrabold tracking-tight text-slate-900
                                sm:text-5xl
                            "
                            >
                                This page took a wrong turn.
                            </h1>

                            <p
                                className="
                                max-w-2xl text-base text-muted-foreground
                                sm:text-lg
                            "
                            >
                                The page you were looking for does not exist, may have moved, or the
                                link was incomplete.
                            </p>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <Button asChild size="lg" className="cursor-pointer">
                                    <Link href="/">Go Home</Link>
                                </Button>

                                <Button
                                    asChild
                                    variant="outline"
                                    size="lg"
                                    className="cursor-pointer"
                                >
                                    <Link href="/login">Go to Login</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
