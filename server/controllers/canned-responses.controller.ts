import type { Request, Response } from "express";
import { AppError, asyncHandler } from "../middlewares/error.middleware";
import { storage } from "../storage";

export const getCannedResponses = asyncHandler(async (req: Request, res: Response) => {
    const channelId = (req as any).channelId;
    const responses = await storage.getCannedResponses(channelId);
    res.json(responses);
});

export const createCannedResponse = asyncHandler(async (req: Request, res: Response) => {
    const channelId = (req as any).channelId;
    const user = (req.session as any)?.user;
    const { shortcut, content } = req.body;

    if (!shortcut || !content) {
        throw new AppError(400, "Shortcut and content are required");
    }

    const response = await storage.createCannedResponse({
        channelId,
        userId: user.id,
        shortcut,
        content,
    });

    res.status(201).json(response);
});

export const updateCannedResponse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { shortcut, content } = req.body;

    const response = await storage.updateCannedResponse(id, { shortcut, content });
    res.json(response);
});

export const deleteCannedResponse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const success = await storage.deleteCannedResponse(id);

    if (!success) {
        throw new AppError(404, "Canned response not found");
    }

    res.status(204).send();
});
