import axiosInstance from '@/app/utils/axiosInstance';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

export class UploadApi {
  /**
   * Upload an image file to the server
   * @param file The image file to upload
   * @returns Promise with the uploaded file URL
   */
  static async uploadImage(file: File): Promise<string> {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (3MB limit)
      const maxSize = 3 * 1024 * 1024; // 3MB
      if (file.size > maxSize) {
        throw new Error('Image must be under 3MB');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Upload to backend
      const response = await axiosInstance.post('/api/materials/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Add timeout for large files
        timeout: 30000, // 30 seconds
      });

      // The backend returns the file URL as a string
      return response.data;
    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Handle different error types
      if (error.response?.status === 400) {
        throw new Error('Invalid file. Please select a valid image.');
      } else if (error.response?.status === 413) {
        throw new Error('File too large. Please select an image under 3MB.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout. Please try again with a smaller file.');
      } else {
        throw new Error(error.message || 'Failed to upload image');
      }
    }
  }

  /**
   * Upload profile image with specific optimizations
   * @param file The profile image file to upload
   * @returns Promise with the uploaded file URL
   */
  static async uploadProfileImage(file: File): Promise<string> {
    try {
      // Additional validation for profile images
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Profile image must be JPEG, PNG, or WebP format');
      }

      // Smaller size limit for profile images (2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        throw new Error('Profile image must be under 2MB');
      }

      return await this.uploadImage(file);
    } catch (error: any) {
      console.error('Profile image upload error:', error);
      throw error;
    }
  }

  /**
   * Get file info without uploading
   * @param file The file to get info for
   * @returns File information
   */
  static getFileInfo(file: File): { name: string; size: number; type: string; sizeFormatted: string } {
    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeFormatted: formatBytes(file.size)
    };
  }

  /**
   * Check if file is a valid image
   * @param file The file to check
   * @returns boolean indicating if file is a valid image
   */
  static isValidImage(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    return allowedTypes.includes(file.type);
  }

  /**
   * Validate file size
   * @param file The file to check
   * @param maxSizeMB Maximum size in MB
   * @returns boolean indicating if file size is valid
   */
  static isValidSize(file: File, maxSizeMB: number = 3): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxBytes;
  }
}