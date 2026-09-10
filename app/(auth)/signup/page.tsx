"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Newspaper,
  ArrowRight,
  Sparkles,
  Flame,
  Check,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { useUserStore } from "@/store/useUserStore";
import { redirectByRole } from "@/utils/redirectByRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormSchema = z.infer<typeof schema>;

function SignupContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const codeParam = searchParams.get("code");
  const { user, setUser } = useUserStore();

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user && pathname === "/signup") {
      const t = setTimeout(() => redirectByRole(router, redirectParam), 0);
      return () => clearTimeout(t);
    }
  }, [user, pathname, router, redirectParam]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(schema),
  });

  const passwordValue = watch("password", "");

  // Password strength calculator
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "Empty", color: "bg-border" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 33, label: "Weak", color: "bg-amber-500" };
    if (score <= 4) return { score: 66, label: "Medium", color: "bg-blue-500" };
    return { score: 100, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (values: FormSchema) => {
    setError("");
    try {
      const { name, email, password } = values;
      const { data } = await api.post("/auth/register", { name, email, password });
      if (!data?.user) throw new Error("No user returned");

      if (data.accessToken) {
        localStorage.setItem("tcv_token", data.accessToken);
      }

      setUser(data.user);
      toast.success("Account created successfully! Welcome to The Commons Voice.");

      // If subscriber passcode code parameter exists in URL, attempt automatic redemption
      if (codeParam) {
        try {
          await api.post("/subscribers/redeem", { code: codeParam });
          toast.success("Subscriber passcode successfully activated for 30 days!");
        } catch (subErr) {
          console.error("Auto passcode redemption notice:", subErr);
        }
      }

      redirectByRole(router, redirectParam);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const errorMessage = axiosErr.response?.data?.message ?? "Registration failed";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-xs text-muted-foreground font-medium">Redirecting to your portal...</p>
        </div>
      </div>
    );
  }

  const loginLink = redirectParam
    ? `/login?redirect=${encodeURIComponent(redirectParam)}${codeParam ? `&code=${codeParam}` : ""}`
    : "/login";

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl grid grid-cols-1 lg:grid-cols-12">
        {/* Left Editorial Feature Panel (Desktop) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 sm:p-10 text-white relative overflow-hidden"
        >
          {/* Editorial Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/press-conference-bg.png"
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/85" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-xs font-bold text-white uppercase tracking-widest">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Join The Newsroom
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
                Become a Member of The Commons Voice
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Create your reader account to bookmark investigative reports, post comments, and unlock exclusive subscriber vault drops.
              </p>
            </div>

            {/* Account Benefits List */}
            <div className="space-y-3 pt-2">
              {[
                { label: "Personalized Article Bookmarks" },
                { label: "Participate in Newsroom Discussions" },
                { label: "Unlock Instagram & Vault Passcodes" },
                { label: "Receive Breaking Wire Alerts" },
              ].map((perk, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-white/90 font-medium">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>{perk.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guarantee Badge */}
          <div className="relative z-10 pt-8 border-t border-white/15">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/90 font-serif uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Free Reader Account • No Credit Card Required
            </div>
          </div>
        </motion.div>

        {/* Right Form Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-6"
        >
          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Create Your Free Account
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Enter your details below to set up your account and join our reader community.
            </p>
          </div>

          {/* Passcode Quick Notice */}
          {codeParam && (
            <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Passcode <strong>{codeParam}</strong> will automatically attach after registration!
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                  className={`pl-10 h-11 text-sm bg-background ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={`pl-10 h-11 text-sm bg-background ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  {...register("password")}
                  className={`pl-10 pr-10 h-11 text-sm bg-background ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {passwordValue && (
                <div className="space-y-1 pt-1">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                    <span>Password strength:</span>
                    <span className="font-semibold text-foreground">{strength.label}</span>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  {...register("confirmPassword")}
                  className={`pl-10 pr-10 h-11 text-sm bg-background ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="p-3 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full h-11 text-sm font-semibold gap-2 cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="pt-2 text-center text-xs text-muted-foreground">
            <span>Already have an account? </span>
            <Link href={loginLink} className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex h-[60vh] items-center justify-center text-xs text-muted-foreground">Loading Registration Portal...</div>}>
      <SignupContent />
    </Suspense>
  );
}