import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    TrendingUp,
    Users,
    CreditCard,
    AlertTriangle,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    ShieldAlert
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Loading } from "@/components/ui/loading";

export default function AdminGrowthIntelligence() {
    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ["/api/admin/management/analytics"],
        queryFn: async () => {
            const resp = await fetch("/api/admin/management/analytics");
            if (!resp.ok) throw new Error("Failed to fetch admin analytics");
            return await resp.json();
        }
    });

    const { data: health, isLoading: healthLoading } = useQuery({
        queryKey: ["/api/admin/management/health"],
        queryFn: async () => {
            const resp = await fetch("/api/admin/management/health");
            if (!resp.ok) throw new Error("Failed to fetch system health");
            return await resp.json();
        }
    });

    if (analyticsLoading || healthLoading) return <Loading text="Crunching growth data..." />;

    const growthData = analytics?.data;
    const healthData = health?.data;

    return (
        <div className="space-y-6">
            {/* Financial Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-700">Monthly Recurring Revenue (MRR)</span>
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-3xl font-bold text-green-900">${growthData?.mrr?.toLocaleString()}</div>
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> Combined Monthly + Pro-rated Annual
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-700">Active Paid Subs</span>
                            <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-3xl font-bold text-blue-900">{growthData?.funnel?.paidSubscribers}</div>
                        <p className="text-xs text-blue-600 mt-1">Paying customers only</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-orange-700">Recent Churn (30d)</span>
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="text-3xl font-bold text-orange-900">{growthData?.churnRate}</div>
                        <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                            <ArrowDownRight className="w-3 h-3" /> Cancelled or expired accounts
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conversion Funnel */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5 text-green-600" />
                            Conversion Funnel
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Total Signups</span>
                                    <span className="font-bold">{growthData?.funnel?.totalSignups}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                                    <div className="bg-green-500 h-full w-full" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Active Trials</span>
                                    <span className="font-bold">{growthData?.funnel?.activeTrials}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                                    <div
                                        className="bg-green-400 h-full transition-all duration-500"
                                        style={{ width: `${(growthData?.funnel?.activeTrials / growthData?.funnel?.totalSignups) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Paid Subscribers</span>
                                    <span className="font-bold">{growthData?.funnel?.paidSubscribers}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                                    <div
                                        className="bg-green-600 h-full transition-all duration-500"
                                        style={{ width: `${(growthData?.funnel?.paidSubscribers / growthData?.funnel?.totalSignups) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Health / At Risk */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-red-600" />
                            At-Risk Subscriptions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {healthData?.atRiskUsers?.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    No subscriptions at immediate risk.
                                </div>
                            ) : (
                                healthData?.atRiskUsers?.slice(0, 5).map((u: any) => (
                                    <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50/30">
                                        <div className="min-w-0">
                                            <div className="font-medium text-sm truncate">{u.username}</div>
                                            <div className="text-xs text-gray-500">{u.email}</div>
                                        </div>
                                        <div className="text-xs font-bold text-red-600">
                                            Trial ends {new Date(u.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Admin Audit Logs */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        Recent Administrative Actions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-gray-500">
                                    <th className="text-left py-2 font-medium">Admin</th>
                                    <th className="text-left py-2 font-medium">Action</th>
                                    <th className="text-left py-2 font-medium">Target</th>
                                    <th className="text-left py-2 font-medium">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {healthData?.auditLogs?.map((log: any) => (
                                    <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-2 font-medium">{log.adminUsername}</td>
                                        <td className="py-2">
                                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-2 text-gray-500">{log.targetId || 'N/A'}</td>
                                        <td className="py-2 text-xs text-gray-400">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {healthData?.auditLogs?.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 text-gray-500">No recent logs found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
