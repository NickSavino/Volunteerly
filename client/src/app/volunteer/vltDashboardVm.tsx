import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/UserService";
import { useAuth } from "@/providers/auth-provider";
import { CurrentUser, CurrentUserSchema } from "@volunteerly/shared";
import { api } from "@/lib/api";

export function useVltDashboardViewModel() {
  const router = useRouter();
  const { session, user, loading, signOut } = useAuth();
  const [currentUser, setCurrentUser] = useState<CurrentUser | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login")
    }
  }, [loading, session, router]);

  useEffect(() => {
    async function loadCurrentUser() {
      if (!session?.access_token) return;

      try {
        const user = await UserService.getCurrentUser()

        if (!user.success) {
          console.error(user.error);
          setError("Received invalid user data from the server.");
          return;
        }

        if (user.data.role !== "VOLUNTEER") {
          router.replace("/bootstrap");
          return;
        }

        setCurrentUser(user.data);
      } catch (error) {
        console.error(error);
      }
    }
    loadCurrentUser();
    }, [session, router]);

    return {loading, session, signOut, router, user, error, currentUser} 
}