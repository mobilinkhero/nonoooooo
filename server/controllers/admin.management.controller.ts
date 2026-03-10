import { Request, Response } from "express";
import { eq, and, desc, sql, lt, gte } from "drizzle-orm";
import { db } from "../db";
import {
    users,
    subscriptions,
    plans,
    transactions,
    adminAuditLogs,
    coupons,
    systemSettings,
    channels,
    messages
} from "@shared/schema";
import { asyncHandler } from "../middlewares/error.middleware";
import { cacheGet, cacheInvalidate, CACHE_KEYS } from "../services/cache";

/**
 * Revenue & Growth Intelligence
 */
export const getAdminAnalytics = asyncHandler(async (req: Request, res: Response) => {
    // 1. MRR Calculation
    const activeSubs = await db
        .select({
            billingCycle: subscriptions.billingCycle,
            planData: subscriptions.planData,
        })
        .from(subscriptions)
        .where(eq(subscriptions.status, "active"));

    let mrr = 0;
    activeSubs.forEach((sub: any) => {
        const monthlyPrice = Number(sub.planData.monthlyPrice) || 0;
        const annualPrice = Number(sub.planData.annualPrice) || 0;

        if (sub.billingCycle === "monthly") {
            mrr += monthlyPrice;
        } else {
            mrr += annualPrice / 12;
        }
    });

    // 2. Conversion Funnel
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const trialUsers = await db.select({ count: sql<number>`count(*)` }).from(subscriptions).where(eq(subscriptions.status, "active")).innerJoin(plans, eq(subscriptions.planId, plans.id)).where(eq(plans.isTrial, true));
    const paidUsers = await db.select({ count: sql<number>`count(*)` }).from(subscriptions).where(eq(subscriptions.status, "active")).innerJoin(plans, eq(subscriptions.planId, plans.id)).where(eq(plans.isTrial, false));

    // 3. Churn Analysis: Users who expired or cancelled in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const churnedCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(subscriptions)
        .where(
            and(
                sql`${subscriptions.status} IN ('cancelled', 'expired')`,
                gte(subscriptions.updatedAt, thirtyDaysAgo)
            )
        );

    res.json({
        success: true,
        data: {
            mrr: Math.round(mrr * 100) / 100,
            funnel: {
                totalSignups: Number(totalUsers[0]?.count || 0),
                activeTrials: Number(trialUsers[0]?.count || 0),
                paidSubscribers: Number(paidUsers[0]?.count || 0),
            },
            churnRate: Number(churnedCount[0]?.count || 0)
        }
    });
});

/**
 * User Impersonation
 */
export const impersonateUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const admin = (req.session as any).user;

    if (admin.role !== 'superadmin') {
        return res.status(403).json({ success: false, message: "Only superadmins can impersonate." });
    }

    const targetUser = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });

    if (!targetUser) {
        return res.status(404).json({ success: false, message: "User not found." });
    }

    // Store original admin info
    (req.session as any).originalAdmin = {
        id: admin.id,
        username: admin.username,
        role: admin.role
    };

    // Switch session to target user
    (req.session as any).user = targetUser;

    // Log the action
    await db.insert(adminAuditLogs).values({
        adminId: admin.id,
        adminUsername: admin.username,
        action: 'IMPERSONATE_START',
        targetId: userId,
        details: { targetUsername: targetUser.username }
    });

    res.json({ success: true, message: `Now logged in as ${targetUser.username}` });
});

export const stopImpersonation = asyncHandler(async (req: Request, res: Response) => {
    const originalAdmin = (req.session as any).originalAdmin;

    if (!originalAdmin) {
        return res.status(400).json({ success: false, message: "Not currently impersonating." });
    }

    const adminUser = await db.query.users.findFirst({
        where: eq(users.id, originalAdmin.id)
    });

    if (adminUser) {
        (req.session as any).user = adminUser;
        delete (req.session as any).originalAdmin;

        res.json({ success: true, message: "Returned to admin account." });
    } else {
        res.status(500).json({ success: false, message: "Could not restore admin session." });
    }
});

