// ══════════════════════════════════════════════════════════════
// PROJECT SERVICE - Projects API
// ══════════════════════════════════════════════════════════════

import apiClient, { ApiResponse } from './client';

export interface Activity {
  name: string;
  typeActivite: 'travaux' | 'fourniture' | 'services' | 'etudes' | 'pi';
}

export interface SousComposant {
  id: string;
  name: string;
  typeActivite?: 'travaux' | 'fourniture' | 'services' | 'etudes' | 'pi'; // Optionnel, rempli si c'est le niveau le plus bas
  activities: Activity[];
}

export interface Component {
  id: string;
  name: string;
  budget?: number;
  typeActivite?: 'travaux' | 'fourniture' | 'services' | 'etudes' | 'pi'; // Optionnel, rempli si c'est le niveau le plus bas
  sousComposants: SousComposant[];
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Localisation {
  region?: string;
  departement?: string;
  ville?: string;
  localite?: string;
  coordinates?: Coordinates;
}

export interface Bailleur {
  nom: string;
  pourcentage: number;
}

export interface Financement {
  type: 'MOP' | 'PPP';
  budgetNational?: boolean;
  budgetNationalPct?: number;
  bailleurs?: Bailleur[];
}

export interface Project {
  code: string;
  name: string;
  description?: string;
  budget?: number;
  devise: string;
  progress: number;
  localisation?: Localisation;
  financement?: Financement;
  dateDebut?: string;
  dateFin?: string;
  components: Component[];
  createdBy: string;
  createdAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  budget?: number;
  devise?: string;
  progress?: number;
  localisation?: Localisation;
  financement?: Financement;
  dateDebut?: string;
  dateFin?: string;
  components?: Component[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  budget?: number;
  progress?: number;
  localisation?: Localisation;
  financement?: Financement;
  dateDebut?: string;
  dateFin?: string;
  components?: Component[];
}

export const projectService = {
  /**
   * Get all projects
   */
  async getAll(region?: string): Promise<Project[]> {
    const params = region ? { region } : {};
    const response = await apiClient.get<ApiResponse<Project[]>>('/projects', { params });
    return response.data.data || [];
  },

  /**
   * Get project by code
   */
  async getByCode(code: string): Promise<Project> {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${code}`);
    return response.data.data!;
  },

  /**
   * Get project statistics
   */
  async getStats(): Promise<{ total: number; avgProgress: number }> {
    const response = await apiClient.get<ApiResponse<{ total: number; avgProgress: number }>>(
      '/projects/stats'
    );
    return response.data.data!;
  },

  /**
   * Create project
   */
  async create(data: CreateProjectDto): Promise<Project> {
    const response = await apiClient.post<ApiResponse<Project>>('/projects', data);
    return response.data.data!;
  },

  /**
   * Update project
   */
  async update(code: string, data: UpdateProjectDto): Promise<Project> {
    const response = await apiClient.patch<ApiResponse<Project>>(`/projects/${code}`, data);
    return response.data.data!;
  },

  /**
   * Delete project
   */
  async delete(code: string): Promise<void> {
    await apiClient.delete(`/projects/${code}`);
  },
};
