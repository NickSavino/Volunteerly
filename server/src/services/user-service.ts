import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";


export async function getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    return user;
}

export async function createCurrentUser(userId: string, userRole: string, email: string) {
    const user = await prisma.user.create({
            data: {
            id: userId,
            email: email,
            role: userRole ? (userRole as UserRole) : UserRole.VOLUNTEER,
            },
        });
    if (!user) {
        throw new Error("Error creating the User.");
    }

    return user;
}

export async function updateCurrentUser(userId: string, userRole: string, email: string) {
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
        email: email,
        role: userRole ? (userRole as UserRole) : UserRole.VOLUNTEER,
        },
    });
    if (!user) {
        throw new Error("Error updating the User.");
    }

    return user;
}
