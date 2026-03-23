"use client";

import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-[var(--text-tertiary)]">
            <LayoutDashboard size={64} className="mb-4 opacity-30" />
            <h1 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Tableau de Bord</h1>
            <p className="text-xs text-[var(--text-secondary)]">Module en cours de développement...</p>
            <p className="text-[11px] mt-3 text-[var(--text-tertiary)]">Revenez bientôt pour visualiser les indicateurs clés.</p>
        </div>
    );
}
