import { Router } from "express";
import { getModeratorVolunteerList } from "../../services/moderator/moderator-volunteer-service.js";


export const moderatorVolunteersRouter = Router();

moderatorVolunteersRouter.get("/", async (_, res, next) => {
    try {
        
        const volunteers = await getModeratorVolunteerList();

        res.status(200).json(volunteers);
    } catch (error) {
        next(error);
    }
});