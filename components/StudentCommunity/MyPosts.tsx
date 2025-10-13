// StudentCommunity/MyPosts.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { PostDto } from './types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Flag, BarChart2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityFeedApi } from '@/apis/CommunityFeedApi';
import StudentOnlyGuard from './StudentOnlyGuard';

export default function MyPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    CommunityFeedApi.getPostsByUser(user.id)
      .then((data) => setPosts(data))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="p-8 text-center">Login required</div>;
  if (loading) return <div className="p-8 text-center">Loading your posts...</div>;

  return (
    <StudentOnlyGuard>
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <h2 className="text-xl font-bold mb-4">My Posts & Engagement</h2>
        {posts.length === 0 && <div className="text-gray-500 text-center">You haven&apos;t created any posts yet.</div>}
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow p-5 flex flex-col gap-3 border border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.creatorProfileImage || undefined} />
                <AvatarFallback>{post.creatorName?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-gray-900">{post.creatorName}</div>
                <div className="text-xs text-gray-400">Engagement: {post.engagement}</div>
              </div>
            </div>
            <div>
              <div className="font-bold text-lg mb-1">{post.title}</div>
              <div className="text-gray-700 mb-2">{post.description}</div>
              {post.imageUrls && post.imageUrls.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {post.imageUrls.map((url: string, idx: number) => (
                    <img
                      key={idx}
                      src={url}
                      alt="post-img"
                      className="rounded-lg max-h-60 border object-cover"
                      style={{ maxWidth: 200 }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-2 text-gray-500 text-sm items-center">
              <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {post.commentCount} Comments</span>
              <span className="flex items-center gap-1"><Flag className="w-4 h-4" /> {post.reportCount} Reports</span>
              <span className="flex items-center gap-1"><BarChart2 className="w-4 h-4" /> {post.engagement} Engagement</span>
            </div>
          </div>
        ))}
      </div>
    </StudentOnlyGuard>
  );
}
