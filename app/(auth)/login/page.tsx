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
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormSchema = z.infer<typeof schema>;

function LoginContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const codeParam = searchParams.get("code");
  const { user, setUser } = useUserStore();

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (user && pathname === "/login") {
      const t = setTimeout(() => redirectByRole(router, redirectParam), 0);
      return () => clearTimeout(t);
    }
  }, [user, pathname, router, redirectParam]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormSchema) => {
    setError("");
    try {
      const { data } = await api.post("/auth/login", values);
      if (!data?.user) throw new Error("No user profile returned");

      if (data.accessToken) {
        localStorage.setItem("tcv_token", data.accessToken);
      }

      setUser(data.user);
      toast.success("Welcome back to The Commons Voice!");

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
      const errorMessage = axiosErr.response?.data?.message ?? "Invalid email or password";
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

  const signupLink = redirectParam
    ? `/signup?redirect=${encodeURIComponent(redirectParam)}${codeParam ? `&code=${codeParam}` : ""}`
    : "/signup";

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
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" /> Newsroom Member Portal
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
                Independent Journalism. Uncompromising Truth.
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Sign in to access subscriber vault dispatches, investigative video drops, and reader discussions.
              </p>
            </div>

            {/* Feature Perks List */}
            <div className="space-y-3 pt-2">
              {[
                { icon: KeyRound, label: "Exclusive Insider Vault Access" },
                { icon: Flame, label: "Raw Unedited Video & Media Drops" },
                { icon: Newspaper, label: "Restricted Investigative Wire Reports" },
                { icon: ShieldCheck, label: "Ad-Free Newsroom Experience" },
              ].map((perk, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-white/90 font-medium">
                  <div className="h-6 w-6 rounded-md bg-white/15 backdrop-blur-sm flex items-center justify-center text-amber-400 shrink-0 border border-white/10">
                    <perk.icon className="h-3.5 w-3.5" />
                  </div>
                  <span>{perk.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial Quote Footer */}
          <div className="relative z-10 pt-8 border-t border-white/15">
            <blockquote className="text-xs italic text-white/75 leading-relaxed font-serif">
              &ldquo;Independent press is the bedrock of democracy. We answer only to our readers.&rdquo;
            </blockquote>
            <p className="mt-2 text-[11px] font-bold text-white/90 font-serif uppercase tracking-wider">
              — The Commons Voice Editorial Board
            </p>
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
              Sign In to Your Account
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Enter your credentials below to access your member account and subscriber dispatches.
            </p>
          </div>

          {/* Passcode Quick Notice */}
          {codeParam && (
            <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Passcode <strong>{codeParam}</strong> will automatically attach upon sign-in!
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <p className="text-xs font-medium text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => toast.info("Contact your newsroom admin to reset your credentials.")}
                  className="text-[11px] font-medium text-primary hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
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
              {errors.password && (
                <p className="text-xs font-medium text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs font-medium text-muted-foreground cursor-pointer">
                Keep me signed in on this browser
              </label>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="p-3 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full h-11 text-sm font-semibold gap-2 cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Switch to Signup */}
          <div className="pt-2 text-center text-xs text-muted-foreground">
            <span>Don&rsquo;t have a member account yet? </span>
            <Link href={signupLink} className="text-primary font-bold hover:underline">
              Create an Account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-[60vh] items-center justify-center text-xs text-muted-foreground">Loading Login Portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}