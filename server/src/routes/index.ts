import { Router } from "express";
import { healthRouter } from "./health.js";
import { currentUserRouter } from "./current-user.js";
import { currentVolunteerRouter } from "./current-volunteer.js";
import { currentOrganizationRouter } from "./current-organization.js";
import { OrganizationRouter } from "./organization.js";
import { currentModeratorRouter } from "./current-moderator.js";

/**
 * Base Router for all routes. Injected into app.ts
 * Define routes inside separate file and mount here.
 * Ideal setup: One route per db entity (user.ts, organization.ts, etc.)
 */

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/current-user", currentUserRouter);
apiRouter.use("/current-volunteer", currentVolunteerRouter);
apiRouter.use("/current-organization", currentOrganizationRouter);
apiRouter.use("/organization", OrganizationRouter);
apiRouter.use("/current-moderator", currentModeratorRouter);