"use client";

/* eslint-disable react-hooks/static-components -- sous-composants locaux (LivrablesTable, modales) hérités de la page */
import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getProjectById } from "@/lib/projectStore";
import {
    ChevronLeft, FileText, Eye,
    ChevronRight, AlertCircle, CheckCircle2, Clock, XCircle,
    Calendar, DollarSign, Activity, FolderOpen
} from "lucide-react";
import { getTrackedDocumentsLatest } from "@/lib/documentTrackingStore";
import { getUnresolvedCountForProject } from "@/lib/alertStore";
import { EMPTY_ETUDE_DOCS, EMPTY_EXECUTION_DOCS, EMPTY_PASSATION_DOCS, isLomPangar } from "@/lib/gedTemplates";

// ══════════════════════════════════════
// TYPES
// ══════════════════════════════════════
type FileStatus = "valide" | "encours" | "manquant";
type FileData = { name: string; size: string; type: "pdf" | "dwg" | "zip" | "xls" | "doc"; status?: FileStatus; lastModif?: string; lastModifBy?: string };
type DocStatus = "valide" | "encours" | "manquant";
type DocData = { name: string; desc: string; type: "pdf" | "xls" | "doc" | "plan"; date: string; status: DocStatus; files: FileData[]; lastModif?: string; lastModifBy?: string };
type ActivityData = { name: string; budget: string; delai: string; status: "done" | "exec" | "idle"; pct: number; sousActivites: { name: string; desc: string }[] };
type SousComposant = { id: string; name: string; activities: ActivityData[] };
type Composant = { id: string; name: string; status: "ok" | "progress"; desc: string; sousComposants: SousComposant[] };

function PhaseProgressRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-[var(--text-tertiary)] w-[68px] uppercase">{label}</span>
            <div className="flex-1 h-1.5 bg-[var(--bg-inset)] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${value >= 80 ? "bg-green-500" : value >= 40 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${value}%` }} />
            </div>
            <span className="text-[11px] font-bold text-[var(--text-primary)] w-10 text-right">{value}%</span>
        </div>
    );
}

function PhaseProgressBlock({ title, etude, passation, execution, global }: { title: string; etude: number; passation: number; execution: number; global: number }) {
    return (
        <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-[var(--shadow-sm)] p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-[var(--text-primary)]">{title}</h3>
                <span className="text-sm font-bold text-[var(--text-primary)]">{global}%</span>
            </div>
            <div className="space-y-2.5">
                <PhaseProgressRow label="Étude" value={etude} />
                <PhaseProgressRow label="Passation" value={passation} />
                <PhaseProgressRow label="Exécution" value={execution} />
            </div>
        </div>
    );
}

// ══════════════════════════════════════
// DATA
// ══════════════════════════════════════
const ETUDE_DOCS: DocData[] = [
    {
        name: "Avant-Projet Sommaire (APS)", desc: "3 fichiers", type: "pdf", date: "12/01/24", status: "valide", files: [
            { name: "Rapport_General_v2.pdf", size: "12.4 MB", type: "pdf", status: "valide", lastModif: "12 Jan 2024", lastModifBy: "Ibrahim M." },
            { name: "Plans_Architecturaux.dwg", size: "45.2 MB", type: "dwg", status: "valide", lastModif: "10 Jan 2024", lastModifBy: "Topo Services" },
            { name: "Annexes_Etude_Impact.zip", size: "108 MB", type: "zip", status: "encours", lastModif: "11 Jan 2024", lastModifBy: "Amadou K." },
        ], lastModif: "12 Jan 2024", lastModifBy: "Ibrahim M."
    },
    { name: "Avant-Projet Détaillé (APD)", desc: "V.2.0 • PDF", type: "pdf", date: "20 Jan 2024", status: "encours", files: [], lastModif: "18 Jan 2024", lastModifBy: "Amadou K." },
    { name: "Budget Prévisionnel", desc: "V.2.1 • Excel", type: "xls", date: "25 Jan 2024", status: "encours", files: [], lastModif: "22 Jan 2024", lastModifBy: "EDC Finance" },
    { name: "Étude de faisabilité", desc: "En attente de dépôt", type: "pdf", date: "01 Fév 2024", status: "manquant", files: [] },
    { name: "Pièces graphiques", desc: "Plans et schémas techniques", type: "plan", date: "15 Fév 2024", status: "encours", files: [], lastModif: "10 Fév 2024", lastModifBy: "Topo Services" },
];

const PASSATION_DOCS: DocData[] = [
    { name: "DAO", desc: "Dossier d'appel d'offres", type: "pdf", date: "10 Mar 2024", status: "valide", files: [], lastModif: "08 Mar 2024", lastModifBy: "Cellule Passation" },
    { name: "Avis d'appel d'offres", desc: "Publication officielle", type: "doc", date: "15 Mar 2024", status: "encours", files: [], lastModif: "12 Mar 2024", lastModifBy: "Communication" },
    { name: "Offres soumissionnaires", desc: "Plis reçus", type: "pdf", date: "30 Avr 2024", status: "encours", files: [] },
    { name: "PV ouverture des plis", desc: "Procès-verbal CPM", type: "pdf", date: "05 Mai 2024", status: "manquant", files: [] },
    { name: "PV proposition d'attribution", desc: "Recommandation CPM", type: "pdf", date: "10 Mai 2024", status: "manquant", files: [] },
    { name: "ANO DAO", desc: "No-objection bailleur", type: "pdf", date: "20 Mai 2024", status: "manquant", files: [] },
    { name: "Décision d'attribution", desc: "Notification officielle", type: "pdf", date: "01 Jun 2024", status: "manquant", files: [] },
    { name: "Contrat signé", desc: "Marché final", type: "pdf", date: "15 Jun 2024", status: "manquant", files: [] },
];

