import axiosInstance from '@/app/utils/axiosInstance';
import { PostDto } from '@/components/StudentCommunity/types';

export interface PaginatedPosts {
  posts: PostDto[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export class CommunityPostApi {
  // Upload a single image file, returns the image URL from backend
  static async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/api/materials/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    });
    return response.data;
  }

  // Create a post with title, description, and array of image URLs
  static async createPost({
    title,
    description,
    imageUrls,
  }: {
    title: string;
    description: string;
    imageUrls: string[];
  }): Promise<PostDto> {
    try {
      const response = await axiosInstance.post(
        '/api/community/posts',
        { title, description, imageUrls },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (err: any) {
      throw new Error(err?.response?.data || err.message || 'Failed to create post');
    }
  }

  // Fetch all posts (paginated)
  static async getAllPosts(page = 0, size = 10): Promise<PaginatedPosts> {
    try {
      const response = await axiosInstance.get('/api/community/posts', {
        params: { page, size },
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      return response.data;
    } catch (err: any) {
      throw new Error(err?.response?.data || err.message || 'Failed to fetch posts');
    }
  }

  // Fetch posts created by the current user (paginated)
  static async getMyPosts(page = 0, size = 10): Promise<PaginatedPosts> {
    try {
      const response = await axiosInstance.get('/api/community/posts/mine', {
        params: { page, size },
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      return response.data;
    } catch (err: any) {
      throw new Error(err?.response?.data || err.message || 'Failed to fetch your posts');
    }
  }

  // Delete a post by ID
  static async deletePost(postId: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete(`/api/community/posts/${postId}`, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      return response.data;
    } catch (err: any) {
      throw new Error(err?.response?.data || err.message || 'Failed to delete post');
    }
  }
}