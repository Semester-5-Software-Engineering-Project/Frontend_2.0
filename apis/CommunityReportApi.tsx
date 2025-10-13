import axiosInstance from '@/app/utils/axiosInstance';

export interface ReportDto {
  id: string;
  postId: string;
  reason: string;
  reporterName: string;
}

export class CommunityReportApi {
  // Report a post
  static async reportPost(postId: string, reason: string): Promise<ReportDto> {
    try {
      const res = await axiosInstance.post(
        '/api/community/reports',
        { postId, reason },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      return res.data;
    } catch (err: any) {
      throw new Error(err?.response?.data || err.message || 'Failed to report post');
    }
  }

  // Get all reports for a specific post (for moderation)
  static async getReportsByPost(postId: string): Promise<ReportDto[]> {
    try {
      const res = await axiosInstance.get(`/api/community/reports/post/${postId}`, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      return res.data;
    } catch (err: any) {
      throw new Error(err?.response?.data || err.message || 'Failed to fetch reports');
    }
  }
}
