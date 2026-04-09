import { UserRole } from "@volunteerly/shared";

export function getDisplayName(user?: {
    email: string;
    role: UserRole;
    volunteer: { firstName: string; lastName: string } | null;
    organization: { orgName: string } | null;
    moderator: { firstName: string; lastName: string } | null;
}) {
    if (!user) {
        return "Unkown User";
    }

    switch (user.role) {
        case "VOLUNTEER":
            return (
                `${user.volunteer?.firstName ?? ""} ${user.volunteer?.lastName ?? ""}`.trim() ||
                user.email
            );

        case "ORGANIZATION":
            return user.organization?.orgName?.trim() || user.email;

        case "MODERATOR":
            return (
                `${user.moderator?.firstName ?? ""} ${user.moderator?.lastName ?? ""}`.trim() ||
                user.email
            );

        default:
            return user.email;
    }
}
