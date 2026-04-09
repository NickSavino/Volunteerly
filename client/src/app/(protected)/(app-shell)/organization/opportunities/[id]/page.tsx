"use client";

import avtImg from "@/assets/avatarImg.png";
import volunteerly_logo from "@/assets/volunteerly_logo.png";
import { AppModal } from "@/components/common/app-modal";
import { LoadingScreen } from "@/components/common/loading-screen";
import { OrgStatCard } from "@/components/custom/org_stat_card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserService } from "@/services/UserService";
import {
    AlarmClockCheck,
    ArrowLeft,
    Calendar,
    CalendarX,
    CircleDollarSign,
    Clock4,
    Handshake,
    MessageCircleMore,
    User,
    UserStar,
} from "lucide-react";
import Image from "next/image";
import { use, useState } from "react";
import { useOrgViewOpportunityViewModel } from "./orgViewOpportunityVm";

export default function ViewOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const {
        loading,
        fetching,
        session,
        router,
        opportunity,
        applications,
        completeOpportunity,
        totalHours,
        monetaryValue,
        setProgressUpdate,
        addUpdate,
        reviewModalOpen,
        setReviewModalOpen,
        submitting,
        submitReview,
    } = useOrgViewOpportunityViewModel(id);

    if (loading || !session || fetching) {
        return <LoadingScreen />;
    }

    return (
        <>
            <div className="min-h-screen">
                <title>Organization View Opportunity - Volunteerly</title>

                <main
                    className="
                        flex flex-col p-6
                        md:mx-10 md:h-[calc(100vh-64px)] md:flex-row
                    "
                >
                    <div
                        className="
                            mx-auto mb-10 flex min-h-full w-full flex-col gap-6
                            md:mb-0 md:w-3/4
                        "
                    >
                        <div>
                            <Button
                                variant="ghost"
                                className="cursor-pointer"
                                onClick={() => router.back()}
                            >
                                <ArrowLeft className="size-4" />
                                Back
                            </Button>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge>{opportunity?.status}</Badge>
                                {opportunity?.status == "OPEN" ? (
                                    <p>Posted on {opportunity?.postedDate.toLocaleDateString()}</p>
                                ) : opportunity?.status == "FILLED" ? (
                                    <p>Started on {opportunity?.updatedAt.toLocaleDateString()}</p>
                                ) : (
                                    <p>
                                        Completed on {opportunity?.updatedAt.toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <h2 className="font-bold">
                            {opportunity?.name} - {opportunity?.workType} - {opportunity?.category}
                        </h2>
                        {opportunity?.status == "CLOSED" && (
                            <div
                                className="md:grid md:grid-cols-2 md:justify-around md:gap-3">
                                <OrgStatCard
                                    icon={Clock4}
                                    label="Hours Spent"
                                    count={totalHours}
                                    money={false}
                                />
                                <OrgStatCard
                                    icon={CircleDollarSign}
                                    label="Monetary Valuation"
                                    count={monetaryValue}
                                    money={true}
                                />
                            </div>
                        )}
                        {opportunity?.status == "OPEN" ? (
                            <div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Project Description</CardTitle>
                                        <CardAction>
                                            <Button
                                                variant={"outline"}
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    router.replace(
                                                        `/organization/opportunities/${id}/update`,
                                                    )
                                                }
                                            >
                                                Edit
                                            </Button>
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent>{opportunity?.description}</CardContent>
                                    <CardHeader>
                                        <CardTitle>Ideal Candidate</CardTitle>
                                    </CardHeader>
                                    <CardContent>{opportunity?.candidateDesc}</CardContent>

                                    <CardContent
                                        className="
                                            justify-around
                                            md:flex
                                        "
                                    >
                                        <span className="flex flex-1 items-center gap-3">
                                            <Calendar className="size-9" />
                                            <div className="flex flex-col">
                                                <span className="text-xs">Length</span>
                                                <span className="text-sm">
                                                    {opportunity?.length}
                                                </span>
                                            </div>
                                        </span>
                                        <span className="flex flex-1 items-center gap-3">
                                            <CalendarX className="size-9" />
                                            <div className="flex flex-col">
                                                <span className="text-xs">Deadline</span>
                                                <span className="text-sm">
                                                    {opportunity?.deadlineDate?.toLocaleDateString()}
                                                </span>
                                            </div>
                                        </span>
                                    </CardContent>
                                    <CardContent
                                        className="
                                            justify-around
                                            md:flex
                                        "
                                    >
                                        <span className="flex flex-1 items-center gap-3">
                                            <AlarmClockCheck className="size-9" />
                                            <div className="flex flex-col">
                                                <span className="text-xs">Availability</span>
                                                <span className="text-sm">
                                                    {opportunity?.availability.join(", ")}
                                                </span>
                                            </div>
                                        </span>

                                        <span className="flex flex-1 items-center gap-3">
                                            <Handshake className="size-9" />
                                            <div className="flex flex-col">
                                                <span className="text-xs">Commitment</span>
                                                <span className="text-sm">
                                                    {opportunity?.commitmentLevel}
                                                </span>
                                            </div>
                                        </span>
                                    </CardContent>
                                </Card>
                                <Card className="my-5">
                                    <CardHeader>
                                        <CardTitle>Applications</CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        {applications.length === 0 ? (
                                            <CardContent
                                                className="
                                                    flex h-full flex-col justify-center text-center
                                                "
                                            >
                                                <div className="mb-4 flex justify-center">
                                                    <Avatar size="lg">
                                                        <AvatarImage src={volunteerly_logo.src} />
                                                        <AvatarFallback></AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <h3 className="text-lg">No Applications</h3>
                                                <p>
                                                    Volunteer Applications for this posting show up
                                                    here.
                                                </p>
                                            </CardContent>
                                        ) : (
                                            applications.map((app) => (
                                                <Item
                                                    key={app.id}
                                                    variant="outline"
                                                    className="mb-2"
                                                >
                                                    <ItemMedia>
                                                        <Avatar size="lg">
                                                            <Avatar className="h-auto w-10">
                                                                <AvatarImage
                                                                    src={UserService.getAvatarURL(
                                                                        app?.volId || "",
                                                                    )}
                                                                />
                                                                <AvatarFallback>
                                                                    {" "}
                                                                    <User className="h-auto w-20"></User>
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        </Avatar>
                                                    </ItemMedia>
                                                    <ItemContent>
                                                        <ItemTitle>
                                                            {app.volunteer?.firstName}{" "}
                                                            {app.volunteer?.lastName}
                                                        </ItemTitle>
                                                        <ItemDescription
                                                            className="
                                                                flex flex-wrap items-center gap-2
                                                            "
                                                        >
                                                            {app.message}
                                                        </ItemDescription>
                                                    </ItemContent>
                                                    <ItemActions>
                                                        <Badge
                                                            className={
                                                                app.matchPercentage >= 80
                                                                    ? "bg-green-500"
                                                                    : app.matchPercentage >= 50
                                                                      ? "bg-yellow-500"
                                                                      : "bg-red-500"
                                                            }
                                                        >
                                                            {app.matchPercentage}% Match
                                                        </Badge>
                                                        <Button
                                                            variant="outline"
                                                            className="cursor-pointer"
                                                            size="sm"
                                                            onClick={async () => {
                                                                router.push(
                                                                    `/organization/opportunities/${opportunity.id}/application/${app.id}`,
                                                                );
                                                            }}
                                                        >
                                                            View Application
                                                        </Button>
                                                    </ItemActions>
                                                </Item>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div>
                                <Card className="mb-5">
                                    <CardHeader>
                                        <CardTitle>Opportunity Overview</CardTitle>
                                        <CardDescription>
                                            {opportunity?.description}
                                        </CardDescription>
                                        {opportunity?.status == "FILLED" && (
                                            <CardAction
                                                className="
                                                    mt-2 w-full
                                                    md:mt-0 md:w-auto
                                                "
                                            >
                                                <Button
                                                    className="
                                                        w-full cursor-pointer
                                                        md:w-auto
                                                    "
                                                    onClick={completeOpportunity}
                                                >
                                                    Complete
                                                </Button>
                                            </CardAction>
                                        )}
                                    </CardHeader>
                                    <CardContent
                                        className="
                                            justify-around
                                            md:flex
                                        "
                                    >
                                        <span className="flex flex-1 items-center gap-3">
                                            <Calendar className="size-9" />
                                            <div className="flex flex-col">
                                                <span className="text-xs">Length</span>
                                                <span className="text-sm">
                                                    {opportunity?.length}
                                                </span>
                                            </div>
                                        </span>
                                        <span className="flex flex-1 items-center gap-3">
                                            <AlarmClockCheck className="size-9" />
                                            <div className="flex flex-col">
                                                <span className="text-xs">Availability</span>
                                                <span>{opportunity?.availability.join(", ")}</span>
                                            </div>
                                        </span>

                                        <span className="flex flex-1 items-center gap-3">
                                            <Handshake className="size-9" />
                                            <div className="flex flex-col">
                                                <span className="text-xs">Commitment</span>
                                                <span>{opportunity?.commitmentLevel}</span>
                                            </div>
                                        </span>
                                    </CardContent>
                                </Card>

                                <Card className="mb-5">
                                    <CardContent>
                                        <div
                                            className="
                                                gap-6 text-center
                                                md:grid md:grid-cols-8 md:text-left
                                            "
                                        >
                                            <div
                                                className="
                                                    flex justify-center
                                                    md:col-span-2 md:w-full
                                                "
                                            >
                                                <Image
                                                    src={avtImg.src}
                                                    className="w-22 rounded-lg object-cover"
                                                    height={10}
                                                    width={10}                                                
                                                    alt=""
                                                />
                                            </div>

                                            <div
                                                className="
                                                    flex flex-col gap-3
                                                    md:col-span-4
                                                "
                                            >
                                                <p>Assigned Volunteer</p>
                                                <h3>
                                                    {opportunity?.volunteer?.firstName}{" "}
                                                    {opportunity?.volunteer?.lastName}
                                                </h3>
                                            </div>

                                            <div
                                                className="
                                                    flex flex-col gap-3
                                                    md:col-span-2
                                                "
                                            >
                                                <Button
                                                    variant="outline"
                                                    data-icon="inline-end"
                                                    className="cursor-pointer"
                                                    onClick={() => setReviewModalOpen(true)}
                                                >
                                                    {" "}
                                                    <UserStar /> Review
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    data-icon="inline-end"
                                                    className="cursor-pointer"
                                                >
                                                    {" "}
                                                    <MessageCircleMore /> Message
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="mb-5">
                                    <CardHeader>
                                        <CardTitle>Progress Tracking</CardTitle>
                                        {opportunity?.status == "FILLED" && (
                                            <CardAction>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            className="cursor-pointer"
                                                        >
                                                            Add Update
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-sm">
                                                        <form onSubmit={addUpdate}>
                                                            <DialogHeader className="mb-5">
                                                                <DialogTitle>
                                                                    Add Progress Update
                                                                </DialogTitle>
                                                            </DialogHeader>
                                                            <FieldGroup>
                                                                <Label htmlFor="progU-title">
                                                                    Title
                                                                </Label>
                                                                <Input
                                                                    id="pu-title"
                                                                    name="title"
                                                                    onChange={(e) =>
                                                                        setProgressUpdate((prev) =>
                                                                            prev
                                                                                ? {
                                                                                      ...prev,
                                                                                      title: e
                                                                                          .target
                                                                                          .value,
                                                                                  }
                                                                                : prev,
                                                                        )
                                                                    }
                                                                    required
                                                                />
                                                                <Label htmlFor="progU-desc">
                                                                    Description
                                                                </Label>
                                                                <Textarea
                                                                    id="progU-desc"
                                                                    name="description"
                                                                    onChange={(e) =>
                                                                        setProgressUpdate((prev) =>
                                                                            prev
                                                                                ? {
                                                                                      ...prev,
                                                                                      description:
                                                                                          e.target
                                                                                              .value,
                                                                                  }
                                                                                : prev,
                                                                        )
                                                                    }
                                                                    required
                                                                />
                                                                <Label htmlFor="progU-hours">
                                                                    Hours Contribuited
                                                                </Label>
                                                                <Input
                                                                    id="progU-hours"
                                                                    type="number"
                                                                    name="hours"
                                                                    onChange={(e) =>
                                                                        setProgressUpdate((prev) =>
                                                                            prev
                                                                                ? {
                                                                                      ...prev,
                                                                                      hoursContributed:
                                                                                          Number(
                                                                                              e
                                                                                                  .target
                                                                                                  .value,
                                                                                          ),
                                                                                  }
                                                                                : prev,
                                                                        )
                                                                    }
                                                                    required
                                                                />
                                                            </FieldGroup>
                                                            <DialogFooter className="mt-5">
                                                                <DialogClose asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        className="cursor-pointer"
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </DialogClose>
                                                                <Button
                                                                    type="submit"
                                                                    className="cursor-pointer"
                                                                >
                                                                    Add
                                                                </Button>
                                                            </DialogFooter>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>
                                            </CardAction>
                                        )}
                                    </CardHeader>
                                    {opportunity?.progressUpdates?.length === 0 ? (
                                        <CardContent
                                            className="
                                                flex h-full flex-col justify-center text-center
                                            "
                                        >
                                            <div className="mb-4 flex justify-center">
                                                <Avatar size="lg">
                                                    <AvatarImage src={volunteerly_logo.src} />
                                                    <AvatarFallback></AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <h3 className="text-lg">No Updates</h3>
                                            <p>
                                                Progress Updates for this opportunity will show up
                                                here.
                                            </p>
                                        </CardContent>
                                    ) : (
                                        <CardContent className="space-y-4">
                                            <div
                                                className="
                                                    max-h-40 space-y-4 overflow-y-auto border-l-2
                                                    pl-4
                                                "
                                            >
                                                {opportunity?.progressUpdates?.map((update) => (
                                                    <div key={update.id}>
                                                        <span
                                                            className="
                                                                absolute top-1 -left-3 size-3
                                                                rounded-full bg-primary
                                                            "
                                                        />
                                                        <p className="text-xs">
                                                            {update.createdAt.toLocaleDateString()}
                                                        </p>
                                                        <h5 className="text-lg">{update.title}</h5>
                                                        <p className="text-sm text-muted-foreground">
                                                            {update.description}
                                                        </p>
                                                        <p className="text-xs">
                                                            {update.senderRole}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <ReviewModal
                open={reviewModalOpen}
                volunteerName={`${opportunity?.volunteer?.firstName ?? ""} ${opportunity?.volunteer?.lastName ?? ""}`.trim()}
                submitting={submitting}
                onClose={() => setReviewModalOpen(false)}
                onSubmit={submitReview}
            />
        </>
    );
}

function ReviewModal({
    open,
    volunteerName,
    submitting,
    onClose,
    onSubmit,
}: {
    open: boolean;
    volunteerName: string;
    submitting: boolean;
    onClose: () => void;
    onSubmit: (input: { rating: number; flagged: boolean; flagReason?: string }) => Promise<void>;
}) {
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [flagged, setFlagged] = useState(false);
    const [flagReason, setFlagReason] = useState("");
    const [touched, setTouched] = useState(false);

    const ratingMissing = rating === 0;
    const flagReasonEmpty = flagged && flagReason.trim().length === 0;

    async function handleSubmit() {
        setTouched(true);
        if (ratingMissing || flagReasonEmpty || submitting) return;
        await onSubmit({ rating, flagged, flagReason: flagged ? flagReason : undefined });
        setRating(0);
        setFlagged(false);
        setFlagReason("");
        setTouched(false);
    }

    function handleClose() {
        if (submitting) return;
        setRating(0);
        setFlagged(false);
        setFlagReason("");
        setTouched(false);
        onClose();
    }

    return (
        <AppModal
            open={open}
            onClose={handleClose}
            title="Post Review"
            maxWidthClassName="sm:max-w-lg"
            footer={
                <>
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="
                            h-11 min-w-24 rounded-xl border border-border bg-card px-5 text-sm
                            font-semibold text-foreground
                            hover:bg-secondary
                            disabled:opacity-50
                        "
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="
                            h-11 min-w-24 rounded-xl bg-primary px-5 text-sm font-semibold
                            text-foreground
                            hover:opacity-90
                            disabled:opacity-50
                        "
                    >
                        {submitting ? "Posting..." : "Post"}
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <p className="text-sm text-foreground">
                    Reviewing: <span className="font-semibold">{volunteerName}</span>
                </p>

                <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Rating</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                disabled={submitting}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHovered(star)}
                                onMouseLeave={() => setHovered(0)}
                                className="
                                    text-2xl leading-none
                                    disabled:opacity-50
                                "
                            >
                                <span
                                    className={
                                        (hovered || rating) >= star
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                    }
                                >
                                    ★
                                </span>
                            </button>
                        ))}
                    </div>
                    {touched && ratingMissing && (
                        <p className="mt-1 text-xs text-destructive">Please select a rating.</p>
                    )}
                </div>

                <label className="flex cursor-pointer items-center gap-2 select-none">
                    <input
                        type="checkbox"
                        checked={flagged}
                        onChange={(e) => setFlagged(e.target.checked)}
                        disabled={submitting}
                        className="size-4 rounded-sm border-gray-300 accent-yellow-400"
                    />
                    <span className="text-sm text-foreground">Flag this volunteer</span>
                </label>

                {flagged && (
                    <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                            Reason for flagging:
                        </label>
                        <textarea
                            value={flagReason}
                            onChange={(e) => setFlagReason(e.target.value)}
                            placeholder="Describe why you are flagging this volunteer..."
                            rows={4}
                            disabled={submitting}
                            className={`
                                w-full resize-none rounded-xl border bg-muted px-4 py-2.5 text-sm
                                text-foreground
                                placeholder:text-muted-foreground
                                focus:ring-2 focus:ring-ring focus:outline-none
                                disabled:opacity-50
                                ${touched && flagReasonEmpty ? "border-destructive" : "border-border"}`}
                        />
                        {touched && flagReasonEmpty && (
                            <p className="mt-1 text-xs text-destructive">
                                Please provide a reason for flagging.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </AppModal>
    );
}
