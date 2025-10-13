import { CommunityPostApi, PaginatedPosts } from './CommunityPostApi';

export class CommunityFeedApi {
  // Fetch all posts (paginated)
  static async getAllPosts(page = 0, size = 10): Promise<PaginatedPosts> {
    return CommunityPostApi.getAllPosts(page, size);
  }

  // Fetch posts created by the current user (paginated)
  static async getMyPosts(page = 0, size = 10): Promise<PaginatedPosts> {
    return CommunityPostApi.getMyPosts(page, size);
  }
}
