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
    <div className="my-8 rounded-xl border border-border bg-card p-6 sm:p-10 text-card-foreground shadow-sm">
      <div className="flex flex-col items-center text-center max-w-lg mx-auto">
        {/* Lock / Shield Icon */}
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          {success ? (
            <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Lock className="h-7 w-7 text-primary" />
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {success ? "Subscriber Access Activated" : "Instagram Subscriber Access"}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {success
            ? "Your 30-day subscriber access is active. Refreshing story content..."
            : "This article is exclusive to TCV Instagram Subscribers. Enter your passcode or log in to unlock 30-day access across all your devices."}
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
              <div className="rounded-lg border border-border/80 bg-muted/30 p-5 text-center">
                <p className="text-xs text-muted-foreground mb-4">
                  Please sign in or create an account to redeem your passcode and link access to your profile.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    asChild
                    className="font-medium"
                  >
                    <Link href={loginUrl}>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In to Unlock
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                  >
                    <Link href={signupUrl}>Create Account</Link>
                  </Button>
                </div>
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

