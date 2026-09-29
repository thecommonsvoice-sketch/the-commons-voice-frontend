"use client";

import { useState, useEffect } from "react";
import { KeyRound, Copy, Check, RefreshCw, Plus, UserCheck, Clock, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface SubscriberCodeItem {
  id: string;
  code: string;
  isUsed: boolean;
  usedByUserId?: string;
  redeemedAt?: string;
  createdAt: string;
  expiresAt?: string;
  usedByUser?: { name: string; email: string };
}

export default function AdminSubscriberCodesPage() {
  const [codes, setCodes] = useState<SubscriberCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [count, setCount] = useState(10);
  const [prefix, setPrefix] = useState("TCV");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "used" | "expired">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchCodes = async () => {
    setLoading(true);
    setSelectedIds([]);
    try {
      let url = "/admin/subscriber-codes?limit=100";
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      const res = await api.get(url);
      setCodes(res.data?.codes || []);
    } catch (err) {
      console.error("Failed to load subscriber codes:", err);
      toast.error("Failed to load subscriber codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [statusFilter]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (count <= 0 || count > 500) {
      toast.error("Count must be between 1 and 500");
      return;
    }

    setGenerating(true);
    try {
      const res = await api.post("/admin/subscriber-codes/generate", {
        count: Number(count),
        prefix: prefix.trim() || "TCV",
      });
      if (res.data?.success) {
        toast.success(`Successfully generated ${res.data.count} new subscriber passcodes!`);
        fetchCodes();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate passcodes");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteSingle = async (id: string, codeStr: string) => {
    if (!confirm(`Are you sure you want to delete passcode "${codeStr}"?`)) return;

    try {
      const res = await api.delete(`/admin/subscriber-codes/${id}`);
      if (res.data?.success) {
        toast.success(`Passcode "${codeStr}" deleted`);
        setCodes((prev) => prev.filter((item) => item.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete passcode");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected passcodes?`)) return;

    setDeleting(true);
    try {
      const res = await api.post("/admin/subscriber-codes/bulk-delete", { ids: selectedIds });
      if (res.data?.success) {
        toast.success(`Deleted ${selectedIds.length} passcodes`);
        fetchCodes();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to bulk delete passcodes");
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === codes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(codes.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCodeStatus = (item: SubscriberCodeItem) => {
    const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date();

    if (item.isUsed) {
      return {
        label: "Redeemed",
        colorClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        icon: UserCheck,
      };
    }
    if (isExpired) {
      return {
        label: "Expired",
        colorClass: "bg-rose-500/10 text-rose-600 border-rose-500/20",
        icon: Clock,
      };
    }
    return {
      label: "Active / Unused",
      colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      icon: Clock,
    };
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <p className="text-xs font-bold tracking-widest text-primary uppercase">
            Admin Management
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-serif">
            Subscriber Passcodes
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Generate single-use access passcodes for Instagram subscriber automation & DMs.
          </p>
        </div>

        <Button onClick={fetchCodes} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Generator Card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold flex items-center gap-2 mb-4 text-foreground">
          <Plus className="h-4 w-4 text-primary" /> Generate Bulk Passcodes
        </h2>
        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Prefix</label>
            <Input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.toUpperCase())}
              placeholder="TCV"
              className="h-10 font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Quantity (Max 500)</label>
            <Input
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min={1}
              max={500}
              className="h-10 font-mono"
            />
          </div>
          <Button
            type="submit"
            disabled={generating}
            className="h-10 font-medium"
          >
            {generating ? "Generating..." : "Generate Passcodes"}
          </Button>
        </form>
      </div>

      {/* Filter Tabs & Bulk Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Buttons */}
        <div className="inline-flex rounded-lg border bg-card p-1 text-xs font-medium">
          {(["all", "active", "used", "expired"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`capitalize px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === tab
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "used" ? "Redeemed" : tab}
            </button>
          ))}
        </div>

        {/* Bulk Delete Button */}
        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={deleting}
            className="gap-2 text-xs h-9"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
          </Button>
        )}
      </div>

      {/* Codes Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" /> Passcodes List ({codes.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Loading passcodes...</div>
        ) : codes.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No passcodes match current filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={codes.length > 0 && selectedIds.length === codes.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 accent-primary h-4 w-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3">Passcode</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Redeemed By</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {codes.map((item) => {
                  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://thecommonsvoice.com";
                  const unlockUrl = `${siteUrl}/subscribers?code=${item.code}`;
                  const status = getCodeStatus(item);
                  const StatusIcon = status.icon;

                  return (
                    <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelectOne(item.id)}
                          className="rounded border-gray-300 accent-primary h-4 w-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-foreground">
                        {item.code}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${status.colorClass}`}>
                          <StatusIcon className="h-3 w-3" /> {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {item.usedByUser ? (
                          <span className="font-medium text-foreground flex items-center gap-1">
                            <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                            {item.usedByUser.name || item.usedByUser.email}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(item.code, item.code)}
                          className="h-8 px-2 text-xs"
                          title="Copy Code"
                        >
                          {copiedCode === item.code ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          <span className="ml-1 hidden sm:inline">Code</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(unlockUrl, unlockUrl)}
                          className="h-8 px-2 text-xs"
                          title="Copy Link"
                        >
                          {copiedCode === unlockUrl ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          <span className="ml-1 hidden sm:inline">Link</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSingle(item.id, item.code)}
                          className="h-8 px-2 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete Passcode"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

