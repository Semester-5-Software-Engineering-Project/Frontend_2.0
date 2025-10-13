import axiosInstance from '@/app/utils/axiosInstance';
import { CommentDto } from '@/components/StudentCommunity/types';

export interface PaginatedComments {
  comments: CommentDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export class CommunityCommentApi {
  // Get all comments for a specific post (paginated)
  static async getCommentsByPost(postId: string, page = 0, size = 10): Promise<PaginatedComments> {
    try {
      const res = await axiosInstance.get(`/api/community/comments/post/${postId}`, {
        params: { page, size },
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      return res.data;
    } catch (err: any) {
      throw new Error(err?.response?.data || err.message || 'Failed to fetch comments');
    }
  }

  // Create a new comment
  static async createComment(postId: string, content: string): Promise<CommentDto> {
    try {
      const res = await axiosInstance.post(
        '/api/community/comments',
        { postId, content },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      return res.data;
    } catch (err: any) {
      throw new Error(err?.response?.data || err.message || 'Failed to create comment');
    }
  }

  // Update a comment (only owner)
  static async updateComment(commentId: string, content: string): Promise<CommentDto> {
    try {
      const res = await axiosInstance.put(
        `/api/community/comments/${commentId}`,
        { content },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      return res.data;
    } catch (err: any) {
      throw new Error(err?.response?.data || err.message || 'Failed to update comment');
    }
  }

  // Delete a comment (only owner)
  static async deleteComment(commentId: string): Promise<{ message: string }> {
    try {
      const res = await axiosInstance.delete(
        `/api/community/comments/${commentId}`,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      return res.data;
    } catch (err: any) {
      throw new Error(err?.response?.data || err.message || 'Failed to delete comment');
    }
  }
}
