/**
 * vltDashboardVm.tsx
 * View model for the volunteer dashboard. Loads KPI data, opportunities, partner orgs, and chart data
 */
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { VolunteerService, PartnerOrg } from "@/services/VolunteerService";
import { useAuth } from "@/providers/auth-provider";
import { CurrentVolunteer, Opportunity } from "@volunteerly/shared";
import { api } from "@/lib/api";
import { CurrentUserSchema } from "@volunteerly/shared";

export type ChartRange = "last_month" | "last_6_months" | "last_year" | "this_year" | "total";


/**
 * Drives all state and data loading for the volunteer dashboard page
 * @returns all the data and handlers needed by the dashboard page component
 */
export function useVltDashboardViewModel() {
    const router = useRouter();
    const { session, user, loading, signOut } = useAuth();
    const [currentVolunteer, setCurrentVolunteer] = useState<CurrentVolunteer | undefined>(
        undefined,
    );
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [partnerOrgs, setPartnerOrgs] = useState<PartnerOrg[]>([]);
    const [monthlyHoursMap, setMonthlyHoursMap] = useState<Record<string, number>>({});
    const [chartRange, setChartRange] = useState<ChartRange>("last_6_months");
    const [error, setError] = useState<string | null>(null);
    const [fetching, setFetching] = useState(true);

    //Redirect away if unverified
    useEffect(() => {
        async function checkVerified() {
            if (loading || !session) return;
            const json = await api<unknown>("/current-user");
            const parsed = CurrentUserSchema.safeParse(json);
            if (parsed.success && parsed.data.status === "UNVERIFIED") {
                router.replace("/volunteer/experience-input");
            }
        }
        checkVerified();
    }, [session, loading, router]);

    useEffect(() => {
        async function loadData() {
            if (!session?.access_token) return;
            try {
                const volResult = await VolunteerService.getCurrentVolunteer();
                if (!volResult.success) {
                    setError("Failed to load volunteer.");
                    return;
                }
                setCurrentVolunteer(volResult.data);

                //backfill skill vector for seeded vols
                if (!volResult.data.skill_vector) {
                    VolunteerService.backfillSkillVector().catch(() => {});
                }

                const oppResult = await VolunteerService.getYourOpportunities();
                if (oppResult.success) {
                    setOpportunities(oppResult.data);
                } else {
                    console.warn("Failed to load opportunities:", oppResult.error);
                }

                const orgResult = await VolunteerService.getVolunteerOrganizations();
                if (orgResult.success) {
                    setPartnerOrgs(orgResult.data);
                } else {
                    console.warn("Failed to load organizations:", orgResult.error);
                }

                const hoursResult = await VolunteerService.getMonthlyHours();
                if (hoursResult.success) {
                    setMonthlyHoursMap(hoursResult.data);
                } else {
                    console.warn("Failed to load monthly hours:", hoursResult.error);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load data.");
            } finally {
                setFetching(false);
            }
        }
        loadData();
    }, [session, router]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    //KPI cards
    const totalHours = useMemo(
        () => opportunities.reduce((sum, opp) => sum + opp.hours, 0),
        [opportunities],
    );

    const hourlyRate = currentVolunteer?.hourlyValue ?? 0;
    const economicValue = useMemo(
        () => Math.round(totalHours * hourlyRate),
        [totalHours, hourlyRate],
    );
    const orgsAssisted = partnerOrgs.length;
    const impactScore = useMemo(
        () => Math.round(economicValue * orgsAssisted),
        [economicValue, orgsAssisted],
    );

    const { chartLabels, chartData } = useMemo(() => {
        const now = new Date();

        /**
         * Builds a sequential range of N months ending at the current month
         * @param monthCount - how many months to include
         */
        function buildMonthRange(monthCount: number): { labels: string[]; data: number[] } {
            const labels: string[] = [];
            const data: number[] = [];
            for (let i = monthCount - 1; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                labels.push(d.toLocaleString("default", { month: "short" }).toUpperCase());
                data.push(monthlyHoursMap[key] ?? 0);
            }
            return { labels, data };
        }

        if (chartRange === "last_month") {
            const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const key = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
            return {
                chartLabels: [prev.toLocaleString("default", { month: "short" }).toUpperCase()],
                chartData: [monthlyHoursMap[key] ?? 0],
            };
        }

        if (chartRange === "last_6_months") {
            const { labels, data } = buildMonthRange(6);
            return { chartLabels: labels, chartData: data };
        }

        if (chartRange === "last_year") {
            const lastYear = now.getFullYear() - 1;
            const labels: string[] = [];
            const data: number[] = [];
            for (let m = 0; m < 12; m++) {
                const d = new Date(lastYear, m, 1);
                const key = `${lastYear}-${String(m + 1).padStart(2, "0")}`;
                labels.push(d.toLocaleString("default", { month: "short" }).toUpperCase());
                data.push(monthlyHoursMap[key] ?? 0);
            }
            return { chartLabels: labels, chartData: data };
        }

        if (chartRange === "this_year") {
            const labels: string[] = [];
            const data: number[] = [];
            for (let m = 0; m < 12; m++) {
                const d = new Date(now.getFullYear(), m, 1);
                const key = `${now.getFullYear()}-${String(m + 1).padStart(2, "0")}`;
                labels.push(d.toLocaleString("default", { month: "short" }).toUpperCase());
                data.push(monthlyHoursMap[key] ?? 0);
            }
            return { chartLabels: labels, chartData: data };
        }

        const allKeys = Object.keys(monthlyHoursMap).sort();
        if (allKeys.length === 0) {
            const { labels, data } = buildMonthRange(6);
            return { chartLabels: labels, chartData: data };
        }
        return {
            chartLabels: allKeys.map((k) => {
                const [year, month] = k.split("-");
                const d = new Date(Number(year), Number(month) - 1, 1);
                return `${d.toLocaleString("default", { month: "short" }).toUpperCase()} ${year}`;
            }),
            chartData: allKeys.map((k) => monthlyHoursMap[k] ?? 0),
        };
    }, [monthlyHoursMap, chartRange]);

    return {
        loading,
        session,
        router,
        user,
        error,
        currentVolunteer,
        opportunities,
        partnerOrgs,
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
        hourlyRate,
        fetching,
    };
}
