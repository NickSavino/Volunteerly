/**
 * opportunityForm.tsx
 * Shared opportunity form used for both creating and editing opportunities
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { UpdateOpportunitySchema } from "@volunteerly/shared";

type OpportunityFormProps = {
    opportunity: UpdateOpportunitySchema;
    editing: boolean;
    handleSubmit: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void>;
    setOpportunity: React.Dispatch<React.SetStateAction<UpdateOpportunitySchema>>;
    deadlineDate: string;
    handleDayToggle: (day: string) => Promise<void>;
    setDeadlineDate: React.Dispatch<React.SetStateAction<string>>;
};

// Full week used to render the availability day toggles
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function OpportunityForm({
    opportunity,
    editing,
    handleSubmit,
    setOpportunity,
    deadlineDate,
    handleDayToggle,
    setDeadlineDate,
}: OpportunityFormProps) {
    return (
        <Card className="w-full max-w-4xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>
                        {editing ? "Update Opportunity" : "Create New Opportunity"}
                    </CardTitle>
                    <CardDescription>
                        {" "}
                        This information will be used to match Volunteers{" "}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                    {/* Name and category sit side by side on larger screens */}
                    <div
                        className="
                            grid grid-cols-1 gap-4
                            md:grid-cols-2
                        "
                    >
                        <Field>
                            <Label htmlFor="name">
                                Name<span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Analytical Dashboard Development"
                                value={opportunity?.name}
                                onChange={(e) =>
                                    setOpportunity((prev) =>
                                        prev ? { ...prev, name: e.target.value } : prev,
                                    )
                                }
                                required
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="category">
                                Category<span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="category"
                                type="text"
                                placeholder="Data Science"
                                value={opportunity?.category}
                                onChange={(e) =>
                                    setOpportunity((prev) =>
                                        prev ? { ...prev, category: e.target.value } : prev,
                                    )
                                }
                                required
                            />
                        </Field>
                    </div>

                    <Field>
                        <Label htmlFor="desc">
                            Description<span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="desc"
                            placeholder="Describe Opportunity"
                            value={opportunity?.description}
                            onChange={(e) =>
                                setOpportunity((prev) =>
                                    prev ? { ...prev, description: e.target.value } : prev,
                                )
                            }
                            required
                        />
                        <FieldDescription>
                            Provide detailed description of opportunity
                        </FieldDescription>
                    </Field>

                    <Field>
                        <Label htmlFor="candidate">
                            Ideal Candidate<span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="candidate"
                            placeholder="Describe Candidate"
                            value={opportunity?.candidateDesc}
                            onChange={(e) =>
                                setOpportunity((prev) =>
                                    prev ? { ...prev, candidateDesc: e.target.value } : prev,
                                )
                            }
                            required
                        />
                        <FieldDescription>
                            Provide technical and non-technical requirements
                        </FieldDescription>
                    </Field>

                    {/* Work type and commitment level dropdowns */}
                    <div
                        className="
                            grid grid-cols-1 gap-4
                            md:grid-cols-2
                        "
                    >
                        <Field>
                            <Label htmlFor="wrkType">
                                Work Type<span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={opportunity?.workType}
                                onValueChange={(e) =>
                                    setOpportunity((prev) =>
                                        prev
                                            ? {
                                                  ...prev,
                                                  workType: e as "IN_PERSON" | "REMOTE" | "HYBRID",
                                              }
                                            : prev,
                                    )
                                }
                                required
                            >
                                <SelectTrigger id="wrkType">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="IN_PERSON">In-Person</SelectItem>
                                    <SelectItem value="REMOTE">Remote</SelectItem>
                                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <Label htmlFor="commitment">
                                Commitment Level<span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={opportunity?.commitmentLevel}
                                onValueChange={(e) =>
                                    setOpportunity((prev) =>
                                        prev
                                            ? {
                                                  ...prev,
                                                  commitmentLevel: e as
                                                      | "FLEXIBLE"
                                                      | "PART_TIME"
                                                      | "FULL_TIME",
                                              }
                                            : prev,
                                    )
                                }
                                required
                            >
                                <SelectTrigger id="commitment">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FLEXIBLE">
                                        Flexible (2-5 hrs/week)
                                    </SelectItem>
                                    <SelectItem value="PART_TIME">
                                        Part-Time (5-20 hrs/week)
                                    </SelectItem>
                                    <SelectItem value="FULL_TIME">
                                        Full-Time (20+ hrs/week)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    {/* Duration length and application deadline */}
                    <div
                        className="
                            grid grid-cols-1 gap-4
                            md:grid-cols-2
                        "
                    >
                        <Field>
                            <Label htmlFor="length">
                                Opportunity Length<span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={opportunity?.length}
                                onValueChange={(e) =>
                                    setOpportunity((prev) => (prev ? { ...prev, length: e } : prev))
                                }
                                required
                            >
                                <SelectTrigger id="length">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Days">Days</SelectItem>
                                    <SelectItem value="Months">Months</SelectItem>
                                    <SelectItem value="Years">Years</SelectItem>
                                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <Label htmlFor="deadline">
                                Application Deadline<span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="deadline"
                                type="date"
                                value={deadlineDate}
                                onChange={(e) => setDeadlineDate(e.target.value)}
                                required
                            />
                        </Field>
                    </div>

                    {/* Day-of-week availability toggles - one per day across a 7-column grid */}
                    <Field>
                        <Label htmlFor="availability">
                            Availability<span className="text-destructive">*</span>
                        </Label>
                        <div
                            className="
                                w-full gap-2
                                md:grid md:grid-cols-7
                            "
                        >
                            {daysOfWeek.map((day) => (
                                <Toggle
                                    key={day}
                                    className="w-full cursor-pointer"
                                    variant="outline"
                                    aria-label={day}
                                    pressed={opportunity.availability.includes(day)}
                                    onClick={() => handleDayToggle(day)}
                                >
                                    {day}
                                </Toggle>
                            ))}
                        </div>
                    </Field>
                </CardContent>

                <div className="px-6">
                    <Button type="submit" className="w-full cursor-pointer">
                        {editing ? "Save Changes" : "Publish"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
