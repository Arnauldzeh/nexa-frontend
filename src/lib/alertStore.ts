// ══════════════════════════════════════
// ALERT STORE (localStorage)
// Géré côté frontend comme les autres stores (projectStore, documentTrackingStore)
// ══════════════════════════════════════

export type AlertSeverity = "critical" | "warning" | "resolved";

export type Alert = {
    id: string;
    projectId: string;
    projectName: string;
    projectCode: string;
    severity: AlertSeverity;
    title: string;
    delay?: string;
    createdAt: string;
    resolvedAt?: string;
    entityType?: string;
    entityId?: string;
};

const STORAGE_KEY = "edc_alerts";
const CHANGE_EVENT = "edc-alerts-changed";

const SEED: Omit<Alert, "id">[] = [
    { projectId: "PRJ-2008-001", projectName: "Lom Pangar", projectCode: "PRJ-2008-001", severity: "critical", title: "Assurance TRC manquante", delay: "Retard 7j", createdAt: new Date().toISOString() },
    { projectId: "PRJ-2008-001", projectName: "Lom Pangar", projectCode: "MRC-2024-001", severity: "critical", title: "PAQ non reçu", delay: "Retard 3j", createdAt: new Date().toISOString() },
    { projectId: "PRJ-2008-001", projectName: "Lom Pangar", projectCode: "MRC-2024-002", severity: "critical", title: "Garantie de bonne exécution expirée", delay: "Retard 1j", createdAt: new Date().toISOString() },
    { projectId: "PRJ-2008-001", projectName: "Lom Pangar", projectCode: "PRJ-2008-001", severity: "warning", title: "PGES attendu dans 2 jours", createdAt: new Date().toISOString() },
    { projectId: "PRJ-2008-001", projectName: "Lom Pangar", projectCode: "PRJ-2008-001", severity: "warning", title: "Rapport mensuel non validé", createdAt: new Date().toISOString() },
    { projectId: "PRJ-2008-001", projectName: "Lom Pangar", projectCode: "MRC-2024-003", severity: "warning", title: "Avance de démarrage non justifiée", createdAt: new Date().toISOString() },
    { projectId: "PRJ-2008-001", projectName: "Lom Pangar", projectCode: "PRJ-2008-001", severity: "resolved", title: "Garantie avance reçue", createdAt: new Date().toISOString(), resolvedAt: new Date(Date.now() - 86400000 * 15).toISOString() },
    { projectId: "PRJ-2008-001", projectName: "Lom Pangar", projectCode: "PRJ-2008-001", severity: "resolved", title: "Planning zéro reçu", createdAt: new Date().toISOString(), resolvedAt: new Date(Date.now() - 86400000 * 25).toISOString() },
];

function parseAlerts(): Alert[] {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            const seeded = SEED.map((a, i) => ({ ...a, id: `ALT-${Date.now()}-${i}` }));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
            return seeded;
        }
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

function saveAlerts(alerts: Alert[]): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
        window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
    } catch {
        console.error("Failed to save alerts");
    }
}

export function getAlerts(): Alert[] {
    return parseAlerts();
}

export function getCriticalAlerts(): Alert[] {
    return parseAlerts().filter((a) => a.severity === "critical");
}

export function getWarningAlerts(): Alert[] {
    return parseAlerts().filter((a) => a.severity === "warning");
}

export function getResolvedAlerts(): Alert[] {
    return parseAlerts().filter((a) => a.severity === "resolved");
}

export function getUnresolvedAlerts(): Alert[] {
    return parseAlerts().filter((a) => a.severity === "critical" || a.severity === "warning");
}

export function getUnresolvedCount(): number {
    return getUnresolvedAlerts().length;
}

export function getUnresolvedCountForProject(projectId: string): number {
    const id = projectId.toLowerCase();
    return getUnresolvedAlerts().filter((a) => a.projectId.toLowerCase() === id).length;
}

export function markAlertResolved(alertId: string): void {
    const alerts = parseAlerts();
    const idx = alerts.findIndex((a) => a.id === alertId);
    if (idx >= 0) {
        alerts[idx] = { ...alerts[idx], severity: "resolved" as const, resolvedAt: new Date().toISOString() };
        saveAlerts(alerts);
    }
}

export function addAlert(alert: Omit<Alert, "id" | "createdAt">): Alert {
    const newAlert: Alert = {
        ...alert,
        id: `ALT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
    };
    const alerts = parseAlerts();
    alerts.push(newAlert);
    saveAlerts(alerts);
    return newAlert;
}

/** S'abonner aux changements du store (pour re-render Sidebar, etc.) */
export function subscribeToAlerts(callback: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    const handler = () => callback();
    window.addEventListener(CHANGE_EVENT, handler);
    return () => window.removeEventListener(CHANGE_EVENT, handler);
}
