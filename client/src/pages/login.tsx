import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ResetPassword from "@/components/ResetPassword";
import VerifyOtp from "@/components/VerifyOtp";
import ForgotPasswordEmail from "@/components/ForgotPasswordEmail";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff, MessageSquare, Zap, BarChart3, Shield, Users, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppSettings } from "@/types/types";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Animated floating particles
function Particles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.5 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-green-400"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animation: `floatParticle ${p.duration}s ${p.delay}s infinite alternate ease-in-out`,
          }}
        />
      ))}
    </div>
  );
}

// Animated grid lines
function GridLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          animation: "gridMove 20s linear infinite",
        }}
      />
    </div>
  );
}

const features = [
  { icon: Zap, title: "Instant Campaigns", description: "Launch WhatsApp campaigns in seconds", color: "from-yellow-400 to-orange-400" },
  { icon: BarChart3, title: "Real-time Analytics", description: "Live delivery and engagement tracking", color: "from-blue-400 to-cyan-400" },
  { icon: Users, title: "Smart Segmentation", description: "Target the right audience effortlessly", color: "from-purple-400 to-pink-400" },
  { icon: Shield, title: "Enterprise Security", description: "GDPR compliant & end-to-end encrypted", color: "from-green-400 to-emerald-400" },
];

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"login" | "forgot" | "verify" | "reset">("login");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const { data: brandSettings } = useQuery<AppSettings>({
    queryKey: ["/api/brand-settings"],
    queryFn: () => fetch("/api/brand-settings").then((res) => res.json()),
    staleTime: 5 * 60 * 1000,
  });

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      let json: any;
      try { json = await response.json(); } catch { json = {}; }
      if (!response.ok) throw new Error(json?.error || "Login failed. Please try again.");
      return json;
    },
    onSuccess: () => {
      try { sessionStorage.setItem("fromLogin", "true"); } catch { }
      window.location.href = "/dashboard";
    },
    onError: (error: any) => {
      let errorMessage = error?.message || "Login failed. Please try again.";
      if (error.message.includes("401")) errorMessage = "Invalid username or password";
      else if (error.message.includes("403")) errorMessage = "Account is inactive. Please contact administrator.";
      setError(errorMessage);
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setError(null);
    loginMutation.mutate(data);
  };

  return (
    <>
      <style>{`
        @keyframes floatParticle {
          0% { transform: translateY(0px) translateX(0px); }
          100% { transform: translateY(-30px) translateX(15px); }
        }
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(60px); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(34,197,94,0.2); }
          50% { box-shadow: 0 0 40px rgba(34,197,94,0.5); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 20px) scale(1.2); }
          66% { transform: translate(25px, -25px) scale(0.8); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fadeSlideUp { animation: fadeSlideUp 0.6s ease forwards; }
        .animate-fadeSlideIn { animation: fadeSlideIn 0.5s ease forwards; }
        .animate-pulseGlow { animation: pulseGlow 3s ease-in-out infinite; }
        .login-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          color: white;
          transition: all 0.3s ease;
        }
        .login-input::placeholder { color: rgba(255,255,255,0.35); }
        .login-input:focus {
          background: rgba(255,255,255,0.08);
          border-color: rgba(34,197,94,0.6);
          box-shadow: 0 0 0 3px rgba(34,197,94,0.1);
          outline: none;
        }
        .login-input:hover { border-color: rgba(255,255,255,0.2); }
        .feature-card {
          transition: all 0.5s ease;
        }
        .feature-card.active {
          background: rgba(34,197,94,0.08);
          border-color: rgba(34,197,94,0.3);
          transform: translateX(8px);
        }
      `}</style>

      <div className="min-h-screen flex overflow-hidden" style={{ background: "#050a0e" }}>

        {/* LEFT PANEL - Dark animated side */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #050a0e 0%, #0d1f17 50%, #050a0e 100%)" }}>
          <GridLines />
          <Particles />

          {/* Animated orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)", animation: "orb1 12s ease-in-out infinite" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)", animation: "orb2 16s ease-in-out infinite" }} />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between px-14 py-14 w-full">
            {/* Logo */}
            <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              {brandSettings?.logo ? (
                <img
                  src={brandSettings.logo.startsWith('http') ? brandSettings.logo : brandSettings.logo}
                  alt="Logo"
                  className="h-10 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #22c55e, #10b981)", animation: "pulseGlow 3s ease-in-out infinite" }}>
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <span className="text-white text-xl font-bold tracking-tight">
                    {brandSettings?.title || "Chatvoo"}
                  </span>
                </div>
              )}
            </div>

            {/* Main heading */}
            <div className={`transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium text-green-400" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <Sparkles className="h-3 w-3" />
                WhatsApp Business Platform
              </div>
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-5" style={{ color: "white" }}>
                Grow Your Business with{" "}
                <span style={{ background: "linear-gradient(135deg, #22c55e, #10b981, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  WhatsApp
                </span>
              </h1>
              <p className="text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                Send campaigns, automate conversations, and engage millions of customers on the world's most popular messaging app.
              </p>
            </div>

            {/* Feature cards */}
            <div className={`space-y-3 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`feature-card flex items-center gap-4 p-4 rounded-xl cursor-pointer ${activeFeature === index ? "active" : ""}`}
                  style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0`} style={{ background: `linear-gradient(135deg, ${feature.color.replace("from-", "").replace("to-", "").split(" ").join(", ")})`, opacity: activeFeature === index ? 1 : 0.5 }}>
                    <feature.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: activeFeature === index ? "white" : "rgba(255,255,255,0.6)" }}>{feature.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{feature.description}</p>
                  </div>
                  {activeFeature === index && (
                    <div className="ml-auto w-1.5 h-6 rounded-full" style={{ background: "linear-gradient(to bottom, #22c55e, #10b981)" }} />
                  )}
                </div>
              ))}
            </div>

            {/* Bottom stat strip */}
            <div className="grid grid-cols-3 gap-4">
              {[["10M+", "Messages Sent"], ["99.9%", "Uptime SLA"], ["150+", "Countries"]].map(([val, label]) => (
                <div key={label} className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="font-bold text-lg" style={{ background: "linear-gradient(135deg, #22c55e, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{val}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Login form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative px-6 py-10" style={{ background: "#080f14" }}>
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)" }} />

          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #22c55e, #10b981)", boxShadow: "0 0 40px rgba(34,197,94,0.4)" }}>
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
            </div>

            {/* Heading */}
            <div className={`mb-8 transition-all duration-700 ${mounted ? "animate-fadeSlideUp" : "opacity-0"}`}>
              {step === "login" && <>
                <h2 className="text-3xl font-bold mb-2" style={{ color: "white" }}>Welcome back</h2>
                <p style={{ color: "rgba(255,255,255,0.4)" }}>Sign in to your dashboard to continue</p>
              </>}
              {step === "forgot" && <>
                <h2 className="text-3xl font-bold mb-2" style={{ color: "white" }}>Forgot password?</h2>
                <p style={{ color: "rgba(255,255,255,0.4)" }}>Enter your email to receive a reset code</p>
              </>}
              {step === "verify" && <>
                <h2 className="text-3xl font-bold mb-2" style={{ color: "white" }}>Check your email</h2>
                <p style={{ color: "rgba(255,255,255,0.4)" }}>Enter the 6-digit code we sent to you</p>
              </>}
              {step === "reset" && <>
                <h2 className="text-3xl font-bold mb-2" style={{ color: "white" }}>Create new password</h2>
                <p style={{ color: "rgba(255,255,255,0.4)" }}>Choose a strong password to protect your account</p>
              </>}
            </div>

            {/* Form Card */}
            <div className={`rounded-2xl p-8 transition-all duration-700 delay-100 ${mounted ? "animate-fadeSlideUp" : "opacity-0"}`} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>
              {step === "login" && (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    {error && (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>Username</label>
                          <FormControl>
                            <input
                              {...field}
                              placeholder="Enter your username"
                              autoComplete="username"
                              autoFocus
                              className="login-input w-full px-4 py-3 rounded-xl text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs mt-1" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>Password</label>
                            <button type="button" className="text-xs font-medium transition-colors" style={{ color: "#22c55e" }} onClick={() => setStep("forgot")}>
                              Forgot password?
                            </button>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                className="login-input w-full px-4 py-3 pr-12 rounded-xl text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                                style={{ color: "rgba(255,255,255,0.3)" }}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs mt-1" />
                        </FormItem>
                      )}
                    />

                    <button
                      type="submit"
                      disabled={loginMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 text-white mt-2"
                      style={{
                        background: loginMutation.isPending ? "rgba(34,197,94,0.4)" : "linear-gradient(135deg, #22c55e, #10b981)",
                        boxShadow: loginMutation.isPending ? "none" : "0 0 30px rgba(34,197,94,0.3)",
                      }}
                    >
                      {loginMutation.isPending ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
                      ) : (
                        <><span>Sign in</span><ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </form>
                </Form>
              )}

              {step === "forgot" && (
                <ForgotPasswordEmail
                  onEmailSent={(sentEmail) => { setEmail(sentEmail); setStep("verify"); }}
                  onBack={() => setStep("login")}
                />
              )}
              {step === "verify" && (
                <VerifyOtp email={email} onVerified={(otp) => { setOtpCode(otp); setStep("reset"); }} />
              )}
              {step === "reset" && (
                <ResetPassword email={email} otpCode={otpCode} onReset={() => setStep("login")} />
              )}
            </div>

            {/* Sign up link */}
            {step === "login" && (
              <div className={`mt-6 text-center transition-all duration-700 delay-200 ${mounted ? "animate-fadeSlideUp" : "opacity-0"}`}>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Don't have an account?{" "}
                  <Link to="/signup" className="font-semibold transition-colors" style={{ color: "#22c55e" }}>
                    Create one free
                  </Link>
                </p>
              </div>
            )}

            {/* Trust badges */}
            <div className={`mt-8 flex items-center justify-center gap-6 transition-all duration-700 delay-300 ${mounted ? "animate-fadeSlideUp" : "opacity-0"}`}>
              {[["🔒", "SSL Encrypted"], ["✓", "GDPR Compliant"], ["⚡", "99.9% Uptime"]].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
