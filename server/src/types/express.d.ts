/**
 * express.d.ts
 * Extends Express request types with authenticated user context.
 */

export {};

declare global {
    namespace Express {
        interface Request {
            auth?: {
                userId: string;
                email?: string;
            };
        }
    }
}
