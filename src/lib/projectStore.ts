// ══════════════════════════════════════
// FRONTEND-ONLY PROJECT STORE (localStorage)
// ══════════════════════════════════════

export type ProjectData = {
    id: string;
    name: string;
    code: string;
    description: string;
    region: string;
    departement: string;
    ville: string;
    budget: string;
    capacite: string;
    dateDebut: string;
    dateFin: string;
    financement: string[];
    bailleur: string;
    progress: number;
    alerts: number;
    components: ComponentData[];
    createdAt: string;
};

export type ComponentData = {
    id: string;
    name: string;
    sousComposants: SousComposantData[];
};

export type SousComposantData = {
    id: string;
    name: string;
    activities: string[];
};

const STORAGE_KEY = "edc_projects";

// Projet par défaut (unique) : Lom Pangar
const DEFAULT_PROJECTS: ProjectData[] = [
    {
        id: "PRJ-2008-001",
        name: "Lom Pangar",
        code: "PRJ-2008-001",
        description: "Configuration du projet • Infrastructure Hydroélectrique",
        region: "Région de l'Est",
        departement: "Lom-et-Djérem",
        ville: "Bélabo",
        budget: "420 Mrd FCFA",
        capacite: "30 MW",
        dateDebut: "2008-01-01",
        dateFin: "2025-12-31",
        financement: ["Bailleur"],
        bailleur: "Banque Mondiale",
        progress: 72,
        alerts: 2,
        components: [
            {
                id: "barrage", name: "Barrage", sousComposants: [
                    { id: "fond", name: "Fondations", activities: ["Fouilles", "Béton de propreté"] },
                    { id: "corps", name: "Corps barrage", activities: ["Montage des murs", "Passage graviers", "Fondations profondes", "Toiture & finitions"] },
                    { id: "evac", name: "Évacuateur de crues", activities: ["Terrassement"] },
                    { id: "prise", name: "Ouvrage de prise", activities: ["Installation conduites"] },
                ]
            },
            { id: "usine", name: "Usine", sousComposants: [{ id: "turb", name: "Turbines", activities: ["Montage", "Tests"] }] },
            { id: "route", name: "Route d'accès", sousComposants: [{ id: "trc", name: "Tronçon principal", activities: ["Terrassement", "Revêtement"] }] },
            { id: "cite", name: "Cité", sousComposants: [{ id: "log", name: "Logements", activities: ["Construction", "Aménagement"] }, { id: "vrd", name: "VRD", activities: ["Voirie", "Réseaux"] }] },
        ],
        createdAt: "2008-01-15",
    },
];

export function getProjects(): ProjectData[] {
    if (typeof window === "undefined") return DEFAULT_PROJECTS;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return DEFAULT_PROJECTS;
        const custom: ProjectData[] = JSON.parse(stored);
        return [...DEFAULT_PROJECTS, ...custom];
    } catch {
        return DEFAULT_PROJECTS;
    }
}

export function addProject(project: ProjectData): void {
    if (typeof window === "undefined") return;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const existing: ProjectData[] = stored ? JSON.parse(stored) : [];
        existing.push(project);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch {
        console.error("Failed to save project");
    }
}

export function generateProjectCode(): string {
    const year = new Date().getFullYear();
    const rand = String(Math.floor(Math.random() * 900) + 100);
    return `PRJ-${year}-${rand}`;
}

export function getProjectById(id: string): ProjectData | undefined {
    return getProjects().find(p => p.id.toLowerCase() === id.toLowerCase());
}
