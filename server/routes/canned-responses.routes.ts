import type { Express } from "express";
import * as cannedResponsesController from "../controllers/canned-responses.controller";
import { requireAuth, requirePermission } from "../middlewares/auth.middleware";
import { extractChannelId } from "../middlewares/channel.middleware";
import { PERMISSIONS } from "@shared/schema";

export function registerCannedResponseRoutes(app: Express) {
    app.get(
        "/api/canned-responses",
        requireAuth,
        requirePermission(PERMISSIONS.CANNED_RESPONSES_VIEW),
        extractChannelId,
        cannedResponsesController.getCannedResponses
    );

    app.post(
        "/api/canned-responses",
        requireAuth,
        requirePermission(PERMISSIONS.CANNED_RESPONSES_CREATE),
        extractChannelId,
        cannedResponsesController.createCannedResponse
    );

    app.put(
        "/api/canned-responses/:id",
        requireAuth,
        requirePermission(PERMISSIONS.CANNED_RESPONSES_EDIT),
        cannedResponsesController.updateCannedResponse
    );

    app.delete(
        "/api/canned-responses/:id",
        requireAuth,
        requirePermission(PERMISSIONS.CANNED_RESPONSES_DELETE),
        cannedResponsesController.deleteCannedResponse
    );
}
