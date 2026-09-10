"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, KeyRound, LogIn, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/store/useUserStore";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface ArticleLockProps {
  initialCode?: string;
  onUnlocked?: () => void;
}

export default function ArticleLock({ initialCode = "", onUnlocked }: ArticleLockProps) {
  const { user } = useUserStore();
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoAttempted, setAutoAttempted] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const redeemCode = async (codeToRedeem: string) => {
    const trimmed = codeToRedeem.trim();
    if (!trimmed) return;

    if (!user) {
      const targetUrl = typeof window !== "undefined" ? (window.location.pathname + window.location.search) : "/subscribers";
      toast.error("Please log in to your account first");
      router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/subscribers/redeem", { code: trimmed });
      if (res.data?.success) {
        setSuccess(true);
        toast.success(res.data.message || "Subscriber access activated for 30 days!");
        // Strip code parameter from address bar for security & cleanliness
        if (typeof window !== "undefined" && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        if (onUnlocked) {
          onUnlocked();
        } else {
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || "This passcode is invalid or has already been redeemed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode && user && !success && !loading && !autoAttempted) {
      setAutoAttempted(true);
      redeemCode(initialCode);
    }
  }, [initialCode, user, success, loading, autoAttempted]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter a valid subscriber passcode");
      return;
    }
    redeemCode(code);
  };

  const targetUrl = typeof window !== "undefined" ? (window.location.pathname + window.location.search) : "/subscribers";
  const loginUrl = `/login?redirect=${encodeURIComponent(targetUrl)}`;
  const signupUrl = `/signup?redirect=${encodeURIComponent(targetUrl)}`;

  return (
    <div className="my-2 rounded-2xl border border-white/20 bg-black/65 backdrop-blur-xl p-5 sm:p-7 text-white shadow-2xl">
      <div className="flex flex-col items-center text-center max-w-lg mx-auto">
        {/* Lock / Shield Icon */}
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
          {success ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          ) : (
            <Lock className="h-6 w-6 text-amber-400" />
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
          {success ? "Subscriber Access Activated" : "Unlock Member Access"}
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-white/70 leading-relaxed">
          {success
            ? "Your 30-day subscriber access is active. Refreshing Vault content..."
            : "Sign in or enter your Instagram subscriber passcode below to unlock 30-day access instantly."}
        </p>

        {/* Action Form */}
        {!success && (
          <div className="mt-6 w-full space-y-4">
            {/* Inline Error Alert */}
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3.5 text-xs font-medium text-destructive flex items-center gap-2.5 text-left">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!user ? (
              <div className="space-y-3 pt-1">
                <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4 text-center space-y-3">
                  <p className="text-xs text-white/70">
                    Sign in to your account or enter your Instagram passcode to unlock member dispatches.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                    <Button asChild className="font-semibold bg-white text-black hover:bg-white/90 shadow-sm text-xs h-9">
                      <Link href={loginUrl}>
                        <LogIn className="mr-1.5 h-3.5 w-3.5" />
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="font-medium border-white/20 text-white hover:bg-white/10 text-xs h-9">
                      <Link href={signupUrl}>Create Account</Link>
                    </Button>
                  </div>
                </div>

                {/* Passcode Direct Input for Guest Requesters */}
                <form onSubmit={handleFormSubmit} className="space-y-2.5 pt-1">
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <Input
                      type="text"
                      placeholder="Have a Passcode? (e.g. TCV-8F92A1)"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        if (error) setError(null);
                      }}
                      className="h-10 border-white/20 bg-white/10 pl-10 font-mono text-xs tracking-wider uppercase text-white placeholder:text-white/40 focus:border-amber-400"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-9 font-semibold text-xs bg-amber-500 hover:bg-amber-400 text-black">
                    {loading ? <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : "Redeem Passcode"}
                  </Button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter Passcode (e.g. TCV-8F92A1)"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      if (error) setError(null);
                    }}
                    className="h-11 border-input bg-background pl-10 font-mono text-sm tracking-wider uppercase text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 font-semibold"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Verifying Passcode...
                    </>
                  ) : (
                    "Unlock 30-Day Access"
                  )}
                </Button>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground border-t border-border/50 pt-4 w-full">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Passcodes are sent via Instagram Subscriber Channel & DMs</span>
        </div>
      </div>
    </div>
  );
}

