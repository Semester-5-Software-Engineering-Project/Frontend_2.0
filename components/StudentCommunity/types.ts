// types for StudentCommunity/PostDto
export interface PostDto {
  id: string;
  title: string;
  description: string;
  imageUrls: string[];
  creatorName: string;
  creatorProfileImage: string | null;
  commentCount: number;
  reportCount: number;
  engagement: number;
}

export interface CommentDto {
  id: string;
  postId: string;
  content: string;
  userName: string;
  userProfileImage: string | null;
}
