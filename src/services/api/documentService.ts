// ══════════════════════════════════════════════════════════════
// DOCUMENT SERVICE - Documents API
// ══════════════════════════════════════════════════════════════

import apiClient, { ApiResponse } from './client';

export interface DocumentMetadata {
  _id: string;
  projectId: string;
  phase: 'etude' | 'passation' | 'execution';
  folderName: string;
  fileName: string;
  fileSize?: string;
  fileType?: string;
  version: number;
  status: 'encours' | 'valide' | 'rejete' | 'manquant';
  uploadedBy: string;
  tracking?: {
    approvedBy?: string;
    approvedAt?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    rejectionReason?: string;
  };
  isTrashed: boolean;
  trashReason?: string;
  trashedAt?: string;
  createdAt: string;
}

export interface UploadDocumentDto {
  projectId: string;
  phase: 'etude' | 'passation' | 'execution';
  folderName: string;
}

export interface RejectDocumentDto {
  reason: string;
}

export interface TrashDocumentDto {
  reason: string;
}

export const documentService = {
  /**
   * Upload document
   */
  async upload(file: File, data: UploadDocumentDto): Promise<DocumentMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', data.projectId);
    formData.append('phase', data.phase);
    formData.append('folderName', data.folderName);

    const response = await apiClient.post<ApiResponse<DocumentMetadata>>(
      '/documents/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!;
  },

  /**
   * Get all documents
   */
  async getAll(filters?: {
    projectId?: string;
    phase?: string;
    status?: string;
    isTrashed?: boolean;
  }): Promise<DocumentMetadata[]> {
    const response = await apiClient.get<ApiResponse<DocumentMetadata[]>>('/documents', {
      params: filters,
    });
    return response.data.data || [];
  },

  /**
   * Get document by ID
   */
  async getById(id: string): Promise<DocumentMetadata> {
    const response = await apiClient.get<ApiResponse<DocumentMetadata>>(`/documents/${id}`);
    return response.data.data!;
  },

  /**
   * Get document statistics
   */
  async getStats(projectId: string, phase?: string): Promise<any> {
    const params = phase ? { phase } : {};
    const response = await apiClient.get<ApiResponse<any>>(
      `/documents/stats/${projectId}`,
      { params }
    );
    return response.data.data!;
  },

  /**
   * Download document
   */
  async download(id: string): Promise<Blob> {
    const response = await apiClient.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Approve document
   */
  async approve(id: string): Promise<DocumentMetadata> {
    const response = await apiClient.patch<ApiResponse<DocumentMetadata>>(
      `/documents/${id}/approve`
    );
    return response.data.data!;
  },

  /**
   * Reject document
   */
  async reject(id: string, data: RejectDocumentDto): Promise<DocumentMetadata> {
    const response = await apiClient.patch<ApiResponse<DocumentMetadata>>(
      `/documents/${id}/reject`,
      data
    );
    return response.data.data!;
  },

  /**
   * Move to trash
   */
  async trash(id: string, data: TrashDocumentDto): Promise<void> {
    await apiClient.patch(`/documents/${id}/trash`, data);
  },

  /**
   * Restore from trash
   */
  async restore(id: string): Promise<DocumentMetadata> {
    const response = await apiClient.patch<ApiResponse<DocumentMetadata>>(
      `/documents/${id}/restore`
    );
    return response.data.data!;
  },

  /**
   * Delete permanently
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  },
};