/**
 * Advanced Global Search
 */
export const globalSearch = asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string') return res.json({ success: true, data: [] });

    const query = `%${q}%`;

    // Search Users
    const userResults = await db.select({
        id: users.id,
        type: sql`'user'`,
        title: users.username,
        subtitle: users.email,
    })
        .from(users)
        .where(sql`${users.username} ILIKE ${query} OR ${users.email} ILIKE ${query}`)
        .limit(5);

    // Search WhatsApp Numbers (Channels)
    const channelResults = await db.select({
        id: channels.id,
        type: sql`'channel'`,
        title: channels.phoneNumber,
        subtitle: channels.name,
    })
        .from(channels)
        .where(sql`${channels.phoneNumber} ILIKE ${query} OR ${channels.name} ILIKE ${query}`)
        .limit(5);

    // Search Transactions
    const transactionResults = await db.select({
        id: transactions.id,
        type: sql`'transaction'`,
        title: transactions.providerTransactionId,
        subtitle: sql`CONCAT(${transactions.amount}, ' ', ${transactions.currency})`,
    })
        .from(transactions)
        .where(sql`${transactions.providerTransactionId} ILIKE ${query} OR ${transactions.providerOrderId} ILIKE ${query}`)
        .limit(5);

    res.json({
        success: true,
        data: [...userResults, ...channelResults, ...transactionResults]
    });
});

/**
 * System Health & Monitoring
 */
export const getSystemHealth = asyncHandler(async (req: Request, res: Response) => {
    // 1. Message Delivery Rate (Global)
    const stats = await db.select({
        status: messages.status,
        count: sql<number>`count(*)`
    })
        .from(messages)
        .groupBy(messages.status);

    // 2. Audit Logs
    const logs = await db.select().from(adminAuditLogs).orderBy(desc(adminAuditLogs.createdAt)).limit(20);

    // 3. Subscription at risk (Trial ends in 24h)
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setHours(now.getHours() + 24);

    const atRisk = await db.select({
        id: subscriptions.id,
        email: users.email,
        username: users.username,
        endDate: subscriptions.endDate
    })
        .from(subscriptions)
        .innerJoin(users, eq(subscriptions.userId, users.id))
        .where(
            and(
                eq(subscriptions.status, "active"),
                lt(subscriptions.endDate, tomorrow),
                gte(subscriptions.endDate, now)
            )
        );

    // 4. Current Maintenance Status
    const maintenanceSettings = await db.query.systemSettings.findFirst();

    res.json({
        success: true,
        data: {
            messageStats: stats,
            auditLogs: logs,
            atRiskUsers: atRisk,
            maintenanceMode: maintenanceSettings?.isMaintenanceMode || false,
            maintenanceMessage: maintenanceSettings?.maintenanceMessage || ""
        }
    });
});

/**
 * Global Maintenance Mode
 */
export const toggleMaintenanceMode = asyncHandler(async (req: Request, res: Response) => {
    const { enabled, message } = req.body;
    const admin = (req.session as any).user;

    let settings = await db.query.systemSettings.findFirst();

    if (settings) {
        await db.update(systemSettings).set({
            isMaintenanceMode: enabled,
            maintenanceMessage: message || settings.maintenanceMessage,
            updatedBy: admin.username,
            updatedAt: new Date()
        }).where(eq(systemSettings.id, settings.id));
    } else {
        await db.insert(systemSettings).values({
            isMaintenanceMode: enabled,
            maintenanceMessage: message,
            updatedBy: admin.username
        });
    }

    res.json({ success: true, message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}` });
});

/**
 * Coupons Management
 */
export const getCoupons = asyncHandler(async (req: Request, res: Response) => {
    const allCoupons = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
    res.json({ success: true, data: allCoupons });
});

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
    const [newCoupon] = await db.insert(coupons).values(req.body).returning();
    res.json({ success: true, data: newCoupon });
});

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
    await db.delete(coupons).where(eq(coupons.id, req.params.id));
    res.json({ success: true, message: "Coupon deleted" });
});
