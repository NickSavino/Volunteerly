/**
 * server.ts
 * Starts the HTTP server.
 */

import { createApp } from "./app.js";
import { env } from "./lib/env.js";

const app = createApp();

app.listen(env.PORT, () => {
    console.log(`Server is listening on http://localhost:${env.PORT}`);
});
