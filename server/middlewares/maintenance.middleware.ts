import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export async function maintenanceMiddleware(req: Request, res: Response, next: NextFunction) {
    // Always allow superadmins to bypass maintenance
    if (req.user?.role === 'superadmin') {
        return next();
    }

    // Allow login/logout/me routes to prevent locking everyone out (though /me might show maintenance status)
    const bypassPaths = ['/api/auth/me', '/api/auth/login', '/api/auth/logout'];
    if (bypassPaths.includes(req.path)) {
        return next();
    }

    try {
        const settings = await storage.getSystemSetting('maintenance_mode');
        if (settings && settings.isMaintenanceMode) {
            return res.status(503).json({
                success: false,
                message: settings.maintenanceMessage || "System is under maintenance. Please try again later.",
                maintenance: true
            });
        }
    } catch (err) {
        console.error("Maintenance check failed:", err);
    }

    next();
}
