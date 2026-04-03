import { Router } from "express";
import { healthRouter } from "./health.js";
import { currentUserRouter } from "./current-user.js";
import { currentVolunteerRouter } from "./current-volunteer.js";
import { currentOrganizationRouter } from "./current-organization.js";
import { OrganizationRouter } from "./organization.js";
import { currentModeratorRouter } from "./current-moderator.js";
import { moderatorRouter } from "./moderator/index.js";
import { volunteerOrganizationRouter } from "./volunteer-organization.js";
import { requireRole } from "../middleware/require-role.js";
import { auth } from "../middleware/auth.js";

/**
 * Base Router for all routes. Injected into app.ts
 * Define routes inside separate file and mount here.
 * Ideal setup: One route per db entity (user.ts, organization.ts, etc.)
 */

export const apiRouter = Router();

apiRouter.use("/health", auth, healthRouter);
apiRouter.use("/current-user", auth, currentUserRouter);

apiRouter.use("/current-volunteer", auth, requireRole("VOLUNTEER"), currentVolunteerRouter);
apiRouter.use("/current-organization", auth, requireRole("ORGANIZATION"), currentOrganizationRouter);
apiRouter.use("/current-moderator", auth, requireRole("MODERATOR"), currentModeratorRouter);

apiRouter.use("/moderator", auth, requireRole("MODERATOR"), moderatorRouter);
apiRouter.use("/organization", auth, OrganizationRouter);
apiRouter.use("/volunteer-organization", auth, requireRole("VOLUNTEER"), volunteerOrganizationRouter);