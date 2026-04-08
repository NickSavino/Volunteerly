"use client";

import {
    CurrentModerator,
    CurrentModeratorSchema,
    CurrentOrganization,
    CurrentOrganizationSchema,
    CurrentUser,
    CurrentUserSchema,
    CurrentVolunteer,
    CurrentVolunteerSchema,
} from "@volunteerly/shared";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { api } from "@/lib/api";
import { useAuth } from "./auth-provider";

type AppSessionContextValue = {
    loading: boolean;
    initialized: boolean;
    isAuthenticated: boolean;
    currentUser: CurrentUser | null;
    currentVolunteer: CurrentVolunteer | null;
    currentOrganization: CurrentOrganization | null;
    currentModerator: CurrentModerator | null;
    refresh: () => Promise<void>;
    clear: () => void;
};

const AppSessionContext = createContext<AppSessionContextValue | undefined>(undefined);

export function AppSessionProvider({ children }: { children: ReactNode }) {
    const { session, loading: authLoading } = useAuth();

    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [currentVolunteer, setCurrentVolunteer] = useState<CurrentVolunteer | null>(null);
    const [currentOrganization, setCurrentOrganization] = useState<CurrentOrganization | null>(
        null,
    );
    const [currentModerator, setCurrentModerator] = useState<CurrentModerator | null>(null);

    const requestIdRef = useRef(0);

    const clear = useCallback(() => {
        setCurrentUser(null);
        setCurrentVolunteer(null);
        setCurrentOrganization(null);
        setCurrentModerator(null);
    }, []);

    const refresh = useCallback(async () => {
        const requestId = ++requestIdRef.current;

        if (authLoading) return;

        if (!session || !session?.access_token) {
            clear();
            setLoading(false);
            setInitialized(true);
            return;
        }

        setLoading(true);
        setInitialized(false);

        try {
            const rawUser = await api<unknown>("/current-user");
            const parsedUser = CurrentUserSchema.safeParse(rawUser);

            if (!parsedUser.success) {
                console.error(parsedUser.error);
                throw new Error("Invalid /current-user response");
            }

            if (requestId !== requestIdRef.current) return;

            const user = parsedUser.data;
            setCurrentUser(user);

            setCurrentVolunteer(null);
            setCurrentOrganization(null);
            setCurrentModerator(null);

            switch (user.role) {
                case "VOLUNTEER": {
                    const rawVolunteer = await api<unknown>("/current-volunteer");
                    const parsedVolunteer = CurrentVolunteerSchema.safeParse(rawVolunteer);

                    if (!parsedVolunteer.success) {
                        console.error(parsedVolunteer.error);
                        throw new Error("Invalid /current-volunteer response");
                    }

                    if (requestId !== requestIdRef.current) return;
                    setCurrentVolunteer(parsedVolunteer.data);
                    break;
                }

                case "ORGANIZATION": {
                    const rawOrganization = await api<unknown>("/current-organization");
                    const parsedOrganization = CurrentOrganizationSchema.safeParse(rawOrganization);

                    if (!parsedOrganization.success) {
                        console.error(parsedOrganization.error);
                        throw new Error("Invalid /current-organization response");
                    }

                    if (requestId !== requestIdRef.current) return;
                    setCurrentOrganization(parsedOrganization.data);
                    break;
                }

                case "MODERATOR": {
                    const rawModerator = await api<unknown>("/current-moderator");
                    const parsedModerator = CurrentModeratorSchema.safeParse(rawModerator);

                    if (!parsedModerator.success) {
                        console.error(parsedModerator.error);
                        throw new Error("Invalid /current-moderator response");
                    }

                    if (requestId !== requestIdRef.current) return;
                    setCurrentModerator(parsedModerator.data);
                    break;
                }
            }
        } catch (error) {
            console.error("Failed to initialize app session", error);
            if (requestId !== requestIdRef.current) return;
            clear();
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
                setInitialized(true);
            }
        }
    }, [authLoading, session?.access_token, clear]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const value = useMemo<AppSessionContextValue>(
        () => ({
            loading: authLoading || loading,
            initialized,
            isAuthenticated: !!session?.access_token,
            currentUser,
            currentVolunteer,
            currentOrganization,
            currentModerator,
            refresh,
            clear,
        }),
        [
            authLoading,
            loading,
            initialized,
            session,
            currentUser,
            currentVolunteer,
            currentOrganization,
            currentModerator,
            refresh,
            clear,
        ],
    );

    return <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>;
}

export function useAppSession() {
    const context = useContext(AppSessionContext);

    if (!context) {
        throw new Error("useAppSession must be used within AppSessionProvider");
    }

    return context;
}
