import { Router } from "express";
import { healthRouter } from "./health.js";
import { meRouter } from "./me.js";

/**
 * Base Router for all routes. Injected into app.ts
 * Define routes inside separate file and mount here.
 * Ideal setup: One route per db entity (user.ts, organization.ts, etc.)
 */

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/me", meRouter);