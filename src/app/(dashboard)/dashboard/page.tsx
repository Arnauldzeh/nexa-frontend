"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    TrendingUp,
    FileText,
    Plus,
    Upload,
    ArrowRight,
} from "lucide-react";
import { getProjectStats, getProjects, type Project } from "@/lib/projectStore";
import { getUsers, type User } from "@/lib/userStore";
import { getDocuments, type DocumentMetadata } from "@/services/api/documentService";
import { getErrorMessage } from "@/services/api/client";
import { LoadingPage } from "@/components/ui/LoadingSpinner";
import { ErrorPage } from "@/components/ui/ErrorDisplay";
import { usePermissions } from "@/hooks/usePermissions";

interface DashboardStats {
    totalProjects: number;
    avgProgress: number;
    totalUsers: number;
    totalDocuments: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalProjects: 0,
        avgProgress: 0,
        totalUsers: 0,
        totalDocuments: 0,
    });
    const [recentProjects, setRecentProjects] = useState<Project[]>([]);
    const [recentDocuments, setRecentDocuments] = useState<DocumentMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, isAdmin } = usePermissions();

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [projectStats, users, projects, documents] = await Promise.all([
                getProjectStats(),
                getUsers(),
                getProjects(),
                getDocuments({ isTrashed: false }),
            ]);

            setStats({
                totalProjects: projectStats.total,
                avgProgress: Math.round(projectStats.avgProgress),
                totalUsers: users.length,
                totalDocuments: documents.length,
            });

            // Get 5 most recent projects
            const sortedProjects = [...projects].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setRecentProjects(sortedProjects.slice(0, 5));

            // Get 5 most recent documents
            const sortedDocuments = [...documents].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setRecentDocuments(sortedDocuments.slice(0, 5));
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) return <LoadingPage />;
    if (error) return <ErrorPage error={error} retry={fetchDashboardData} />;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tableau de bord</h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Bienvenue {user?.firstName || ""}! Voici un aperçu de vos projets et activités.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/projects?action=new"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <Plus size={16} />
                        Nouveau projet
                    </Link>
                    <Link
                        href="/archives"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--border-default)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-surface-hover)] transition-colors text-sm font-medium"
                    >
                        <Upload size={16} />
                        Ajouter un document
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Projects */}
                <div className="bg-white dark:bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)] p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <FolderKanban className="text-blue-600 dark:text-blue-400" size={20} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalProjects}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Projets</p>
                </div>

                {/* Average Progress */}
                <div className="bg-white dark:bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)] p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <TrendingUp className="text-purple-600 dark:text-purple-400" size={20} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.avgProgress}%</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Progression moyenne</p>
                </div>

                {/* Total Documents */}
                <div className="bg-white dark:bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)] p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                            <FileText className="text-cyan-600 dark:text-cyan-400" size={20} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalDocuments}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Documents</p>
                </div>

                {/* Total Users */}
                <div className="bg-white dark:bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)] p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                            <Users className="text-pink-600 dark:text-pink-400" size={20} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalUsers}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Utilisateurs</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Projects */}
                <div className="bg-white dark:bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Projets récents</h2>
                        <Link
                            href="/projects"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            Voir tout
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentProjects.length === 0 ? (
                            <div className="text-center py-8 text-[var(--text-secondary)]">
                                <FolderKanban size={48} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Aucun projet pour le moment</p>
                                <Link
                                    href="/projects?action=new"
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                                >
                                    Créer votre premier projet
                                </Link>
                            </div>
                        ) : (
                            recentProjects.map((project) => (
                                <Link
                                    key={project.code}
                                    href={`/projects/${project.code}`}
                                    className="block p-3 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-[var(--text-primary)] truncate">
                                                {project.name}
                                            </h3>
                                            <p className="text-xs text-[var(--text-secondary)] mt-1">
                                                {project.code}
                                            </p>
                                        </div>
                                        <div className="ml-3 flex-shrink-0">
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">
                                                    {project.progress}%
                                                </p>
                                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-600 rounded-full transition-all"
                                                        style={{ width: `${project.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Documents */}
                <div className="bg-white dark:bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Documents récents</h2>
                        <Link
                            href="/archives"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            Voir tout
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentDocuments.length === 0 ? (
                            <div className="text-center py-8 text-[var(--text-secondary)]">
                                <FileText size={48} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Aucun document pour le moment</p>
                                <Link
                                    href="/archives"
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                                >
                                    Ajouter votre premier document
                                </Link>
                            </div>
                        ) : (
                            recentDocuments.map((doc) => (
                                <div
                                    key={doc._id}
                                    className="p-3 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                                            <FileText size={16} className="text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-[var(--text-primary)] text-sm truncate">
                                                {doc.fileName}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-[var(--text-secondary)]">
                                                    {doc.phase}
                                                </span>
                                                <span className="text-xs text-[var(--text-tertiary)]">•</span>
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                                        doc.status === "valide"
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                            : doc.status === "rejete"
                                                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                    }`}
                                                >
                                                    {doc.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-[var(--text-tertiary)] flex-shrink-0">
                                            {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <LayoutDashboard className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Bienvenue sur NEXA
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Votre plateforme centralisée pour la gestion de projets et l'archivage de documents. Créez des projets,
                            téléchargez des documents, collaborez avec votre équipe et suivez la progression en temps réel.
                        </p>
                        <div className="flex gap-3 mt-4">
                            <Link
                                href="/projects?action=new"
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Créer un projet →
                            </Link>
                            <Link
                                href="/archives"
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Parcourir les archives →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
