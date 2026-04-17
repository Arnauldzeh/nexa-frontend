// ══════════════════════════════════════════════════════════════
// PROJECT STORE - Connected to Backend API
// NO HARDCODED DATA - All data from API
// ══════════════════════════════════════════════════════════════

import {
  projectService,
  type Project,
  type CreateProjectDto,
  type UpdateProjectDto,
  type Activity,
  type SousComposant,
  type Component,
} from "@/services/api/projectService";
import { formatBudget, parseBudget } from "./helpers/budgetHelpers";

// ── Projects CRUD ──

export async function getProjects(region?: string): Promise<Project[]> {
  return await projectService.getAll(region);
}

export async function getProjectById(code: string): Promise<Project | undefined> {
  try {
    return await projectService.getByCode(code);
  } catch {
    return undefined;
  }
}

export async function addProject(project: CreateProjectDto): Promise<Project> {
  return await projectService.create(project);
}

export async function updateProject(code: string, updates: UpdateProjectDto): Promise<Project> {
  return await projectService.update(code, updates);
}

export async function deleteProject(code: string): Promise<void> {
  await projectService.delete(code);
}

export async function getProjectStats(): Promise<{ total: number; avgProgress: number }> {
  return await projectService.getStats();
}

// ── Helper Functions ──

/**
 * Generate a unique project code (client-side temporary, backend will generate the real one)
 */
export function generateProjectCode(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PRJ-${year}-${random}`;
}

/**
 * Format project budget for display
 */
export function formatProjectBudget(project: Project): string {
  if (!project.budget) return "N/A";
  return formatBudget(project.budget, project.devise);
}

/**
 * Get project region
 */
export function getProjectRegion(project: Project): string {
  return project.localisation?.region || "N/A";
}

/**
 * Get project city
 */
export function getProjectCity(project: Project): string {
  return project.localisation?.ville || "N/A";
}

/**
 * Get project location string
 */
export function getProjectLocation(project: Project): string {
  const parts = [];
  if (project.localisation?.ville) parts.push(project.localisation.ville);
  if (project.localisation?.region) parts.push(project.localisation.region);
  return parts.join(", ") || "N/A";
}

// Activity types (kept for UI)
export const ACTIVITY_TYPES = [
  { id: "travaux", label: "Travaux" },
  { id: "fourniture", label: "Fourniture" },
  { id: "services", label: "Services" },
  { id: "etudes", label: "Études" },
  { id: "pi", label: "Prestations Intellectuelles" },
] as const;

export type ActivityTypeId = typeof ACTIVITY_TYPES[number]["id"];

// Helper: extract name from activity
export function getActivityName(act: Activity): string {
  return act.name;
}

// Helper: extract type from activity
export function getActivityType(act: Activity): string {
  return act.typeActivite;
}

// Type aliases for backward compatibility
export type ComponentData = Component;
export type SousComposantData = SousComposant;
export type ActivityDef = Activity;

// Re-export types
export type { Project, CreateProjectDto, UpdateProjectDto, Activity, SousComposant, Component };
export type { Localisation, Financement, Bailleur, Coordinates } from "@/services/api/projectService";
