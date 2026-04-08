import { resolveDefaultAppRoute } from "@/lib/utils";
import { CurrentOrganization, CurrentUser } from "@volunteerly/shared";

describe("resolveDefaultAppRoute", () => {
    it("routes unverified volunteers to experience input", () => {
        expect(
            resolveDefaultAppRoute({
                currentUser: { role: "VOLUNTEER", status: "UNVERIFIED" } as CurrentUser,
                currentOrganization: null,
            }),
        ).toBe("/volunteer/experience-input");
    });

    it("routes applied organizations to the applied dashboard", () => {
        expect(
            resolveDefaultAppRoute({
                currentUser: { role: "ORGANIZATION", status: "VERIFIED" } as CurrentUser,
                currentOrganization: { status: "APPLIED" } as CurrentOrganization,
            }),
        ).toBe("/organization/appliedDashboard");
    });
});
