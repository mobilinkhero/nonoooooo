import { Router } from "express";
import { requireAuth, requirePermission } from "../middlewares/auth.middleware";
import {
    getAdminAnalytics,
    impersonateUser,
    stopImpersonation,
    globalSearch,
    getSystemHealth,
    toggleMaintenanceMode,
    getCoupons,
    createCoupon,
    deleteCoupon
} from "../controllers/admin.management.controller";

const router = Router();

// All routes here require superadmin permission
router.use(requireAuth);
router.use(requirePermission("superadmin" as any)); // Assuming superadmin role check

router.get("/analytics", getAdminAnalytics);
router.post("/impersonate/:userId", impersonateUser);
router.post("/stop-impersonation", stopImpersonation);
router.get("/search", globalSearch);
router.get("/health", getSystemHealth);
router.post("/maintenance", toggleMaintenanceMode);

router.get("/coupons", getCoupons);
router.post("/coupons", createCoupon);
router.delete("/coupons/:id", deleteCoupon);

export default router;
