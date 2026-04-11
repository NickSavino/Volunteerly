/**
 * organization.ts
 * Routes for organization management, including approval, rejection, and document access
 */

import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
    approveOrganization,
    downloadFile,
    getAllOrganizations,
    getAppliedOrganizations,
    getCurrentOrganization,
    rejectOrganization,
} from "../services/organization-service.js";
import { getCurrentUser } from "../services/user-service.js";

type AuthenticatedRequest = {
    auth?: {
        userId: string;
        email?: string;
    };
};

export const OrganizationRouter = Router();

/**
 * Ensures the requesting user exists and holds the MODERATOR role.
 * Sends a 404 or 403 response automatically if the check fails.
 * Returns the user record on success, or null if the request was rejected.
 */
async function requireModerator(
    userId: string,
    res: Parameters<Parameters<typeof OrganizationRouter.put>[1]>[1],
) {
    const mod = await getCurrentUser(userId);
    if (!mod) {
        res.status(404).json({ error: "Not Found", message: "User not found." });
        return null;
    }
    if (mod.role !== "MODERATOR") {
        res.status(403).json({
            error: "Forbidden",
            message: "Only moderators can perform this action.",
        });
        return null;
    }
    return mod;
}

/**
 * GET /organizations
 * Returns a list of organizations. Accepts an optional `status` query param.
 * When status=APPLIED, returns only organizations pending review.
 * Auth: required (moderator only)
 * Query: status (optional)
 * Returns: 200 with array of organizations
 * Errors: 401, 403, 404, 500
 */
OrganizationRouter.get("/", auth, async (req, res, next) => {
    try {
        const typedReq = req as typeof req & AuthenticatedRequest;
        const userId = typedReq.auth?.userId;

        if (!userId) {
            return res
                .status(401)
                .json({ error: "Unauthorized", message: "User context missing." });
        }

        const mod = await requireModerator(userId, res);
        if (!mod) return;

        const { status } = req.query;

        // Filter by APPLIED status if requested, otherwise return all organizations
        const organizations =
            status === "APPLIED" ? await getAppliedOrganizations() : await getAllOrganizations();

        res.status(200).json(organizations);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /organizations/document
 * Downloads an organization's document (PDF) from storage.
 * Regular users can only access their own documents; moderators can access any.
 * Auth: required (own document, or moderator for others)
 * Query: file_path - storage path in the format "organization-documents/org_<userId>.pdf"
 * Returns: 200 with PDF file attachment
 * Errors: 400 (missing path), 401, 403, 404, 500
 */
OrganizationRouter.get("/document", auth, async (req: any, res, next) => {
    try {
        const typedReq = req as typeof req & AuthenticatedRequest;
        const userId = typedReq.auth?.userId;

        if (!userId) {
            return res
                .status(401)
                .json({ error: "Unauthorized", message: "User context missing." });
        }

        const { file_path } = req.query;

        if (!file_path) {
            return res.status(400).json({ error: "File Path is missing/invalid." });
        }
        // Extract the owner's userId embedded in the filename (org_<userId>.<ext>)
        const fileId = file_path.split("org_")[1].split(".")[0];

        // Allow access if the file belongs to the requester, otherwise require moderator
        if (!(fileId == userId)) {
            const mod = await requireModerator(userId, res);
            if (!mod) return;
        }
        const bucket = file_path.split("/")[0];
        const filePath = file_path.split("/")[1];
        const file_data = await downloadFile(bucket, filePath);

        res.setHeader("Content-Disposition", `attachment; filename="${file_path}"`);
        res.setHeader("Content-Type", "application/pdf");
        res.send(file_data);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /organizations/approve
 * Approves a pending organization application.
 * Auth: required (moderator only)
 * Body: orgId
 * Returns: 200 with updated organization data
 * Errors: 400 (invalid state), 401, 403, 404, 500
 */
OrganizationRouter.put("/approve", auth, async (req, res, next) => {
    try {
        const typedReq = req as typeof req & AuthenticatedRequest;
        const userId = typedReq.auth?.userId;

        if (!userId) {
            return res
                .status(401)
                .json({ error: "Unauthorized", message: "User context missing." });
        }

        const mod = await requireModerator(userId, res);
        if (!mod) return;

        const { orgId } = req.body;

        const org = await getCurrentOrganization(orgId);
        if (!org) {
            return res.status(404).json({ error: "Not Found", message: "Organization not found." });
        }
        if (org.status !== "APPLIED") {
            return res
                .status(400)
                .json({ error: "Invalid state", message: "Organization has not applied." });
        }

        const approved_org = await approveOrganization(orgId);
        res.status(200).json(approved_org);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

/**
 * PUT /organizations/reject
 * Rejects a pending organization application with an optional reason.
 * Auth: required (moderator only)
 * Body: orgId, rejectionReason (optional)
 * Returns: 200 with updated organization data
 * Errors: 400 (invalid state), 401, 403, 404, 500
 */
OrganizationRouter.put("/reject", auth, async (req, res, next) => {
    try {
        const typedReq = req as typeof req & AuthenticatedRequest;
        const userId = typedReq.auth?.userId;

        if (!userId) {
            return res
                .status(401)
                .json({ error: "Unauthorized", message: "User context missing." });
        }

        const mod = await requireModerator(userId, res);
        if (!mod) return;

        const { orgId, rejectionReason } = req.body;

        const org = await getCurrentOrganization(orgId);
        if (!org) {
            return res.status(404).json({ error: "Not Found", message: "Organization not found." });
        }
        if (org.status !== "APPLIED") {
            return res
                .status(400)
                .json({ error: "Invalid state", message: "Organization has not applied." });
        }

        // Fall back to an empty string if no rejection reason is provided
        const rejected_org = await rejectOrganization(orgId, rejectionReason ?? "");
        res.status(200).json(rejected_org);
    } catch (error) {
        console.error(error);
        next(error);
    }
});
