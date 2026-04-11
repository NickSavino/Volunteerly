/**
 * index.ts
 * Registers API route groups.
 */

import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/require-role.js";
import { chatRouter } from "./chat/index.js";
import { currentModeratorRouter } from "./current-moderator.js";
import { currentOrganizationRouter } from "./current-organization.js";
import { currentUserRouter } from "./current-user.js";
import { currentVolunteerRouter } from "./current-volunteer.js";
import { healthRouter } from "./health.js";
import { moderatorRouter } from "./moderator/index.js";
import { OrganizationRouter } from "./organization.js";
import { skillExtractionRouter } from "./skill-extraction.js";
import { ticketsRouter } from "./tickets.js";
import { volunteerOrganizationRouter } from "./volunteer-organization.js";

export const apiRouter = Router();

apiRouter.use("/health", auth, healthRouter);
apiRouter.use("/current-user", auth, currentUserRouter);

apiRouter.use(
    "/current-volunteer/extract-skills",
    auth,
    requireRole("VOLUNTEER"),
    skillExtractionRouter,
);

apiRouter.use("/current-volunteer", auth, requireRole("VOLUNTEER"), currentVolunteerRouter);
apiRouter.use(
    "/current-organization",
    auth,
    requireRole("ORGANIZATION"),
    currentOrganizationRouter,
);
apiRouter.use("/current-moderator", auth, requireRole("MODERATOR"), currentModeratorRouter);

apiRouter.use("/moderator", auth, requireRole("MODERATOR"), moderatorRouter);
apiRouter.use("/organization", auth, OrganizationRouter);
apiRouter.use(
    "/volunteer-organization",
    auth,
    requireRole("VOLUNTEER"),
    volunteerOrganizationRouter,
);

apiRouter.use("/chat", auth, requireRole("MODERATOR", "VOLUNTEER", "ORGANIZATION"), chatRouter);

apiRouter.use(
    "/tickets",
    auth,
    requireRole("VOLUNTEER", "MODERATOR", "ORGANIZATION"),
    ticketsRouter,
);
