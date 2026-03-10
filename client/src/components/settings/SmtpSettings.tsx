import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Server,
  Edit,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Mail,
  Lock,
  Globe,
  Wifi,
  WifiOff,
  Clock,
  Image as ImageIcon,
  User,
  SendHorizonal,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import SMTPSettingsModal from "../modals/SMTPSettingsModal";
import { useAuth } from "@/contexts/auth-context";

interface SMTPConfig {
  id?: string;
  host?: string;
  port?: string;
  secure?: string;
  user?: string;
  password?: string;
  fromName?: string;
  fromEmail?: string;
  logo?: string;
  updatedAt?: string;
}

export default function SMTPSettings() {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    data: smtpConfig,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<SMTPConfig>({
    queryKey: ["smtp-config"],
    queryFn: async () => {
      const res = await fetch("/api/admin/getSmtpConfig");
      if (!res.ok) throw new Error("Failed to fetch SMTP config");
      return res.json().then((d) => d.data);
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const staticData: SMTPConfig = {
    host: "smtp.example.com",
    port: "587",
    secure: "false",
    user: "",
    password: "",
    fromName: "Default Sender",
    fromEmail: "noreply@example.com",
    logo: "",
    updatedAt: new Date().toISOString(),
  };

  const displayData = error ? staticData : smtpConfig || {};
  const isUsingStaticData = Boolean(error);

  const formatLastUpdated = (d?: string) => {
    if (!d) return "Unknown";
    const date = new Date(d);
    return date.toLocaleString();
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast({ title: "Enter an email address", variant: "destructive" });
      return;
    }
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/smtp/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail.trim() }),
      });
      const data = await res.json();
      setTestResult({ success: data.success, message: data.message });
      toast({
        title: data.success ? "✅ Test Email Sent!" : "❌ Test Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    } catch (err: any) {
      setTestResult({ success: false, message: "Network error — could not reach the server" });
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setIsSendingTest(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center py-10">
          <Loading />
          <p className="text-sm mt-3 text-gray-500">Loading SMTP configuration...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              SMTP Settings
            </CardTitle>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={isUsingStaticData ? "destructive" : "default"}
                className="text-xs"
              >
                {isUsingStaticData ? (
                  <>
                    <WifiOff className="w-3 h-3 mr-1" /> Offline
                  </>
                ) : (
                  <>
                    <Wifi className="w-3 h-3 mr-1" /> Online
                  </>
                )}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-xs"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-1 ${isFetching ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>

              <Button
                size="sm"
                onClick={() => setShowEditDialog(true)}
                className="text-xs"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit SMTP
              </Button>
            </div>
          </div>

          <CardDescription>Manage outgoing email server and credentials</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="border p-6 rounded-lg">
            <div className="flex justify-between mb-6">
              <h3 className="text-lg font-semibold">SMTP Details</h3>

              {displayData.updatedAt && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatLastUpdated(displayData.updatedAt)}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" /> SMTP Host
                </Label>
                <p className="mt-2 p-3 bg-gray-100 rounded border">
                  {displayData.host || "Not configured"}
                </p>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-500" /> Port
                </Label>
                <p className="mt-2 p-3 bg-gray-100 rounded border">
                  {displayData.port || "Not provided"}
                </p>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-600" /> Secure (TLS)
                </Label>
                <p className="mt-2 p-3 bg-gray-100 rounded border">
                  {displayData.secure === true ? "Enabled" : "Disabled"}
                </p>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-600" /> SMTP User
                </Label>
                <p className="mt-2 p-3 bg-gray-100 rounded border">
                  {displayData.user ? "********" : "Not configured"}
                </p>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" /> From Name
                </Label>
                <p className="mt-2 p-3 bg-gray-100 rounded border">
                  {displayData.fromName || "Not configured"}
                </p>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-red-600" /> From Email
                </Label>
                <p className="mt-2 p-3 bg-gray-100 rounded border">
                  {displayData.fromEmail || "Not configured"}
                </p>
              </div>

              <div className="md:col-span-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-yellow-600" /> Logo
                </Label>
                <div className="mt-2 p-3 bg-gray-100 rounded border">
                  {displayData.logo ? (
                    <div className="space-y-2">
                      <img
                        src={displayData.logo}
                        alt="SMTP Logo"
                        className="h-16 max-w-[200px] object-contain rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <p className="text-xs text-gray-500 break-all">{displayData.logo}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No logo uploaded</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TEST EMAIL CARD */}
      <Card className="border-dashed border-2 border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SendHorizonal className="w-5 h-5 text-green-600" />
            Send Test Email
          </CardTitle>
          <CardDescription>
            Verify your SMTP configuration by sending a real test email right now
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex-1 w-full">
              <Label className="text-sm font-medium mb-1.5 block">Recipient Email Address</Label>
              <Input
                type="email"
                placeholder="e.g. admin@chatvoo.com"
                value={testEmail}
                onChange={(e) => {
                  setTestEmail(e.target.value);
                  setTestResult(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSendTestEmail()}
                className="w-full"
              />
            </div>
            <Button
              onClick={handleSendTestEmail}
              disabled={isSendingTest || !testEmail.trim()}
              className="bg-green-600 hover:bg-green-700 text-white shrink-0"
            >
              {isSendingTest ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                <><SendHorizonal className="w-4 h-4 mr-2" /> Send Test Email</>
              )}
            </Button>
          </div>

          {/* Result feedback */}
          {testResult && (
            <div className={`mt-4 flex items-start gap-3 p-4 rounded-lg border ${testResult.success
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
              }`}>
              {testResult.success
                ? <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                : <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />}
              <div>
                <p className="font-semibold text-sm">
                  {testResult.success ? "Email sent successfully!" : "Send failed"}
                </p>
                <p className="text-sm mt-0.5">{testResult.message}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL */}
      <SMTPSettingsModal
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        existingData={displayData}
        onSuccess={() => {
          setShowEditDialog(false);
          refetch();
        }}
      />
    </div>
  );
}
