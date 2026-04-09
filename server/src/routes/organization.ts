import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
    approveOrganization,
    rejectOrganization,
    getCurrentOrganization,
    getAllOrganizations,
    getAppliedOrganizations,
    downloadFile,
} from "../services/organization-service.js";
import { getCurrentUser } from "../services/user-service.js";

type AuthenticatedRequest = {
    auth?: {
        userId: string;
        email?: string;
    };
};

export const OrganizationRouter = Router();

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

        const organizations =
            status === "APPLIED" ? await getAppliedOrganizations() : await getAllOrganizations();

        res.status(200).json(organizations);
    } catch (error) {
        next(error);
    }
});

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

        const fileId = file_path.split("org_")[1].split(".")[0];

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

        const rejected_org = await rejectOrganization(orgId, rejectionReason ?? "");
        res.status(200).json(rejected_org);
    } catch (error) {
        console.error(error);
        next(error);
    }
});
