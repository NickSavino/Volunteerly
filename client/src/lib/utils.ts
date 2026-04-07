import { CurrentOrganization, CurrentUser } from "@volunteerly/shared"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ResolveDefaultAppRouteArgs = {
  currentUser: CurrentUser;
  currentOrganization: CurrentOrganization | null;
}

/**
 * 
 * @param currentUser
 * @param currentOrganization
 * @returns  null
 */
export function resolveDefaultAppRoute({
  currentUser,
  currentOrganization
}: ResolveDefaultAppRouteArgs) {
  switch (currentUser.role) {
    case "VOLUNTEER":
      return currentUser.status === "UNVERIFIED"
        ? "/volunteer/experience-input"
        : "/volunteer";

    case "ORGANIZATION":
      switch (currentOrganization?.status) {
        case "CREATED":
          return "/organization/application";
        default:
          return "/organization";
      }
      
    case "MODERATOR":
      return "/moderator";

    case "ADMIN":
      return "/admin"
  }
}