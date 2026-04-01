import { Request, Response, NextFunction } from "express"
import { supabase } from "../lib/supabase.js";

export async function auth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "Missing or invalid bearer token."
        });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "Invalid or expired token."
        })
    }

    req.auth = {
        userId: data.user.id ?? "",
        email: data.user.email ?? ""
    };

    next();
}