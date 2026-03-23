"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FolderOpen,
    Eye,
    Bell,
    ChevronRight,
    ChevronLeft,
    Sun,
    Moon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { getUnresolvedCount, subscribeToAlerts } from "@/lib/alertStore";

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [alertsCount, setAlertsCount] = useState(() => getUnresolvedCount());
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const unsubscribe = subscribeToAlerts(() => setAlertsCount(getUnresolvedCount()));
        return unsubscribe;
    }, []);

    const navigation = [
        { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
        { name: "Projet Doc", href: "/projects", icon: FolderOpen },
        { name: "Suivi", href: "/suivi", icon: Eye },
        {
            name: "Alertes",
            href: "/alerts",
            icon: Bell,
            badge: alertsCount > 0 ? alertsCount : undefined,
        },
    ];

    const isActive = (href: string) => pathname.startsWith(href);

    return (
        <div
            className={`
                flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out
                bg-[var(--bg-surface)] border-r border-[var(--border-default)]
                ${isCollapsed ? "w-[72px]" : "w-[240px]"}
            `}
        >
            {/* ── Logo ── */}
            <div className={`flex items-center h-14 px-4 border-b border-[var(--border-subtle)] ${isCollapsed ? "justify-center" : "gap-3"}`}>
                <div className="flex-shrink-0 w-9 h-9 rounded-[var(--radius-md)] overflow-hidden shadow-[var(--shadow-sm)] bg-white">
                    <Image src="/edc_logo.jpg" alt="EDC" width={36} height={36} className="w-full h-full object-contain" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col overflow-hidden whitespace-nowrap">
                        <span className="text-[13px] font-bold text-[var(--text-primary)] tracking-tight">EDC Track</span>
                        <span className="text-[9px] text-[var(--text-tertiary)] font-semibold tracking-[0.15em] uppercase">Enterprise</span>
                    </div>
                )}
            </div>

            {/* ── Navigation ── */}
            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
                {navigation.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.name : ""}
                            className={`
                                flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] transition-all duration-150 group relative
                                text-[13px] font-medium
                                ${active
                                    ? "bg-[var(--bg-surface-hover)] text-[var(--text-primary)] font-semibold"
                                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
                                }
                                ${isCollapsed ? "justify-center py-2.5" : ""}
                            `}
                        >
                            {/* Active indicator */}
                            {active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[var(--text-primary)] rounded-r-full" />
                            )}

                            <item.icon
                                size={16}
                                strokeWidth={active ? 2.2 : 1.8}
                                className={`flex-shrink-0 transition-colors duration-150 ${active
                                    ? "text-[var(--text-primary)]"
                                    : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]"
                                    }`}
                            />

                            {!isCollapsed && (
                                <span className="flex-1 whitespace-nowrap overflow-hidden">{item.name}</span>
                            )}

                            {/* Badge */}
                            {item.badge != null && item.badge > 0 && (
                                <span
                                    className={`
                                        flex items-center justify-center rounded-full bg-red-500 text-white font-bold
                                        ${isCollapsed
                                            ? "absolute top-1 right-1 w-4 h-4 text-[8px]"
                                            : "text-[9px] min-w-[18px] h-[18px] px-1"
                                        }
                                    `}
                                >
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* ── Bottom section ── */}
            <div className="p-3 flex flex-col gap-1 border-t border-[var(--border-subtle)]">
                {/* Controls row */}
                <div className={`flex ${isCollapsed ? "flex-col items-center gap-1" : "items-center gap-0.5"}`}>
                    {/* Theme toggle */}
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className={`
                            flex items-center gap-2 p-2 rounded-[var(--radius-md)] transition-all duration-150
                            text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]
                            ${isCollapsed ? "" : "flex-1"}
                        `}
                        title={theme === "dark" ? "Mode clair" : "Mode sombre"}
                    >
                        {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                        {!isCollapsed && (
                            <span className="text-[11px] font-medium">
                                {theme === "dark" ? "Clair" : "Sombre"}
                            </span>
                        )}
                    </button>

                    {/* Collapse toggle */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="flex items-center justify-center p-2 rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-all duration-150 flex-shrink-0"
                        title={isCollapsed ? "Déplier" : "Réduire"}
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                {/* Profile */}
                <button className={`flex items-center rounded-[var(--radius-md)] p-2 transition-all duration-150 hover:bg-[var(--bg-surface-hover)] group text-left ${isCollapsed ? "justify-center" : "gap-3"}`}>
                    <div className="h-8 w-8 rounded-[var(--radius-md)] bg-gradient-to-br from-blue-500 to-violet-600 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold shadow-[var(--shadow-sm)]">
                        IM
                    </div>

                    {!isCollapsed && (
                        <div className="flex flex-1 flex-col overflow-hidden">
                            <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                                Ibrahim M.
                            </span>
                            <span className="text-[10px] text-[var(--text-tertiary)] truncate">
                                Chef de Projet
                            </span>
                        </div>
                    )}

                    {!isCollapsed && (
                        <ChevronRight size={12} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] flex-shrink-0" />
                    )}
                </button>
            </div>
        </div>
    );
}