const EXECUTION_DOCS: DocData[] = [
    {
        name: "Contrats / Notifications", desc: "4 sous-dossiers", type: "pdf", date: "—", status: "manquant", files: [
            { name: "Projet de contrat", size: "—", type: "pdf" }, { name: "Contrat de base", size: "—", type: "pdf" }, { name: "Notification contrat", size: "—", type: "pdf" }, { name: "Avenant 1", size: "—", type: "pdf" },
        ]
    },
    {
        name: "Ordre de Service", desc: "1 sous-dossier", type: "pdf", date: "—", status: "manquant", files: [
            { name: "OS de démarrage", size: "—", type: "pdf" },
        ]
    },
    {
        name: "PV / Exécution", desc: "5 sous-dossiers", type: "pdf", date: "—", status: "manquant", files: [
            { name: "PV mise à disposition de sites", size: "—", type: "pdf" }, { name: "PV réception technique", size: "—", type: "pdf" }, { name: "PV réception provisoire", size: "—", type: "pdf" }, { name: "PV réception définitive", size: "—", type: "pdf" }, { name: "PV réception usine", size: "—", type: "pdf" },
        ]
    },
    {
        name: "Garanties", desc: "2 sous-dossiers", type: "pdf", date: "—", status: "manquant", files: [
            { name: "Garantie d'avance démarrage", size: "—", type: "pdf" }, { name: "Garantie de bonne exécution", size: "—", type: "pdf" },
        ]
    },
    {
        name: "Plans et documents techniques", desc: "6 sous-dossiers", type: "plan", date: "—", status: "manquant", files: [
            { name: "Plan d'exécution", size: "—", type: "pdf" }, { name: "PGES", size: "—", type: "pdf" }, { name: "PAQ", size: "—", type: "pdf" }, { name: "Planning", size: "—", type: "xls" }, { name: "Plan d'action", size: "—", type: "pdf" }, { name: "Dossier d'exécution", size: "—", type: "pdf" },
        ]
    },
    {
        name: "Assurances", desc: "3 sous-dossiers", type: "pdf", date: "—", status: "manquant", files: [
            { name: "Assurance TRC", size: "—", type: "pdf" }, { name: "Assurance RC", size: "—", type: "pdf" }, { name: "Assurance décennale", size: "—", type: "pdf" },
        ]
    },
    {
        name: "Décomptes / Factures", desc: "3 sous-dossiers", type: "xls", date: "—", status: "manquant", files: [
            { name: "Facture d'avance démarrage", size: "—", type: "xls" }, { name: "Décompte final", size: "—", type: "xls" }, { name: "Décompte général / définitif", size: "—", type: "xls" },
        ]
    },
    {
        name: "Rapports MOE", desc: "2 sous-dossiers", type: "pdf", date: "—", status: "manquant", files: [
            { name: "Rapports MOE", size: "—", type: "pdf" }, { name: "Rapports CPM", size: "—", type: "pdf" },
        ]
    },
    {
        name: "Correspondances", desc: "5 sous-dossiers", type: "doc", date: "—", status: "manquant", files: [
            { name: "Courriers émis", size: "—", type: "doc" }, { name: "Courriers reçus", size: "—", type: "doc" }, { name: "Notes / Mémo émis", size: "—", type: "doc" }, { name: "Notes / Mémo reçus", size: "—", type: "doc" }, { name: "Compte rendu séance de travail", size: "—", type: "doc" },
        ]
    },
    {
        name: "Missions", desc: "3 sous-dossiers", type: "pdf", date: "—", status: "manquant", files: [
            { name: "Missions", size: "—", type: "pdf" }, { name: "Missions MOA", size: "—", type: "pdf" }, { name: "Livrables", size: "—", type: "pdf" },
        ]
    },
    {
        name: "Résiliation", desc: "4 sous-dossiers", type: "pdf", date: "—", status: "manquant", files: [
            { name: "Décision résiliation", size: "—", type: "pdf" }, { name: "Constat défaillance", size: "—", type: "pdf" }, { name: "Résiliation", size: "—", type: "pdf" }, { name: "Recettes / pénalités", size: "—", type: "xls" },
        ]
    },
    { name: "Autres", desc: "Dossier libre", type: "pdf", date: "—", status: "manquant", files: [] },
];

