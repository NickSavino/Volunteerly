"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
} from "@/components/ui/field"
import { useOrgApplicationViewModel } from "./orgApplicationVm";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/app/(protected)/(setup)/organization/application/navbar";

export default function OrgApplicationPage() {
  const {        
    loading,
    submitting,
    currentOrg,
    isReadOnly,
    router,
    setFile,
    setCurrentOrg,
    signOut,
    handleSubmit,
    viewSubmittedDoc,
    address,
    setAddress
  } = useOrgApplicationViewModel()


  if (loading || submitting) {
    return <main className="p-6">Loading...</main>
  }

  return (
      <div className="min-h-screen">
          <title>Organization Application - Volunteerly</title>
          <Navbar avtImg={{src: ""}} name={currentOrg?.orgName || "Organization"} role={"Unverified"} onLogout={signOut}></Navbar>
        <main className="w-full items-center h-full flex flex-col p-8 ">
          <div className="w-full flex justify-start">
          {isReadOnly && <Button
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    }
          </div>
          <div className="text-center pb-5">        
            <div className="text-foreground bg-warning mb-5 p-1 radius-2 rounded-sm">
                <h2>{isReadOnly ? "Application Submitted":"Limited Functionality"}</h2>
                <p className="text-sm text-center text-foreground bg-warning my-2 p-1 radius-2 rounded-sm">
                  {isReadOnly ? "Your Application has been successfully submitted.":"Complete Application Below to gain full access as organization."}
                </p>
            </div>

            <h1>Organization Application</h1>
            <p className="text-center">To ensure the integrity of our platform, all organizations must be verified. <br/> Complete the application below and our moderators will review it.</p>
          </div>
            <Card className="w-full max-w-4xl">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                  <CardDescription> Basic information about your non-profit </CardDescription>              
                </CardHeader>
                <CardContent className="space-y-3">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field >
                      <Label htmlFor="orgName">Organization Name <span className="text-destructive">*</span></Label>
                      <Input id="orgName" disabled={isReadOnly} type="text"  value={currentOrg?.orgName || ""} placeholder="Legal name of organization" 
                      onChange={(e) => setCurrentOrg((prev) => prev ? { ...prev, orgName: e.target.value } : prev)} required/>
                    </Field>
                    <Field>
                        <Label htmlFor="causeCategory">Cause Category<span className="text-destructive">*</span></Label>
                        <Input id="causeCategory"  disabled={isReadOnly} type="text" placeholder="Education" value={currentOrg?.causeCategory}
                          onChange={(e) => setCurrentOrg((prev) => prev ? { ...prev, causeCategory: e.target.value } : prev)} required/>
                    </Field>
                  </div>
                    <Field>
                      <Label htmlFor="website">Website<span className="text-destructive">*</span></Label>
                      <InputGroup id="website">
                        <InputGroupInput id="website" disabled={isReadOnly} type="text" placeholder="example.org" value={currentOrg?.website}
                          onChange={(e) => setCurrentOrg((prev) => prev ? { ...prev, website: e.target.value } : prev)} required/>
                        <InputGroupAddon>
                          <InputGroupText>https://</InputGroupText>
                        </InputGroupAddon>              
                      </InputGroup>
                    </Field>
                    <Field>
                      <Label htmlFor="address">Street Address<span className="text-destructive">*</span></Label>
                      <Input id="address" disabled={isReadOnly} type="text" placeholder="2500 University Dr NW" value={address.streetAdr}
                          onChange={(e) => setAddress((prev) => prev ? { ...prev, streetAdr: e.target.value } : prev)} required/>
                    </Field>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field>
                      <Label htmlFor="city">City<span className="text-destructive">*</span></Label>
                      <Input id="city" disabled={isReadOnly} type="text" placeholder="Calgary" value={address.city}
                          onChange={(e) => setAddress((prev) => prev ? { ...prev, city: e.target.value } : prev)} required/>
                    </Field>

                    <Field>
                      <Label htmlFor="province">Province<span className="text-destructive">*</span></Label>
                      <Select value={address.province} disabled={isReadOnly} onValueChange={(e) => setAddress((prev) => prev ? { ...prev, province: e } : prev)} required>
                        <SelectTrigger id="province">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AB">Alberta</SelectItem>
                          <SelectItem value="BC">British Columbia</SelectItem>
                          <SelectItem value="MB">Manitoba</SelectItem>
                          <SelectItem value="NB">New Brunswick</SelectItem>
                          <SelectItem value="NL">Newfoundland and Labrador</SelectItem>
                          <SelectItem value="NS">Nova Scotia</SelectItem>
                          <SelectItem value="ON">Ontario</SelectItem>
                          <SelectItem value="PE">Prince Edward Island</SelectItem>
                          <SelectItem value="QC">Quebec</SelectItem>
                          <SelectItem value="SK">Saskatchewan</SelectItem>
                          <SelectItem value="NT">Northwest Territories</SelectItem>
                          <SelectItem value="NU">Nunavut</SelectItem>
                          <SelectItem value="YT">Yukon</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    
                    <Field>
                      <Label htmlFor="postalCode">Postal Code<span className="text-destructive">*</span></Label>
                      <Input id="postalCode" disabled={isReadOnly} type="text" placeholder="T2N 1N4" value={address.postalCode}
                          onChange={(e) => setAddress((prev) => prev ? { ...prev, postalCode: e.target.value } : prev)} required/>
                    </Field>
                  </div>
                  <Field>
                    <Label htmlFor="mission_statement">Mission Statement<span className="text-destructive">*</span></Label>
                    <Textarea id="mission_statement" disabled={isReadOnly} placeholder="Briefly describe your organization's core mission and goals." value={currentOrg?.missionStatement}
                          onChange={(e) => setCurrentOrg((prev) => prev ? { ...prev, missionStatement: e.target.value } : prev)} required/>
                  </Field>
                  
                </CardContent>

                <CardHeader>
                  <CardTitle>Non-Profit Verification</CardTitle>
                  <CardDescription> Official documentation for verification </CardDescription>              
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field>
                      <Label htmlFor="charityNumber">Charity Number<span className="text-destructive">*</span></Label>
                      <Input id="charityNumber" disabled={isReadOnly} type="number" placeholder="XXXXXXXXX" value={currentOrg?.charityNum === 0 ? "" : currentOrg?.charityNum}
                        onChange={(e) => setCurrentOrg((prev) => prev ? { ...prev, charityNum: Number(e.target.value) } : prev)} required/>
                      <FieldDescription>9-Digit Charity Number obtained from CRA.</FieldDescription>
                    </Field>
                    <Field>
                      <Label htmlFor="documentUpload">Upload Document</Label>
                      <Input
                        id="documentUpload"
                        type="file"
                        disabled={isReadOnly}
                        accept=".pdf"
                        onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}

                      />
                      <FieldDescription>Upload CRA Notice of Registration or any other document verifying non-profit status.</FieldDescription>
                    </Field>
                  </div>
                </CardContent>

                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription> Organization Point of Contact </CardDescription>              
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field>
                      <Label htmlFor="contactName">Contact Name<span className="text-destructive">*</span></Label>
                      <Input id="contactName" disabled={isReadOnly} type="text" placeholder="John Doe" value={currentOrg?.contactName}
                          onChange={(e) => setCurrentOrg((prev) => prev ? { ...prev, contactName: e.target.value } : prev)} required/>
                    </Field>
                    <Field>
                      <Label htmlFor="contactNumber">Contact Number<span className="text-destructive">*</span></Label>
                      <Input id="contactNumber" disabled={isReadOnly} type="tel" placeholder="(403) 000-0000" value={currentOrg?.contactNum}
                          onChange={(e) => setCurrentOrg((prev) => prev ? { ...prev, contactNum: e.target.value } : prev)} required/>                      
                    </Field>                  
                  </div>
                  <Field>
                    <Label htmlFor="contactEmail">Contact Email<span className="text-destructive">*</span></Label>
                    <Input id="contactEmail" disabled={isReadOnly} type="email" placeholder="john@charity.ca" value={currentOrg?.contactEmail}
                    onChange={(e) => setCurrentOrg((prev) => prev ? { ...prev, contactEmail: e.target.value } : prev)} required/>                      
                  </Field>                  
                </CardContent>

                <div className="px-6 pb-6">
                  <Button type="submit" disabled={isReadOnly} className="w-full pointer-cursor">
                    Submit
                  </Button>
                </div>
              </form>
                {isReadOnly && (                
                  <div className="px-6 pb-6">
                    <Button type="button" onClick={viewSubmittedDoc} className="w-full pointer-cursor">
                      View Submitted Document
                    </Button>
                  </div>
                )}

            </Card>
        </main>
      </div>
    
  );
}
