import { Router } from "express";
import { createCurrentVolunteer, getCurrentVolunteer, updateCurrentVolunteer } from "../services/volunteer-service.js";

export const currentVolunteerRouter = Router();

currentVolunteerRouter.get("/", async (req, res, next) => {
    try {

        const userId = req.auth!.userId;

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

currentVolunteerRouter.put("/", async (req, res, next) => {
  try {
    const userId = req.auth!.userId;

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