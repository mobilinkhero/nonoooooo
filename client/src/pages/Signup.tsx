import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, User,
  MessageSquare, Sparkles, CheckCircle2, Loader2,
  ShieldCheck, Zap, Globe, HeartHandshake,
} from "lucide-react";
import { AppSettings } from "@/types/types";

// ——— Floating particles ———
function Particles() {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.4 + 0.1,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-green-400"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            opacity: p.opacity,
            animation: `floatParticle ${p.duration}s ${p.delay}s infinite alternate ease-in-out`,
          }}
        />
      ))}
    </div>
  );
}

// ——— Animated grid ———
function GridLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        animation: "gridMove 20s linear infinite",
      }} />
    </div>
  );
}

const perks = [
  { icon: Zap, label: "Launch campaigns in minutes" },
  { icon: Globe, label: "Reach customers in 150+ countries" },
  { icon: ShieldCheck, label: "GDPR compliant & secure" },
  { icon: HeartHandshake, label: "24/7 dedicated support" },
];

// ——— Password strength ———
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : "rgba(255,255,255,0.1)" }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map(c => (
          <span key={c.label} className="flex items-center gap-1 text-xs"
            style={{ color: c.ok ? "#22c55e" : "rgba(255,255,255,0.3)" }}>
            <CheckCircle2 className="w-3 h-3" />{c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const Signup: React.FC = () => {
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    username: "", firstName: "", lastName: "",
    email: "", password: "", confirmPassword: "", agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { data: brandSettings } = useQuery<AppSettings>({
    queryKey: ["/api/brand-settings"],
    queryFn: () => fetch("/api/brand-settings").then((res) => res.json()),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setMounted(true);
    const searchParams = new URLSearchParams(window.location.search);
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      setFormData(prev => ({ ...prev, email: decodeURIComponent(emailFromUrl) }));
    }
  }, [location]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const res = await apiRequest("POST", "/api/users/create", {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: "admin",
        avatar: "",
      });
      const data = await res.json();
      if (data.success) {
        setLocation(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        return;
      }
      setErrors({ general: data.message });
    } catch (error: any) {
      let message = "";
      if (error?.message) {
        try {
          const parsed = JSON.parse(error.message.replace(/^\d+:\s*/, ""));
          message = parsed.message || "";
        } catch { message = error.message || ""; }
      }
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
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
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 20px) scale(1.2); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(34,197,94,0.2); }
          50% { box-shadow: 0 0 40px rgba(34,197,94,0.5); }
        }
        .signup-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          color: white;
          width: 100%;
          padding: 11px 16px 11px 40px;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.3s ease;
          outline: none;
        }
        .signup-input::placeholder { color: rgba(255,255,255,0.3); }
        .signup-input:focus {
          background: rgba(255,255,255,0.08);
          border-color: rgba(34,197,94,0.6);
          box-shadow: 0 0 0 3px rgba(34,197,94,0.1);
        }
        .signup-input-noicon {
          padding-left: 16px;
        }
        .animate-fadeSlideUp { animation: fadeSlideUp 0.6s ease forwards; }
      `}</style>

      <div className="min-h-screen flex overflow-hidden" style={{ background: "#050a0e" }}>

        {/* LEFT PANEL */}
        <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-between px-12 py-12"
          style={{ background: "linear-gradient(135deg, #050a0e 0%, #0d1f17 50%, #050a0e 100%)" }}>
          <GridLines />
          <Particles />

          {/* Orbs */}
          <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)", animation: "orb1 14s ease-in-out infinite" }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)", animation: "orb2 18s ease-in-out infinite" }} />

          {/* Logo */}
          <div className={`relative z-10 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            {brandSettings?.logo ? (
              <img src={brandSettings.logo} alt="Logo" className="h-10 object-contain brightness-0 invert" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #22c55e, #10b981)", animation: "pulseGlow 3s ease-in-out infinite" }}>
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <span className="text-white text-xl font-bold">{brandSettings?.title || "Chatvoo"}</span>
              </div>
            )}
          </div>

          {/* Middle content */}
          <div className={`relative z-10 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium text-green-400"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <Sparkles className="h-3 w-3" />
              Join thousands of businesses
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-4 text-white">
              Start reaching your customers on{" "}
              <span style={{ background: "linear-gradient(135deg, #22c55e, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                WhatsApp
              </span>
            </h1>
            <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.5)" }}>
              Create your free account and start sending campaigns, automating conversations, and growing your business today.
            </p>

            <div className="space-y-4">
              {perks.map((perk, i) => (
                <div key={i} className="flex items-center gap-3"
                  style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <perk.icon className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{perk.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stats */}
          <div className={`relative z-10 grid grid-cols-3 gap-3 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            {[["Free", "To get started"], ["10M+", "Messages sent"], ["99.9%", "Uptime SLA"]].map(([val, label]) => (
              <div key={label} className="text-center p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="font-bold text-base"
                  style={{ background: "linear-gradient(135deg, #22c55e, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{val}</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL - Signup form */}
        <div className="w-full lg:w-7/12 flex items-center justify-center relative px-6 py-8 overflow-y-auto"
          style={{ background: "#080f14" }}>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)" }} />

          <div className="w-full max-w-lg py-4">
            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-6">
              {brandSettings?.logo ? (
                <img src={brandSettings.logo} alt="Logo" className="h-12 object-contain" />
              ) : (
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #22c55e, #10b981)", boxShadow: "0 0 40px rgba(34,197,94,0.4)" }}>
                  <MessageSquare className="h-7 w-7 text-white" />
                </div>
              )}
            </div>

            {/* Heading */}
            <div className={`mb-6 transition-all duration-700 ${mounted ? "animate-fadeSlideUp" : "opacity-0"}`}>
              <h2 className="text-3xl font-bold mb-1.5 text-white">Create your account</h2>
              <p style={{ color: "rgba(255,255,255,0.4)" }}>Join thousands of businesses growing with WhatsApp</p>
            </div>

            {/* Form card */}
            <div className={`rounded-2xl p-7 transition-all duration-700 delay-100 ${mounted ? "animate-fadeSlideUp" : "opacity-0"}`}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* General error */}
                {errors.general && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    {errors.general}
                  </div>
                )}

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
                    <input type="text" name="username" value={formData.username} onChange={handleChange}
                      placeholder="Choose a unique username" className="signup-input"
                      style={errors.username ? { borderColor: "rgba(239,68,68,0.5)" } : {}} />
                  </div>
                  {errors.username && <p className="mt-1 text-xs" style={{ color: "#fca5a5" }}>{errors.username}</p>}
                </div>

                {/* First + Last name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                        placeholder="John" className="signup-input"
                        style={errors.firstName ? { borderColor: "rgba(239,68,68,0.5)" } : {}} />
                    </div>
                    {errors.firstName && <p className="mt-1 text-xs" style={{ color: "#fca5a5" }}>{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                        placeholder="Doe" className="signup-input"
                        style={errors.lastName ? { borderColor: "rgba(239,68,68,0.5)" } : {}} />
                    </div>
                    {errors.lastName && <p className="mt-1 text-xs" style={{ color: "#fca5a5" }}>{errors.lastName}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      placeholder="john@company.com" className="signup-input"
                      style={errors.email ? { borderColor: "rgba(239,68,68,0.5)" } : {}} />
                  </div>
                  {errors.email && <p className="mt-1 text-xs" style={{ color: "#fca5a5" }}>{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                      placeholder="Create a strong password" className="signup-input" style={{ paddingRight: "44px", ...(errors.password ? { borderColor: "rgba(239,68,68,0.5)" } : {}) }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: "rgba(255,255,255,0.3)" }}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={formData.password} />
                  {errors.password && <p className="mt-1 text-xs" style={{ color: "#fca5a5" }}>{errors.password}</p>}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                      placeholder="Confirm your password" className="signup-input" style={{ paddingRight: "44px", ...(errors.confirmPassword ? { borderColor: "rgba(239,68,68,0.5)" } : {}) }} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "rgba(255,255,255,0.3)" }}>
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Match indicator */}
                  {formData.confirmPassword && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs"
                      style={{ color: formData.password === formData.confirmPassword ? "#22c55e" : "#fca5a5" }}>
                      <CheckCircle2 className="w-3 h-3" />
                      {formData.password === formData.confirmPassword ? "Passwords match" : "Passwords don't match"}
                    </div>
                  )}
                  {errors.confirmPassword && <p className="mt-1 text-xs" style={{ color: "#fca5a5" }}>{errors.confirmPassword}</p>}
                </div>

                {/* Terms checkbox */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative mt-0.5 flex-shrink-0">
                      <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange}
                        className="sr-only" />
                      <div onClick={() => setFormData(p => ({ ...p, agreeToTerms: !p.agreeToTerms }))}
                        className="w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer"
                        style={{
                          background: formData.agreeToTerms ? "linear-gradient(135deg, #22c55e, #10b981)" : "rgba(255,255,255,0.05)",
                          border: formData.agreeToTerms ? "none" : "1px solid rgba(255,255,255,0.2)",
                        }}>
                        {formData.agreeToTerms && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                    <span className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                      I agree to the{" "}
                      <Link to="/terms" className="font-medium" style={{ color: "#22c55e" }}>Terms of Service</Link>
                      {" "}and{" "}
                      <Link to="/privacy-policy" className="font-medium" style={{ color: "#22c55e" }}>Privacy Policy</Link>
                    </span>
                  </label>
                  {errors.agreeToTerms && <p className="mt-1 text-xs" style={{ color: "#fca5a5" }}>{errors.agreeToTerms}</p>}
                </div>

                {/* Submit */}
                <button type="submit" disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 mt-2"
                  style={{
                    background: isLoading ? "rgba(34,197,94,0.4)" : "linear-gradient(135deg, #22c55e, #10b981)",
                    boxShadow: isLoading ? "none" : "0 0 30px rgba(34,197,94,0.3)",
                  }}>
                  {isLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                    : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </div>

            {/* Sign in link */}
            <div className={`mt-5 text-center transition-all duration-700 delay-200 ${mounted ? "animate-fadeSlideUp" : "opacity-0"}`}>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                Already have an account?{" "}
                <Link to="/login" className="font-semibold" style={{ color: "#22c55e" }}>Sign in</Link>
              </p>
            </div>

            {/* Trust badges */}
            <div className={`mt-6 flex items-center justify-center gap-6 transition-all duration-700 delay-300 ${mounted ? "animate-fadeSlideUp" : "opacity-0"}`}>
              {[["🔒", "SSL Encrypted"], ["✓", "GDPR Compliant"], ["⚡", "99.9% Uptime"]].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                  <span>{icon}</span><span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
