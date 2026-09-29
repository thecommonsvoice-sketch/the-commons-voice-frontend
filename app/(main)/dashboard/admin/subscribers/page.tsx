"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  RefreshCw,
  Plus,
  Search,
  ArrowLeft,
  Clock,
  UserX,
  UserPlus,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface SubscriberUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isSubscriber: boolean;
  subscriberExpiresAt?: string;
  createdAt: string;
}

export default function AdminSubscribersManagementPage() {
  const [subscribers, setSubscribers] = useState<SubscriberUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Grant Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [daysInput, setDaysInput] = useState(30);
  const [granting, setGranting] = useState(false);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      let url = "/admin/subscribers";
      if (search.trim()) url += `?search=${encodeURIComponent(search.trim())}`;
      const res = await api.get(url);
      setSubscribers(res.data?.subscribers || []);
    } catch (err) {
      console.error("Failed to load subscribers:", err);
      toast.error("Failed to load subscriber list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSubscribers();
  };

  const handleGrantOrExtend = async (email: string, days: number, action: "grant" | "extend") => {
    setGranting(true);
    try {
      const res = await api.post("/admin/subscribers/manage", {
        email: email.trim(),
        days: Number(days),
        action,
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Subscriber status updated!");
        setIsModalOpen(false);
        setEmailInput("");
        fetchSubscribers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update subscriber");
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = async (user: SubscriberUser) => {
    if (!confirm(`Are you sure you want to revoke subscriber access for "${user.name || user.email}"?`)) return;

    try {
      const res = await api.post("/admin/subscribers/manage", {
        userId: user.id,
        action: "revoke",
      });

      if (res.data?.success) {
        toast.success(`Revoked subscriber access for ${user.email}`);
        fetchSubscribers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to revoke access");
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpired = (dateStr?: string) => {
    if (!dateStr) return true;
    return new Date(dateStr) < new Date();
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/dashboard/admin" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Admin Panel
            </Link>
            <span>•</span>
            <span className="text-primary font-semibold">Subscriber Users</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-serif">
            Subscriber User Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            View active 30-day subscribers, grant manual access, extend memberships, or revoke access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 text-xs font-semibold">
            <UserPlus className="h-4 w-4" /> Grant Manual Access
          </Button>
          <Button onClick={fetchSubscribers} variant="outline" size="sm" className="gap-1 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border p-4 rounded-xl shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-sm"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Active Subscribers:{" "}
            <span className="font-bold text-foreground">
              {subscribers.filter((s) => s.isSubscriber && !isExpired(s.subscriberExpiresAt)).length}
            </span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 font-medium text-amber-600">
            <AlertCircle className="h-4 w-4" /> Expired Memberships:{" "}
            <span className="font-bold text-foreground">
              {subscribers.filter((s) => isExpired(s.subscriberExpiresAt)).length}
            </span>
          </span>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Active & Past Subscribers ({subscribers.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Loading subscribers...</div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No subscribers found matching your query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Expiration Date</th>
                  <th className="px-4 py-3">Account Role</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subscribers.map((item) => {
                  const active = item.isSubscriber && !isExpired(item.subscriberExpiresAt);

                  return (
                    <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-foreground">{item.name || "Subscriber User"}</div>
                        <div className="text-xs text-muted-foreground font-mono">{item.email}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        {active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-[11px] font-semibold border border-emerald-500/20">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" /> Active Membership
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 px-2.5 py-0.5 text-[11px] font-semibold border border-rose-500/20">
                            <Clock className="h-3 w-3 text-rose-500" /> Expired / Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-foreground">
                        {formatDate(item.subscriberExpiresAt)}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground uppercase text-[11px] font-mono">
                        {item.role}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGrantOrExtend(item.email, 30, "extend")}
                          className="h-8 px-2.5 text-xs gap-1 font-medium"
                          title="Extend membership by 30 days"
                        >
                          <Calendar className="h-3.5 w-3.5 text-primary" /> +30 Days
                        </Button>

                        {active && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRevoke(item)}
                            className="h-8 px-2.5 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 gap-1"
                            title="Revoke subscriber access"
                          >
                            <UserX className="h-3.5 w-3.5" /> Revoke
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Grant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" /> Grant Manual Subscriber Access
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGrantOrExtend(emailInput, daysInput, "grant");
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">User Email Address</label>
                <Input
                  type="email"
                  placeholder="subscriber@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="h-10 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Access Duration (Days)</label>
                <select
                  value={daysInput}
                  onChange={(e) => setDaysInput(Number(e.target.value))}
                  className="w-full h-10 rounded-md border bg-background px-3 text-sm font-medium"
                >
                  <option value={30}>30 Days (Standard Monthly)</option>
                  <option value={90}>90 Days (Quarterly)</option>
                  <option value={365}>365 Days (Annual VIP)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={granting}>
                  {granting ? "Granting..." : "Grant Membership"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
