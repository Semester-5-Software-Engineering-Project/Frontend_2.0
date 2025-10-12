import axiosInstance from '@/app/utils/axiosInstance';

export interface ModuleDescriptionDto {
  id?: number;
  moduleId: string;
  name?: string;
  domain?: string;
  price?: number;
  tutorName?: string;
  descriptionPoints: string[];
}

export class ModuleDescriptionApi {
  /**
   * Create a new module description
   * @param dto Module description data with points array
   * @returns Created module description
   */
  static async create(dto: ModuleDescriptionDto): Promise<ModuleDescriptionDto> {
    try {
      const response = await axiosInstance.post('/api/module-descriptions', dto);
      return response.data;
    } catch (error: any) {
      console.error('Error creating module description:', error);
      throw new Error(error.response?.data?.message || 'Failed to create module description');
    }
  }

  /**
   * Check if a module description exists
   * @param moduleId Module ID to check
   * @returns Boolean indicating if description exists
   */
  static async exists(moduleId: string): Promise<boolean> {
    try {
      const response = await axiosInstance.get('/api/module-descriptions/exits', {
        params: { moduleId }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error checking module description existence:', error);
      return false;
    }
  }

  /**
   * Get module description by module ID
   * @param moduleId Module ID
   * @returns Module description DTO
   */
  static async getByModuleId(moduleId: string): Promise<ModuleDescriptionDto> {
    try {
      const response = await axiosInstance.get('/api/module-descriptions', {
        params: { moduleId }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching module description:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch module description');
    }
  }

  /**
   * Update an existing module description
   * @param moduleId Module ID
   * @param dto Updated module description data
   * @returns Updated module description
   */
  static async update(moduleId: string, dto: ModuleDescriptionDto): Promise<ModuleDescriptionDto> {
    try {
      const response = await axiosInstance.put(`/api/module-descriptions/${moduleId}`, dto);
      return response.data;
    } catch (error: any) {
      console.error('Error updating module description:', error);
      throw new Error(error.response?.data?.message || 'Failed to update module description');
    }
  }

  /**
   * Delete a module description
   * @param moduleId Module ID
   */
  static async delete(moduleId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/module-descriptions/${moduleId}`);
    } catch (error: any) {
      console.error('Error deleting module description:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete module description');
    }
  }
}

export default ModuleDescriptionApi;
