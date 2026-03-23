"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    AlertTriangle,
    AlertCircle,
    CheckCircle,
    ChevronRight,
    ChevronDown,
    Bell,
} from "lucide-react";
import {
    getCriticalAlerts,
    getWarningAlerts,
    getResolvedAlerts,
    getUnresolvedCount,
    markAlertResolved,
    subscribeToAlerts,
    type Alert,
} from "@/lib/alertStore";
import { toast } from "@/lib/toastStore";

// ══════════════════════════════════════
// PAGE
// ══════════════════════════════════════

export default function AlertsPage() {
    const [critical, setCritical] = useState<Alert[]>([]);
    const [warning, setWarning] = useState<Alert[]>([]);
    const [resolved, setResolved] = useState<Alert[]>([]);
    const [showResolved, setShowResolved] = useState(false);

    const refresh = () => {
        setCritical(getCriticalAlerts());
        setWarning(getWarningAlerts());
        setResolved(getResolvedAlerts());
    };

    useEffect(() => {
        refresh();
        const unsubscribe = subscribeToAlerts(refresh);
        return unsubscribe;
    }, []);

    const totalUnresolved = getUnresolvedCount();
    const formatResolvedDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
        } catch {
            return iso;
        }
    };

    const AlertRow = ({
        alert,
        variant,
        onResolve,
    }: {
        alert: Alert;
        variant: "critical" | "warning" | "resolved";
        onResolve?: (id: string) => void;
    }) => {
        const borderColor = variant === "critical" ? "border-l-red-500" : variant === "warning" ? "border-l-amber-500" : "border-l-green-500";
        const suiviHref = `/suivi/${alert.projectId.toLowerCase()}`;

        if (variant === "resolved") {
            return (
                <div className={`bg-[var(--bg-surface)] border border-[var(--border-default)] border-l-[3px] ${borderColor} rounded-[var(--radius-md)] px-4 py-3 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity`}>
                    <div>
                        <h3 className="font-semibold text-[var(--text-secondary)] text-[14px]">✓ {alert.title}</h3>
                        <div className="text-[var(--text-tertiary)] text-[12px] flex items-center gap-2 mt-0.5">
                            <span>{alert.resolvedAt ? formatResolvedDate(alert.resolvedAt) : "—"}</span>
                            <span>·</span>
                            <span>{alert.projectName}</span>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={`bg-[var(--bg-surface)] border border-[var(--border-default)] border-l-[3px] ${borderColor} rounded-[var(--radius-md)] px-4 py-3 flex items-center justify-between hover:bg-[var(--bg-surface-hover)] transition-colors group`}>
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-[var(--text-primary)] text-[14px]">{alert.title}</h3>
                        {alert.delay && (
                            <span className="text-red-500 bg-[var(--danger-subtle)] px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-bold border border-red-200 dark:border-red-800/30">
                                {alert.delay}
                            </span>
                        )}
                    </div>
                    <div className="text-[var(--text-secondary)] text-[12px] flex items-center gap-2">
                        <span className="font-mono text-[11px] bg-[var(--bg-inset)] px-1.5 py-0.5 rounded-[var(--radius-sm)] border border-[var(--border-default)]">
                            {alert.projectCode}
                        </span>
                        <span className="text-[var(--text-tertiary)]">·</span>
                        <span>{alert.projectName}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {onResolve && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onResolve(alert.id);
                                toast.success("Alerte marquée comme résolue");
                            }}
                            className="text-[11px] font-medium text-green-600 hover:text-green-700 hover:underline"
                        >
                            Marquer résolu
                        </button>
                    )}
                    <Link
                        href={suiviHref}
                        className="text-[var(--accent)] text-[12px] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-100"
                    >
                        Voir <ChevronRight size={14} />
                    </Link>
                </div>
            </div>
        );
    };

    return (
        <div className="px-[var(--page-px)] py-[var(--page-py)] min-h-full max-w-4xl">
            {/* ── Header ── */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2.5 tracking-tight">
                        <Bell size={20} strokeWidth={1.8} className="text-[var(--text-tertiary)]" />
                        Alertes
                    </h1>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
                        Suivi des obligations et échéances critiques
                    </p>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-red-500 bg-[var(--danger-subtle)] border border-red-200 dark:border-red-800/30">
                    <AlertCircle size={13} /> {totalUnresolved} non résolue{totalUnresolved > 1 ? "s" : ""}
                </span>
            </div>

            {/* ── Content ── */}
            <div className="space-y-8">
                {/* CRITICAL */}
                <div>
                    <h2 className="text-[12px] font-bold text-red-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
                        <AlertCircle size={14} /> Critiques ({critical.length})
                    </h2>
                    <div className="space-y-2">
                        {critical.length === 0 ? (
                            <p className="text-[12px] text-[var(--text-tertiary)] italic">Aucune alerte critique.</p>
                        ) : (
                            critical.map((alert) => (
                                <AlertRow
                                    key={alert.id}
                                    alert={alert}
                                    variant="critical"
                                    onResolve={markAlertResolved}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* WARNING */}
                <div>
                    <h2 className="text-[12px] font-bold text-amber-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
                        <AlertTriangle size={14} /> Attention ({warning.length})
                    </h2>
                    <div className="space-y-2">
                        {warning.length === 0 ? (
                            <p className="text-[12px] text-[var(--text-tertiary)] italic">Aucune alerte en attention.</p>
                        ) : (
                            warning.map((alert) => (
                                <AlertRow
                                    key={alert.id}
                                    alert={alert}
                                    variant="warning"
                                    onResolve={markAlertResolved}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* RESOLVED */}
                <div>
                    <button
                        onClick={() => setShowResolved(!showResolved)}
                        className="w-full flex items-center justify-between text-[12px] font-bold text-green-500 mb-3 uppercase tracking-wider hover:bg-[var(--bg-surface-hover)] p-2 rounded-[var(--radius-md)] transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle size={14} /> Résolues récemment ({resolved.length})
                        </div>
                        {showResolved ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {showResolved && (
                        <div className="space-y-2">
                            {resolved.length === 0 ? (
                                <p className="text-[12px] text-[var(--text-tertiary)] italic">Aucune alerte résolue.</p>
                            ) : (
                                resolved.map((alert) => (
                                    <AlertRow key={alert.id} alert={alert} variant="resolved" />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
