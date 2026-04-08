import express from "express";
import cors from "cors";
import { env } from "./lib/env.js";
import { notFound } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";
import { apiRouter } from "./routes/index.js";

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