const DEFAULT_PROJECT = {
    id: "PRJ-2008-001", name: "Lom Pangar", budget: "420 Mrd FCFA", progress: 72, alerts: 2, description: "Infrastructure Hydroélectrique",
    components: [
        {
            id: "barrage", name: "Barrage", status: "progress" as const, desc: "Infrastructure principale", sousComposants: [
                {
                    id: "fond", name: "Fondations", activities: [
                        { name: "Fouilles", budget: "2.5 Mrd FCFA", delai: "Jan 2024 → Mar 2024", status: "done" as const, pct: 100, sousActivites: [{ name: "Achat matériel excavation", desc: "Facture #F-2024-001" }, { name: "Main d'œuvre terrassement", desc: "15 ouvriers" }] },
                        { name: "Béton de propreté", budget: "800 M FCFA", delai: "Avr 2024 → Jun 2024", status: "exec" as const, pct: 80, sousActivites: [{ name: "Livraison béton", desc: "Fournisseur CIMENCAM" }] },
                    ]
                },
                {
                    id: "corps", name: "Corps barrage", activities: [
                        { name: "Montage des murs", budget: "12 Mrd FCFA", delai: "Mar 2024 → Dec 2024", status: "exec" as const, pct: 60, sousActivites: [] },
                        { name: "Passage graviers", budget: "3 Mrd FCFA", delai: "Jun 2024 → Sep 2024", status: "exec" as const, pct: 30, sousActivites: [] },
                        { name: "Fondations profondes", budget: "8 Mrd FCFA", delai: "Jan 2024 → Avr 2024", status: "done" as const, pct: 100, sousActivites: [] },
                        { name: "Toiture & finitions", budget: "5 Mrd FCFA", delai: "Jan 2025 → Jun 2025", status: "idle" as const, pct: 0, sousActivites: [] },
                    ]
                },
                { id: "evac", name: "Évacuateur de crues", activities: [{ name: "Terrassement", budget: "4 Mrd FCFA", delai: "Fév 2024 → Aoû 2024", status: "exec" as const, pct: 45, sousActivites: [] }] },
                { id: "prise", name: "Ouvrage de prise", activities: [{ name: "Coffrage", budget: "2 Mrd FCFA", delai: "Mai 2024 → Oct 2024", status: "exec" as const, pct: 10, sousActivites: [] }] },
            ]
        },
        {
            id: "usine", name: "Usine", status: "progress" as const, desc: "Production électrique", sousComposants: [
                { id: "turb", name: "Turbines", activities: [{ name: "Montage turbine Francis", budget: "25 Mrd FCFA", delai: "Jun 2024 → Jun 2025", status: "exec" as const, pct: 15, sousActivites: [] }] },
                { id: "gen", name: "Générateurs", activities: [{ name: "Installation alternateurs", budget: "18 Mrd FCFA", delai: "2025", status: "idle" as const, pct: 0, sousActivites: [] }] },
                { id: "ctrl", name: "Contrôle-commande", activities: [{ name: "Système SCADA", budget: "6 Mrd FCFA", delai: "2025", status: "idle" as const, pct: 0, sousActivites: [] }] },
            ]
        },
        {
            id: "route", name: "Route d'accès", status: "progress" as const, desc: "Voirie & accès chantier", sousComposants: [
                { id: "terr", name: "Terrassement", activities: [{ name: "Déblais", budget: "1.5 Mrd FCFA", delai: "Jan 2024 → Mai 2024", status: "exec" as const, pct: 70, sousActivites: [] }] },
                { id: "chau", name: "Chaussée", activities: [{ name: "Enrobé", budget: "3 Mrd FCFA", delai: "Jun 2024 → Dec 2024", status: "idle" as const, pct: 0, sousActivites: [] }] },
            ]
        },
        {
            id: "cite", name: "Cité", status: "ok" as const, desc: "Logements & services", sousComposants: [
                {
                    id: "log", name: "Logements", activities: [
                        { name: "Construction", budget: "10 Mrd FCFA", delai: "2023 → 2024", status: "done" as const, pct: 100, sousActivites: [] },
                        { name: "Aménagement", budget: "2 Mrd FCFA", delai: "2024", status: "exec" as const, pct: 90, sousActivites: [] },
                    ]
                },
                {
                    id: "vrd", name: "VRD", activities: [
                        { name: "Voirie", budget: "4 Mrd FCFA", delai: "2023 → 2024", status: "done" as const, pct: 100, sousActivites: [] },
                        { name: "Réseaux", budget: "3 Mrd FCFA", delai: "2024", status: "exec" as const, pct: 85, sousActivites: [] },
                    ]
                },
            ]
        },
    ] as Composant[],
};

function buildSuiviProject(id: string): typeof DEFAULT_PROJECT {
    const stored = getProjectById(id);
    if (!stored) return DEFAULT_PROJECT;
    if (stored.id === "PRJ-2008-001") return DEFAULT_PROJECT;
    return {
        id: stored.id, name: stored.name, budget: stored.budget, progress: stored.progress,
        alerts: stored.alerts || 0, description: stored.description || "Projet d'infrastructure",
        components: stored.components.map(c => ({
            id: c.id, name: c.name, status: "progress" as const, desc: c.name,
            sousComposants: c.sousComposants.map(sc => ({
                id: sc.id, name: sc.name,
                activities: sc.activities.map(a => ({ name: a, pct: 0, budget: "—", delai: "—", status: "idle" as const, sousActivites: [] })),
            })),
        })) as Composant[],
    };
}

