import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
    ShieldAlert,
    Ticket,
    Trash2,
    Plus,
    Settings,
    Lock,
    Calendar,
    Percent
} from "lucide-react";
import { Loading } from "@/components/ui/loading";

export default function AdminSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [couponCode, setCouponCode] = useState("");
    const [discountPercent, setDiscountPercent] = useState(10);
    const [expiryDays, setExpiryDays] = useState(30);

    const { data: coupons, isLoading: couponsLoading } = useQuery({
        queryKey: ["/api/admin/management/coupons"],
        queryFn: async () => {
            const resp = await fetch("/api/admin/management/coupons");
            return resp.json();
        }
    });

    const { data: health, isLoading: healthLoading } = useQuery({
        queryKey: ["/api/admin/management/health"],
        queryFn: async () => {
            const resp = await fetch("/api/admin/management/health");
            return resp.json();
        }
    });

    const maintenanceMutation = useMutation({
        mutationFn: async (enabled: boolean) => {
            const resp = await fetch("/api/admin/management/maintenance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled })
            });
            return resp.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/management/health"] });
            toast({ title: data.success ? "Success" : "Error", description: data.message });
        }
    });

    const createCouponMutation = useMutation({
        mutationFn: async () => {
            const resp = await fetch("/api/admin/management/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: couponCode,
                    discountPercent,
                    expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
                })
            });
            return resp.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/management/coupons"] });
            setCouponCode("");
            toast({ title: data.success ? "Coupon Created" : "Error", description: data.message });
        }
    });

    const deleteCouponMutation = useMutation({
        mutationFn: async (id: string) => {
            const resp = await fetch(`/api/admin/management/coupons/${id}`, { method: "DELETE" });
            return resp.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/management/coupons"] });
            toast({ title: "Deleted", description: "Coupon removed" });
        }
    });

    if (couponsLoading || healthLoading) return <Loading text="Loading settings..." />;

    const isMaintenance = health?.data?.maintenanceMode ?? false;

    return (
        <div className="flex-1 dots-bg min-h-screen">
            <Header title="Operational Settings" subtitle="Control system maintenance and discount engines" />

            <main className="p-6 max-w-5xl mx-auto space-y-8">
                {/* Global Maintenance Mode */}
                <Card className={isMaintenance ? "border-red-500 bg-red-50/20" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className={isMaintenance ? "text-red-600" : "text-gray-400"} />
                                Global Maintenance Mode
                            </CardTitle>
                            <CardDescription>
                                When enabled, non-admin users will see a maintenance screen and cannot access the platform.
                            </CardDescription>
                        </div>
                        <Switch
                            checked={isMaintenance}
                            onCheckedChange={(val) => maintenanceMutation.mutate(val)}
                            disabled={maintenanceMutation.isPending}
                        />
                    </CardHeader>
                    <CardContent>
                        {isMaintenance ? (
                            <div className="flex items-center gap-2 text-red-600 font-bold animate-pulse text-sm mt-4">
                                <ShieldAlert className="w-4 h-4" /> PLATFORM IS CURRENTLY IN MAINTENANCE MODE
                            </div>
                        ) : (
                            <div className="text-green-600 text-sm mt-4 font-medium flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-600" /> Platform is live and accessible.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Coupon Engine */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Plus className="w-5 h-5 text-green-600" />
                                Create Coupon
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Coupon Code</label>
                                <Input
                                    placeholder="SAVE30"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Percent className="w-3 h-3" /> Discount Percent
                                </label>
                                <Input
                                    type="number"
                                    value={discountPercent}
                                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Calendar className="w-3 h-3" /> Expiry (Days)
                                </label>
                                <Input
                                    type="number"
                                    value={expiryDays}
                                    onChange={(e) => setExpiryDays(Number(e.target.value))}
                                />
                            </div>
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => createCouponMutation.mutate()}
                                disabled={!couponCode || createCouponMutation.isPending}
                            >
                                Generate Coupon
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Ticket className="w-5 h-5 text-indigo-600" />
                                Active Coupons
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-gray-500">
                                            <th className="text-left py-2">Code</th>
                                            <th className="text-left py-2">Discount</th>
                                            <th className="text-left py-2">Expires</th>
                                            <th className="text-right py-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coupons?.data?.map((c: any) => (
                                            <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="py-3 font-bold text-indigo-600">{c.code}</td>
                                                <td className="py-3 font-medium">{c.discountPercent}%</td>
                                                <td className="py-3 text-gray-500">
                                                    {new Date(c.expiresAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => deleteCouponMutation.mutate(c.id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!coupons?.data || coupons.data.length === 0) && (
                                            <tr>
                                                <td colSpan={4} className="text-center py-8 text-gray-500">
                                                    No coupons found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Advanced Settings Placeholder */}
                <Card className="opacity-60 grayscale cursor-not-allowed">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Infrastructure Controls
                        </CardTitle>
                        <CardDescription>Reserved for future scale-out management</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 border rounded text-xs">Node Scale</div>
                            <div className="p-3 border rounded text-xs">Queue Priority</div>
                            <div className="p-3 border rounded text-xs">Cache Flush</div>
                            <div className="p-3 border rounded text-xs">DB Optimize</div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
