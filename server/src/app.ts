/**
 * app.ts
 * Creates and configures the Express application.
 */

import cors from "cors";
import express from "express";
import { env } from "./lib/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import { apiRouter } from "./routes/index.js";

/**
 *  Creates and configures the Express application.
 *  - Sets up CORS policy to allow client access.
 *  - Parses incoming JSON requests.
 *  - Logs incoming requests (method and URL).
 *  - Mounts the main API router for handling application routes.
 *  - Adds middleware for handling 404 Not Found and general errors.
 * @returns app - The configured Express application instance ready to be started.
 */
export function createApp() {
    const app = express();

    // Setup Cors policy to allow client access
    app.use(cors({ origin: env.CORS_ORIGIN }));

    // Parse incoming json
    app.use(express.json());

    // Setup logging
    // TODO: Refine
    app.use((req, _res, next) => {
        console.log(`${req.method} ${req.originalUrl}`);
        next();
    });

    // Mount Router
    app.use("/", apiRouter);

    // Setup Middleware
    app.use(notFound);
    app.use(errorHandler);

    return app;
}
