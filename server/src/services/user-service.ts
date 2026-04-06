import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { supabase } from "../lib/supabase.js";


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

export async function saveAvatar(userId:string, file:Express.Multer.File){
    const fileName = `${userId}.jpeg`;

    const { data, error } = await supabase.storage
    .from("avatars")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

    if (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }
    return data.fullPath
}
