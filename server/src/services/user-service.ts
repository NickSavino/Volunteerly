import { prisma } from "../lib/prisma.js";


export async function getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error("Application User not found");
    }

    return user;
}