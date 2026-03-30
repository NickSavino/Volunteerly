import { UserRole } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

export function requireRole(...allowedRoles: UserRole[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.auth?.userId;

            if (!userId) {
                return res.status(401).json({
                    error: "Unauthorized",
                    message: "User context missing.",
                });
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true },
            });

            if (!user) {
                return res.status(404).json({
                    error: "Not Found",
                    message: "User not found."
                })
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    error: "Forbidden",
                    message: "Insufficient Permissions",
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    }
}