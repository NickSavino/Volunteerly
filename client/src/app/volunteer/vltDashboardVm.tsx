import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/UserService";
import { VolunteerService, PartnerOrg } from "@/services/VolunteerService";
import { useAuth } from "@/providers/auth-provider";
import { CurrentVolunteer, Opportunity } from "@volunteerly/shared";

export type ChartRange = "last_month" | "last_6_months" | "last_year" | "total";

export function useVltDashboardViewModel() {
    const router = useRouter();
    const { session, user, loading, signOut } = useAuth();
    const [currentVolunteer, setCurrentVolunteer] = useState<CurrentVolunteer | undefined>(undefined);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [partnerOrgs, setPartnerOrgs] = useState<PartnerOrg[]>([]);
    const [monthlyHoursMap, setMonthlyHoursMap] = useState<Record<string, number>>({});
    const [chartRange, setChartRange] = useState<ChartRange>("last_6_months");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !session) router.replace("/login");
    }, [loading, session, router]);

    useEffect(() => {
        async function loadData() {
            if (!session?.access_token) return;
            try {
                const userResult = await UserService.getCurrentUser();
                if (!userResult.success) { setError("Received invalid user data from the server."); return; }
                if (userResult.data.role !== "VOLUNTEER") { router.replace("/bootstrap"); return; }

                const volResult = await VolunteerService.getCurrentVolunteer();
                if (!volResult.success) { setError("Failed to load volunteer."); return; }
                setCurrentVolunteer(volResult.data);

                const oppResult = await VolunteerService.getYourOpportunities();
                if (!oppResult.success) { setError("Failed to load opportunities."); return; }
                setOpportunities(oppResult.data);

                const orgResult = await VolunteerService.getVolunteerOrganizations();
                if (!orgResult.success) { setError("Failed to load organizations."); return; }
                setPartnerOrgs(orgResult.data);

                const hoursResult = await VolunteerService.getMonthlyHours();
                if (!hoursResult.success) { setError("Failed to load monthly hours."); return; }
                setMonthlyHoursMap(hoursResult.data);

            } catch (err) {
                console.error(err);
                setError("Failed to load data.");
            }
        }
        loadData();
    }, [session, router]);

    const handleSignOut = async () => { await signOut(); router.push("/"); };

    // KPIs derived from real data
    const totalHours = useMemo(() =>
        opportunities.reduce((sum, opp) => sum + opp.hours, 0),
    [opportunities]);

    const economicValue = useMemo(() =>
        Math.round(totalHours * 25),
    [totalHours]);

    const orgsAssisted = partnerOrgs.length;

    const impactScore = useMemo(() =>
        Math.round(economicValue * orgsAssisted),
    [economicValue, orgsAssisted]);

    // Chart data filtered by range
    const { chartLabels, chartData } = useMemo(() => {
        const now = new Date();
        const allKeys = Object.keys(monthlyHoursMap).sort();

        let filtered: string[];
        if (chartRange === "last_month") {
            const cutoff = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            filtered = allKeys.filter(k => new Date(k + "-01") >= cutoff);
        } else if (chartRange === "last_6_months") {
            const cutoff = new Date(now.getFullYear(), now.getMonth() - 5, 1);
            filtered = allKeys.filter(k => new Date(k + "-01") >= cutoff);
        } else if (chartRange === "last_year") {
            const cutoff = new Date(now.getFullYear() - 1, now.getMonth(), 1);
            filtered = allKeys.filter(k => new Date(k + "-01") >= cutoff);
        } else {
            filtered = allKeys;
        }

        // if no data yet, show empty placeholders for last 6 months
        if (filtered.length === 0) {
            const labels = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                labels.push(d.toLocaleString("default", { month: "short" }).toUpperCase());
            }
            return { chartLabels: labels, chartData: labels.map(() => 0) };
        }

        return {
            chartLabels: filtered.map(k => {
                const [year, month] = k.split("-");
                return new Date(Number(year), Number(month) - 1, 1)
                    .toLocaleString("default", { month: "short" })
                    .toUpperCase();
            }),
            chartData: filtered.map(k => monthlyHoursMap[k]),
        };
    }, [monthlyHoursMap, chartRange]);

    return {
        loading, session, router, user, error,
        currentVolunteer, opportunities, partnerOrgs,
        handleSignOut,
        firstName: currentVolunteer?.firstName ?? "Volunteer",
        totalHours,
        economicValue,
        impactScore,
        orgsAssisted,
        chartLabels,
        chartData,
        chartRange,
        setChartRange,
    };
}