// ══════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════
export default function SuiviProjetPage() {
    const params = useParams();
    const projectId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
    const PROJECT = useMemo(() => buildSuiviProject(projectId), [projectId]);

    // Dossiers affichés dans le Suivi :
    // - Lom Pangar garde les démos
    // - Nouveaux projets : structure uniquement (aucun fichier par défaut)
    const ETUDE_DOCS_ACTIVE = isLomPangar(PROJECT.id) ? ETUDE_DOCS : (EMPTY_ETUDE_DOCS as unknown as DocData[]);
    const PASSATION_DOCS_ACTIVE = isLomPangar(PROJECT.id) ? PASSATION_DOCS : (EMPTY_PASSATION_DOCS as unknown as DocData[]);
    const EXECUTION_DOCS_ACTIVE = isLomPangar(PROJECT.id) ? EXECUTION_DOCS : (EMPTY_EXECUTION_DOCS as unknown as DocData[]);

    const [currentComp, setCurrentComp] = useState<string | null>(null);
    const [currentSComp, setCurrentSComp] = useState<string | null>(null);
    const [currentPhase, setCurrentPhase] = useState<"etude" | "passation" | "execution">("etude");
    const [selectedActivity, setSelectedActivity] = useState<ActivityData | null>(null);
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    const [showValidateModal, setShowValidateModal] = useState<string | null>(null);

    const comp = PROJECT.components.find((c) => c.id === currentComp);
    const sc = comp?.sousComposants.find((s) => s.id === currentSComp);

    const getDocsPhasePct = useCallback((docs: DocData[], phase: "etude" | "passation" | "execution") => {
        if (docs.length === 0) return 0;
        const folderPct = docs.map((doc) => {
            const tracked = getTrackedDocumentsLatest(PROJECT.id, phase, doc.name);
            const files = doc.files || [];
            const trackedNames = new Set(tracked.map((t) => t.fileName));
            const hardcodedFiles = files.filter((f) => !trackedNames.has(f.name));
            const total = hardcodedFiles.length + tracked.length;
            const approved = hardcodedFiles.filter((f) => f.status === "valide").length + tracked.filter((t) => t.steps.approuve).length;
            return total > 0 ? Math.round((approved / total) * 100) : 0;
        });
        return Math.round(folderPct.reduce((a, b) => a + b, 0) / folderPct.length);
    }, [PROJECT.id]);

    const getExecutionPctForSousComp = useCallback((sous: SousComposant) => {
        if (sous.activities.length === 0) return 0;
        return Math.round(sous.activities.reduce((a, act) => a + act.pct, 0) / sous.activities.length);
    }, []);
    const getExecutionPctForComp = useCallback((component: Composant) => {
        if (component.sousComposants.length === 0) return 0;
        return Math.round(component.sousComposants.reduce((a, sous) => a + getExecutionPctForSousComp(sous), 0) / component.sousComposants.length);
    }, [getExecutionPctForSousComp]);
    const getExecutionPctForProject = useCallback(() => {
        if (PROJECT.components.length === 0) return 0;
        return Math.round(PROJECT.components.reduce((a, c) => a + getExecutionPctForComp(c), 0) / PROJECT.components.length);
    }, [PROJECT.components, getExecutionPctForComp]);

    const phaseEtudePct = getDocsPhasePct(ETUDE_DOCS_ACTIVE, "etude");
    const phasePassationPct = getDocsPhasePct(PASSATION_DOCS_ACTIVE, "passation");
    const phaseExecutionProjectPct = getExecutionPctForProject();
    const phaseExecutionCompPct = comp ? getExecutionPctForComp(comp) : phaseExecutionProjectPct;
    const phaseExecutionSousCompPct = sc ? getExecutionPctForSousComp(sc) : phaseExecutionCompPct;

    const projectGlobalPct = Math.round((phaseEtudePct + phasePassationPct + phaseExecutionProjectPct) / 3);
    const compGlobalPct = Math.round((phaseEtudePct + phasePassationPct + phaseExecutionCompPct) / 3);
    const sousCompGlobalPct = Math.round((phaseEtudePct + phasePassationPct + phaseExecutionSousCompPct) / 3);

    const handleSelectComp = useCallback((id: string) => { setCurrentComp(id); setCurrentSComp(null); setCurrentPhase("etude"); setSelectedActivity(null); setExpandedRows([]); }, []);
    const handleGoBack = useCallback(() => { setCurrentComp(null); setCurrentSComp(null); setCurrentPhase("etude"); setSelectedActivity(null); setExpandedRows([]); }, []);
    const handleSelectSComp = useCallback((id: string) => { setCurrentSComp(id); setCurrentPhase("etude"); setSelectedActivity(null); setExpandedRows([]); }, []);
    const handleSelectActivity = useCallback((act: ActivityData) => { setSelectedActivity(act); }, []);
    const toggleRow = useCallback((index: number) => { setExpandedRows((prev) => prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]); }, []);

    const getDocIcon = (type: string) => {
        const styles: Record<string, string> = { pdf: "bg-red-500/10 text-red-500", xls: "bg-green-500/10 text-green-600", doc: "bg-blue-500/10 text-blue-500", plan: "bg-purple-500/10 text-purple-500" };
        return <div className={`w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0 ${styles[type] || "bg-[var(--bg-inset)] text-[var(--text-tertiary)]"}`}><FolderOpen size={16} /></div>;
    };

    const FileTrackingTable = ({ files, folderName, phase }: { files: FileData[]; folderName: string; phase: string }) => {
        const trackedFromStore = getTrackedDocumentsLatest(PROJECT.id, phase, folderName);
        const trackedNames = new Set(trackedFromStore.map((d) => d.fileName));
        const hardcodedFiles = files.filter((f) => !trackedNames.has(f.name));

        type DocEntry = { id: string; fileName: string; fileStatus: "approuve" | "rejete" | "en_revue" | "depose" | "attente" };
        const allEntries: DocEntry[] = [
            ...hardcodedFiles.map((f, i) => ({
                id: `hc-${folderName}-${i}`,
                fileName: f.name,
                fileStatus: (f.status === "valide" ? "approuve" : "attente") as DocEntry["fileStatus"],
            })),
            ...trackedFromStore.map((d) => ({
                id: d.id,
                fileName: d.fileName,
                fileStatus: (d.steps.approuve
                    ? "approuve"
                    : d.steps.rejete
                      ? "rejete"
                      : d.steps.enRevue
                        ? "en_revue"
                        : "depose") as DocEntry["fileStatus"],
            })),
        ];

        const getFileStatusBadge = (status: DocEntry["fileStatus"]) => {
            const config = {
                approuve: { label: "Approuvé", style: "bg-green-500/10 text-green-600 border-green-500/20", icon: <CheckCircle2 size={10} /> },
                rejete: { label: "Rejeté", style: "bg-red-500/10 text-red-600 border-red-500/20", icon: <XCircle size={10} /> },
                en_revue: { label: "En revue", style: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: <Eye size={10} /> },
                depose: { label: "Déposé", style: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20", icon: <FileText size={10} /> },
                attente: { label: "En attente", style: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: <Clock size={10} /> },
            };
            const c = config[status];
            return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${c.style}`}>{c.icon}{c.label}</span>;
        };

        if (allEntries.length === 0) {
            return (
                <div className="bg-[var(--bg-inset)] px-5 py-4 border-b border-[var(--border-subtle)]">
                    <p className="text-[11px] text-[var(--text-tertiary)] italic text-center">Aucun document déposé dans ce dossier.</p>
                </div>
            );
        }

        return (
            <div className="bg-[var(--bg-inset)] border-b border-[var(--border-subtle)]">
                <div className="px-5 pt-4 pb-2">
                    <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                        <Activity size={12} className="text-[var(--accent)]" />
                        Fichiers déposés ({allEntries.length})
                    </h4>
                </div>
                <div className="px-5 pb-4 space-y-1.5">
                    {allEntries.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                            <div className="flex items-center gap-2 min-w-0">
                                <FileText size={13} className="text-[var(--text-tertiary)] flex-shrink-0" />
                                <span className="text-[11px] font-medium text-[var(--text-primary)] truncate max-w-[250px]" title={doc.fileName}>{doc.fileName}</span>
                            </div>
                            {getFileStatusBadge(doc.fileStatus)}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // ── LIVRABLES TABLE (Monitoring — No Actions) ──
    const LivrablesTable = ({ docs, contextTitle, phase }: { docs: DocData[]; contextTitle: string; phase: string }) => {
        const getFolderProgress = (doc: DocData, tracked: ReturnType<typeof getTrackedDocumentsLatest>) => {
            const files = doc.files || [];
            const trackedNames = new Set(tracked.map((t) => t.fileName));
            const hardcodedFiles = files.filter((f) => !trackedNames.has(f.name));
            const total = hardcodedFiles.length + tracked.length;
            const approved = hardcodedFiles.filter((f) => f.status === "valide").length + tracked.filter((t) => t.steps.approuve).length;
            const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
            return { total, approved, pct };
        };

        /** Progression globale = moyenne des pourcentages de chaque dossier (ex. Barrage, Étude globale) */
        const globalPct = docs.length > 0
            ? Math.round(docs.reduce((acc, d) => acc + getFolderProgress(d, getTrackedDocumentsLatest(PROJECT.id, phase, d.name)).pct, 0) / docs.length)
            : 0;
        const barColor = globalPct >= 80 ? "bg-green-500" : globalPct >= 40 ? "bg-blue-500" : "bg-amber-500";

        const getFolderStatusBadge = (doc: DocData, tracked: ReturnType<typeof getTrackedDocumentsLatest>) => {
            const files = doc.files || [];
            const hasMock = files.length > 0;
            const hasTracked = tracked.length > 0;
            if (!hasMock && !hasTracked) {
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-[var(--bg-inset)] text-[var(--text-tertiary)] border-[var(--border-default)]"><AlertCircle size={10} /> Vide</span>;
            }
            const mockAllValid = !hasMock || files.every((f) => f.status === "valide");
            const trackedAllApproved = !hasTracked || tracked.every((d) => d.steps.approuve);
            if (mockAllValid && trackedAllApproved) {
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 size={10} /> Terminé</span>;
            }
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-500/10 text-blue-600 border-blue-500/20"><Clock size={10} /> En cours</span>;
        };

        return (
            <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] overflow-hidden shadow-[var(--shadow-sm)]">
                <div className="p-5 border-b border-[var(--border-subtle)] flex justify-between items-center">
                    <div className="flex items-center gap-4"><h3 className="text-sm font-semibold text-[var(--text-primary)]">Livrables <span className="font-normal text-[var(--text-tertiary)] ml-1">({contextTitle})</span></h3><div className="flex items-center gap-3"><div className="w-32 h-1.5 bg-[var(--bg-inset)] rounded-full overflow-hidden"><div className={`h-full rounded-full ${barColor}`} style={{ width: `${globalPct}%` }} /></div><span className="text-sm font-bold text-[var(--text-primary)]">{globalPct}%</span></div></div>
                </div>
                {/* Header: Document | Date Limite | Statut */}
                <div className="grid grid-cols-[minmax(0,3fr)_100px_120px] px-5 py-3 bg-[var(--bg-inset)] border-b border-[var(--border-subtle)] text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                    <span>Document</span><span>Date Limite</span><span>Statut</span>
                </div>
                {docs.map((doc, idx) => {
                    const isExpanded = expandedRows.includes(idx);
                    const trackedInFolder = getTrackedDocumentsLatest(PROJECT.id, phase, doc.name);
                    const hasFiles = (doc.files && doc.files.length > 0) || trackedInFolder.length > 0;
                    const progress = getFolderProgress(doc, trackedInFolder);
                    const folderBarColor = progress.pct >= 80 ? "bg-green-500" : progress.pct >= 40 ? "bg-blue-500" : "bg-amber-500";
                    return (
                        <div key={idx} className="group">
                            <div className={`grid grid-cols-[minmax(0,3fr)_100px_120px] px-5 py-4 border-b border-[var(--border-subtle)] items-center transition-colors hover:bg-[var(--bg-surface-hover)] ${hasFiles ? "cursor-pointer" : ""}`} onClick={() => hasFiles && toggleRow(idx)}>
                                <div className="flex items-start gap-3 min-w-0">
                                    {hasFiles && <ChevronRight size={14} className={`mt-2 text-[var(--text-tertiary)] transition-transform duration-200 flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`} />}
                                    {!hasFiles && <div className="w-[14px] flex-shrink-0" />}
                                    {getDocIcon(doc.type)}
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">{doc.name}</div>
                                        <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5 truncate">{hasFiles ? `${(doc.files?.length || 0) + trackedInFolder.length} document${(doc.files?.length || 0) + trackedInFolder.length > 1 ? "s" : ""}` : doc.desc}</div>
                                        {hasFiles && progress.total > 0 && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="flex-1 min-w-0 max-w-[140px] h-1.5 bg-[var(--bg-inset)] rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${folderBarColor} transition-all`} style={{ width: `${progress.pct}%` }} />
                                                </div>
                                                <span className="text-[10px] font-bold text-[var(--text-primary)]">{progress.pct}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-xs font-medium text-[var(--text-secondary)]">{doc.date}</div>
                                <div>{getFolderStatusBadge(doc, trackedInFolder)}</div>
                            </div>
                            {/* ── EXPANDED: File tracking (read-only) ── */}
                            {isExpanded && hasFiles && (
                                <FileTrackingTable files={doc.files || []} folderName={doc.name} phase={phase} />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };



    // ── ACTIVITY DETAIL ──
    const ActivityDetail = ({ activity }: { activity: ActivityData }) => {
        const statusText = activity.status === "done" ? "Terminée" : activity.status === "exec" ? "En cours" : "Non démarrée";
        const statusStyle = activity.status === "done" ? "bg-green-500/10 text-green-600 border-green-500/20" : activity.status === "exec" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-[var(--bg-inset)] text-[var(--text-tertiary)] border-[var(--border-default)]";
        const barColor = activity.pct === 100 ? "bg-green-500" : activity.pct > 0 ? "bg-blue-500" : "";
        return (
            <div>
                <button onClick={() => setSelectedActivity(null)} className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--accent)] mb-4 transition-colors"><ChevronLeft size={14} /> Retour aux livrables</button>
                <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-[var(--shadow-sm)] overflow-hidden">
                    <div className="p-6 border-b border-[var(--border-subtle)]"><div className="flex items-start justify-between"><div><h3 className="text-base font-bold text-[var(--text-primary)]">{activity.name}</h3><span className={`inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyle}`}>{statusText}</span></div><div className="text-right"><div className="text-2xl font-bold text-[var(--text-primary)]">{activity.pct}%</div><div className="w-24 h-1.5 bg-[var(--bg-inset)] rounded-full mt-1 overflow-hidden"><div className={`h-full rounded-full ${barColor}`} style={{ width: `${activity.pct}%` }} /></div></div></div></div>
                    <div className="grid grid-cols-2 divide-x divide-[var(--border-subtle)]"><div className="p-5"><div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2"><DollarSign size={12} /> Budget</div><div className="text-lg font-bold text-[var(--text-primary)]">{activity.budget}</div></div><div className="p-5"><div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2"><Calendar size={12} /> Délai</div><div className="text-sm font-bold text-[var(--text-primary)]">{activity.delai}</div></div></div>
                    {activity.sousActivites.length > 0 && (
                        <div className="border-t border-[var(--border-subtle)] p-5">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3"><Activity size={12} /> Sous-activités</div>
                            <div className="space-y-2">{activity.sousActivites.map((sa, idx) => <div key={idx} className="flex items-center gap-3 p-3 bg-[var(--bg-inset)] rounded-[var(--radius-md)]"><div className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] flex-shrink-0" /><div><div className="text-xs font-semibold text-[var(--text-secondary)]">{sa.name}</div><div className="text-[11px] text-[var(--text-tertiary)]">{sa.desc}</div></div></div>)}</div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ── VALIDATION MODAL ──
    const ValidateModal = () => {
        if (!showValidateModal) return null;
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowValidateModal(null)}>
                <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full max-w-md p-6 border border-[var(--border-default)]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center"><CheckCircle2 size={18} className="text-amber-600" /></div><div><h4 className="text-sm font-bold text-[var(--text-primary)]">Confirmer la validation</h4><p className="text-xs text-[var(--text-secondary)]">Action irréversible</p></div></div>
                    <div className="p-3 bg-amber-500/10 rounded-[var(--radius-md)] border border-amber-500/20 mb-4"><p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed"><strong>⚠️ Attention :</strong> En validant <strong>&quot;{showValidateModal}&quot;</strong>, cette action sera <strong>définitive</strong>. Seul un administrateur pourra la débloquer.</p></div>
                    <div className="flex justify-end gap-2"><button onClick={() => setShowValidateModal(null)} className="px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-[var(--radius-md)] hover:bg-[var(--bg-surface-hover)] transition-colors">Annuler</button><button onClick={() => { alert(`Document "${showValidateModal}" validé et verrouillé.`); setShowValidateModal(null); }} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] transition-colors flex items-center gap-1.5"><CheckCircle2 size={12} /> Valider définitivement</button></div>
                </div>
            </div>
        );
    };

    // ══════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════
    return (
        <div className="flex flex-col h-full">
            <ValidateModal />

            {/* HEADER */}
            <div className="bg-[var(--bg-surface)] border-b border-[var(--border-default)] px-8 pt-5 pb-4 flex-shrink-0">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-[var(--shadow-sm)] flex-shrink-0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg></div>
                        <div><h1 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2.5 tracking-tight">{PROJECT.name}<span className="px-2 py-0.5 rounded-[var(--radius-sm)] text-[10px] bg-[var(--bg-inset)] text-[var(--text-tertiary)] font-bold">{PROJECT.id}</span></h1><div className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">Suivi opérationnel • {PROJECT.description}</div></div>
                    </div>
                    <div className="flex gap-7">
                        <div className="text-right"><div className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Budget</div><div className="text-[15px] font-bold text-[var(--text-primary)] mt-0.5">{PROJECT.budget}</div></div>
                        <div className="text-right"><div className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Avancement</div><div className="text-[15px] font-bold text-[var(--text-primary)] mt-0.5">{projectGlobalPct}%</div><div className="w-16 h-1 bg-[var(--bg-inset)] rounded-full mt-1 overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: `${projectGlobalPct}%` }} /></div></div>
                        <div className="text-right"><div className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Alertes</div><Link href="/alerts" className="flex items-center justify-end gap-1.5 mt-0.5 font-bold text-[15px] text-red-500 hover:underline">{getUnresolvedCountForProject(PROJECT.id)} {getUnresolvedCountForProject(PROJECT.id) > 0 && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}</Link></div>
                    </div>
                </div>
            </div>

            {/* NAV BAR */}
            <div className="flex items-center px-8 bg-[var(--bg-surface)] border-b border-[var(--border-default)] flex-shrink-0">
                {currentComp ? (
                    <button onClick={handleGoBack} className="flex items-center gap-1.5 py-3 pr-4 mr-1 text-[11px] font-bold text-[var(--text-secondary)] border-r border-[var(--border-default)] hover:text-[var(--accent)] transition-colors"><ChevronLeft size={14} /> Étude globale</button>
                ) : (
                    <Link href="/suivi" className="flex items-center gap-1.5 py-3 pr-4 mr-1 text-[11px] font-bold text-[var(--text-secondary)] border-r border-[var(--border-default)] hover:text-[var(--accent)] transition-colors"><ChevronLeft size={14} /> Tableau de suivi</Link>
                )}
                <div className="flex gap-0.5 ml-2 overflow-x-auto">
                    {!currentComp && <button className="py-3 px-4 text-[13px] font-bold border-b-2 border-[var(--text-primary)] text-[var(--text-primary)] whitespace-nowrap">Étude globale</button>}
                    {PROJECT.components.map((c) => (
                        <button key={c.id} onClick={() => handleSelectComp(c.id)} className={`py-3 px-4 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${currentComp === c.id ? "border-[var(--text-primary)] text-[var(--text-primary)] font-bold" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>{c.name}</button>
                    ))}
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-hidden flex">
                {/* LEFT PANEL */}
                {currentComp && comp && (
                    <div className="w-[240px] bg-[var(--bg-surface)] border-r border-[var(--border-default)] overflow-y-auto flex-shrink-0 py-5">
                        <div className="px-5 mb-3 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Sous-composants</div>
                        <div className="mb-1">
                            {comp.sousComposants.map((s) => (
                                <div key={s.id} onClick={() => handleSelectSComp(s.id)} className={`flex items-center gap-3 px-5 py-2 cursor-pointer border-l-[3px] transition-all text-[13px] ${currentSComp === s.id ? "bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent)] font-bold" : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${currentSComp === s.id ? "bg-[var(--accent)]" : "bg-[var(--text-tertiary)]"}`} />{s.name}
                                </div>
                            ))}
                        </div>
                        <div className="h-px bg-[var(--border-subtle)] mx-5 mb-4" />
                        <div className="px-5 mb-2 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">{currentSComp && sc ? `Activités — ${sc.name}` : "Activités"}</div>
                        {currentSComp && sc ? (
                            <div>
                                {sc.activities.map((a, idx) => {
                                    const dotColor = a.pct === 100 ? "bg-green-500" : a.pct > 0 ? "bg-blue-500" : "bg-[var(--text-tertiary)]";
                                    const isSelected = selectedActivity?.name === a.name;
                                    return <div key={idx} onClick={() => handleSelectActivity(a)} className={`flex items-center gap-3 px-5 py-2 cursor-pointer transition-colors text-[13px] ${isSelected ? "text-[var(--accent)] font-semibold bg-[var(--accent-subtle)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"}`}><div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} /><span className="truncate flex-1">{a.name}</span><span className="text-[10px] font-bold text-[var(--text-tertiary)]">{a.pct}%</span></div>;
                                })}
                            </div>
                        ) : <div className="px-5 text-[11px] text-[var(--text-tertiary)] italic">Sélectionnez un sous-composant</div>}
                    </div>
                )}

                {/* MAIN CONTENT */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                        <PhaseProgressBlock title="Projet global" etude={phaseEtudePct} passation={phasePassationPct} execution={phaseExecutionProjectPct} global={projectGlobalPct} />
                        {comp && <PhaseProgressBlock title={`Composant : ${comp.name}`} etude={phaseEtudePct} passation={phasePassationPct} execution={phaseExecutionCompPct} global={compGlobalPct} />}
                        {sc && <PhaseProgressBlock title={`Sous-composant : ${sc.name}`} etude={phaseEtudePct} passation={phasePassationPct} execution={phaseExecutionSousCompPct} global={sousCompGlobalPct} />}
                    </div>
                    {/* Étude Globale */}
                    {!currentComp && (
                        <>
                            <div className="mb-4"><h2 className="text-sm font-semibold text-[var(--text-primary)]">Étude Globale du Projet</h2><p className="text-xs text-[var(--text-secondary)] mt-1">Dossiers fondateurs de l&apos;étude générale</p></div>
                            <LivrablesTable docs={ETUDE_DOCS_ACTIVE} contextTitle="Projet" phase="etude" />
                        </>
                    )}

                    {/* Component/Sub-component view */}
                    {currentComp && !selectedActivity && (
                        <>
                            <div className="flex items-center gap-1 mb-6 bg-[var(--bg-surface)] rounded-[var(--radius-md)] border border-[var(--border-default)] p-1 w-fit shadow-[var(--shadow-sm)]">
                                <button onClick={() => { setCurrentPhase("etude"); setExpandedRows([]); }} className={`px-5 py-2 rounded-[var(--radius-sm)] text-xs font-bold transition-all ${currentPhase === "etude" ? "bg-[var(--text-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-sm)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"}`}>Étude</button>
                                <button onClick={() => { setCurrentPhase("passation"); setExpandedRows([]); }} className={`px-5 py-2 rounded-[var(--radius-sm)] text-xs font-bold transition-all ${currentPhase === "passation" ? "bg-[var(--text-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-sm)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"}`}>Passation</button>
                                <button onClick={() => { setCurrentPhase("execution"); setExpandedRows([]); }} className={`px-5 py-2 rounded-[var(--radius-sm)] text-xs font-bold transition-all ${currentPhase === "execution" ? "bg-[var(--text-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-sm)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"}`}>Exécution</button>
                            </div>
                            {currentPhase === "execution" ? (
                                sc ? (
                                    <div className="space-y-3">
                                        <div className="mb-2">
                                            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Exécution — {sc.name}</h2>
                                            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{sc.activities.length} activité{sc.activities.length !== 1 ? "s" : ""} • Cliquez sur une activité pour voir ses dossiers</p>
                                        </div>
                                        {sc.activities.map((act, aIdx) => {
                                            const isExpanded = expandedRows.includes(aIdx);
                                            const statusText = act.status === "done" ? "Terminée" : act.status === "exec" ? "En cours" : "Non démarrée";
                                            const statusStyle = act.status === "done" ? "bg-green-500/10 text-green-600 border-green-500/20" : act.status === "exec" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-[var(--bg-inset)] text-[var(--text-tertiary)] border-[var(--border-default)]";
                                            const barColor = act.pct === 100 ? "bg-green-500" : act.pct > 0 ? "bg-blue-500" : "bg-[var(--border-default)]";
                                            return (
                                                <div key={aIdx} className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-[var(--shadow-sm)] overflow-hidden">
                                                    {/* Activity header */}
                                                    <div onClick={() => toggleRow(aIdx)} className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors">
                                                        <ChevronRight size={14} className={`text-[var(--text-tertiary)] transition-transform duration-200 flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-[13px] font-semibold text-[var(--text-primary)]">{act.name}</div>
                                                            <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{act.budget} • {act.delai}</div>
                                                        </div>
                                                        <div className="flex items-center gap-3 flex-shrink-0">
                                                            <div className="w-20 h-1.5 bg-[var(--bg-inset)] rounded-full overflow-hidden"><div className={`h-full rounded-full ${barColor}`} style={{ width: `${act.pct}%` }} /></div>
                                                            <span className="text-[11px] font-bold text-[var(--text-primary)] w-8 text-right">{act.pct}%</span>
                                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusStyle}`}>{statusText}</span>
                                                        </div>
                                                    </div>
                                                    {/* Execution docs for this activity */}
                                                    {isExpanded && (
                                                        <div className="border-t border-[var(--border-subtle)]">
                                                            <LivrablesTable docs={EXECUTION_DOCS_ACTIVE} contextTitle={act.name} phase="execution" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <FolderOpen size={40} className="text-[var(--text-tertiary)] mb-3 opacity-50" />
                                        <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Sélectionnez un sous-composant</h3>
                                        <p className="text-[11px] text-[var(--text-tertiary)] mt-1 max-w-xs">Choisissez un sous-composant dans le panneau de gauche pour voir les activités et leurs dossiers d&apos;exécution.</p>
                                    </div>
                                )
                            ) : (
                                <LivrablesTable docs={currentPhase === "etude" ? ETUDE_DOCS_ACTIVE : PASSATION_DOCS_ACTIVE} contextTitle={sc ? sc.name : comp!.name} phase={currentPhase} />
                            )}
                        </>
                    )}

                    {/* Activity Detail */}
                    {currentComp && selectedActivity && <ActivityDetail activity={selectedActivity} />}
                </div>
            </div>
        </div>
    );
}
