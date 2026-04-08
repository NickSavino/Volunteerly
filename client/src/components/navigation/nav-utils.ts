export function getAvatarFallback(name: string | undefined, fallback = "USR") {
    if (!name?.trim()) return fallback;

    const parts = name.trim().split(/\s+/).slice(0, 2);
    const initials = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");

    return initials || fallback;
}
