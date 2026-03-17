import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { createCurrentVolunteer, getCurrentVolunteer, updateCurrentVolunteer, getYourOpportunities } from "../services/volunteer-service.js";

type AuthenticatedRequest = {
    auth?: {
        userId: string;
        email?: string;
    }
}

export const currentVolunteerRouter = Router();

currentVolunteerRouter.get("/", auth, async (req, res, next) => {
    try {
        const typedReq = req as typeof req & AuthenticatedRequest;

        const userId = typedReq.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "User context missing."
            });
        }

        const user = await getCurrentVolunteer(userId);
        
        if (!user) {
            return res.status(404).json({
                error: "Not Found",
                message: "Volunteer not found."
            });
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
})

currentVolunteerRouter.put("/", auth, async (req, res, next) => {
  try {
    const typedReq = req as typeof req & AuthenticatedRequest;

    const userId = typedReq.auth?.userId;

    console.log("got req")
    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "User context missing."
        });
    }
    const { firstName, lastName, location, bio, availability, hourlyValue} = req.body;

    const user = await getCurrentVolunteer(userId);
    let modified_user;
    if (!user) {
        modified_user = await createCurrentVolunteer(userId, firstName, lastName);
    } else {
        modified_user = await updateCurrentVolunteer(userId, firstName, lastName, location, bio, availability, hourlyValue);    
    }
    if (!modified_user) {
        return res.status(500).json({
            error: "Cannot update/create Volunteer",
            message: "Internal server error."
        });
    }

    res.status(200).json(modified_user);
  } catch (error) {
    console.error(error);
    next(error);
    }
});


//retrieve volunteers opps
currentVolunteerRouter.get("/opportunities", auth, async (req, res, next) => {
    try {
        const userId = (req as typeof req & AuthenticatedRequest).auth?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const opportunities = await getYourOpportunities(userId);
        res.status(200).json(opportunities);
    } catch (error) {
        next(error);
    }
});