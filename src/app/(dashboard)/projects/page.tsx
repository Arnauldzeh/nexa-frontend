"use client";

import { useEffect, useState } from "react";
import { FolderOpen, ChevronRight, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { getProjects, ProjectData } from "@/lib/projectStore";
import { getUnresolvedCountForProject, subscribeToAlerts } from "@/lib/alertStore";

// ══════════════════════════════════════
// PAGE
// ══════════════════════════════════════

export default function ProjectsPage() {
    const [projects, setProjects] = useState<ProjectData[]>([]);

    useEffect(() => {
        setProjects(getProjects());
        const unsubscribe = subscribeToAlerts(() => setProjects(getProjects()));
        return unsubscribe;
    }, []);

    const getBarColor = (pct: number) =>
        pct >= 80 ? "bg-green-500" : pct >= 40 ? "bg-blue-500" : pct > 0 ? "bg-amber-500" : "bg-[var(--bg-surface-active)]";

    return (
        <div className="px-[var(--page-px)] py-[var(--page-py)] min-h-full">
            {/* ── Header ── */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2.5 tracking-tight">
                        <FolderOpen size={20} strokeWidth={1.8} className="text-[var(--text-tertiary)]" />
                        Projets
                    </h1>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
                        Configuration et structure des projets d&apos;infrastructure
                    </p>
                </div>
                <Link
                    href="/projects/new"
                    className="flex items-center gap-1.5 bg-[var(--text-primary)] text-[var(--text-inverted)] px-4 py-2 rounded-[var(--radius-md)] text-[13px] font-semibold hover:opacity-90 transition-opacity shadow-[var(--shadow-sm)]"
                >
                    <Plus size={14} /> Nouveau projet
                </Link>
            </div>

            {/* ── Project List ── */}
            <div className="flex flex-col gap-3">
                {projects.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                        <div className="group flex items-center bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)] overflow-hidden hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)] transition-all duration-200 cursor-pointer">
                            {/* Accent stripe */}
                            <div className="w-1 self-stretch flex-shrink-0 bg-blue-500" />

                            <div className="flex flex-1 items-center px-5 py-4 gap-6">
                                {/* Project Info */}
                                <div className="flex-1 min-w-[180px]">
                                    <h3 className="text-[14px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                                        {project.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 text-[12px] text-[var(--text-secondary)]">
                                        <span className="px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--bg-inset)] text-[var(--text-secondary)] text-[10px] font-semibold">
                                            {project.region}
                                        </span>
                                        <span className="text-[var(--text-tertiary)]">·</span>
                                        <span>{project.budget}</span>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="w-40 flex flex-col gap-1.5">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-[var(--text-tertiary)] font-medium">Avancement</span>
                                        <span className="text-[var(--text-primary)] font-bold">{project.progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-[var(--bg-inset)] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${getBarColor(project.progress)}`}
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Alerts */}
                                {getUnresolvedCountForProject(project.id) > 0 && (
                                    <span className="flex items-center gap-1 text-[12px] font-semibold text-red-500">
                                        <AlertCircle size={14} /> {getUnresolvedCountForProject(project.id)}
                                    </span>
                                )}

                                {/* Arrow */}
                                <ChevronRight size={16} className="text-[var(--text-tertiary)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
