"use client";

import { Button } from "@/components/ui/button";
import { OrganizationNavbar } from "../../organization_navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { useCreateOpportunityViewModel } from "./orgCreateOpportunityVm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { OrganizationLoadingPage } from "../../organization_loading";

export default function OppCreatePage() {
  const {        
    loading,
    error,
    submitting,
    currentOrg,
    router,
    opportunity,
    setOpportunity,
    signOut,
    handleSubmit,
    deadlineDate, 
    handleDayToggle,
    setDeadlineDate
  } = useCreateOpportunityViewModel()

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  if (loading || submitting) {
    return <OrganizationLoadingPage />
  }

  return (
      <div className="min-h-screen">
          <title>Organization Application - Volunteerly</title>
            <OrganizationNavbar
                currentOrg={currentOrg}
                onSignOut={async () => {
                    await signOut();
                    router.push("/");
                }}
            />            
        <main className="w-full items-center h-full flex flex-col p-8 ">
            <Card className="w-full max-w-4xl">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Create New Opportunity</CardTitle>
                  <CardDescription> This information will be used to match Volunteers </CardDescription>              
                </CardHeader>

                <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field>
                        <Label htmlFor="name">Name<span className="text-destructive">*</span></Label>
                        <Input id="name" type="text" placeholder="Analytical Dashboard Development" value={opportunity?.name}
                            onChange={(e) => setOpportunity((prev) => prev ? { ...prev, name: e.target.value } : prev)} required/>
                      </Field>

                      <Field>
                        <Label htmlFor="category">Category<span className="text-destructive">*</span></Label>
                        <Input id="category" type="text" placeholder="Data Science" value={opportunity?.category}
                            onChange={(e) => setOpportunity((prev) => prev ? { ...prev, category: e.target.value } : prev)} required/>
                      </Field>            
                    </div>
                    <Field>
                      <Label htmlFor="desc">Description<span className="text-destructive">*</span></Label>
                      <Textarea id="desc" placeholder="Describe Opportunity" value={opportunity?.description}
                          onChange={(e) => setOpportunity((prev) => prev ? { ...prev, description: e.target.value } : prev)} required/>
                      <FieldDescription>Provide detailed description of opportunity</FieldDescription>
                    </Field>
                    <Field>
                      <Label htmlFor="candidate">Ideal Candidate<span className="text-destructive">*</span></Label>
                      <Textarea id="candidate" placeholder="Describe Candidate" value={opportunity?.candidateDesc}
                          onChange={(e) => setOpportunity((prev) => prev ? { ...prev, candidateDesc: e.target.value } : prev)} required/>
                      <FieldDescription>Provide technical and non-technical requirements</FieldDescription>
                    </Field>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field>
                        <Label htmlFor="wrkType">Work Type<span className="text-destructive">*</span></Label>
                        <Select value={opportunity?.workType} onValueChange={(e) => setOpportunity((prev) => prev ? { ...prev, workType: e as "IN_PERSON" | "REMOTE" | "HYBRID" } : prev)} required>
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
                        <Label htmlFor="commitment">Commitment Level<span className="text-destructive">*</span></Label>
                        <Select value={opportunity?.commitmentLevel} onValueChange={(e) => setOpportunity((prev) => prev ? { ...prev, commitmentLevel: e as "FLEXIBLE" | "PART_TIME" | "FULL_TIME"} : prev)} required>
                          <SelectTrigger id="commitment">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FLEXIBLE">Flexible (2-5 hrs/week)</SelectItem>
                            <SelectItem value="PART_TIME">Part-Time (5-20 hrs/week)</SelectItem>
                            <SelectItem value="FULL_TIME">Full-Time (20+ hrs/week)</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>         
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field>
                        <Label htmlFor="length">Opportunity Length<span className="text-destructive">*</span></Label>
                        <Select value={opportunity?.length} onValueChange={(e) => setOpportunity((prev) => prev ? { ...prev, length: e}: prev)} required>
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
                        <Label htmlFor="deadline">Application Deadline<span className="text-destructive">*</span></Label>
                        <Input id="deadline" type="date" value={deadlineDate}
                            onChange={(e) => setDeadlineDate(e.target.value)} required/>
                      </Field>   
                    </div>
                  <Field>
                    <Label htmlFor="availability">Availability<span className="text-destructive">*</span></Label>
                    <div className="w-full md:grid md:grid-cols-7 gap-2">
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
                    Publish
                  </Button>
                </div>
              </form>
            </Card>
        </main>
      </div>
    
  );
}
