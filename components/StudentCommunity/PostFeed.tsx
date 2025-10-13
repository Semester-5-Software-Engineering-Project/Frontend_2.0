
'use client';
import Link from 'next/link';

import React, { useEffect, useState, useCallback } from 'react';
import CreatePostForm from './CreatePostForm';
import { PostDto } from '@/components/StudentCommunity/types';
import { CommunityFeedApi } from '@/apis/CommunityFeedApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Flag, BarChart2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import CommentSection from './CommentSection';
import ReportPostModal from './ReportPostModal';
import { useAuth } from '@/contexts/AuthContext';


export default function PostFeed() {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [view, setView] = useState<'all' | 'mine'>('all');
  const pageSize = 5;
  const { user } = useAuth();
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);

  const fetchPosts = useCallback(() => {
    setLoading(true);
    setError(null);
    const apiCall = view === 'mine' ? CommunityFeedApi.getMyPosts : CommunityFeedApi.getAllPosts;
    apiCall(page, pageSize)
      .then((data) => {
        setPosts(data.posts);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
      })
      .catch((err) => setError(err.message || 'Failed to load posts'))
      .finally(() => setLoading(false));
  }, [page, view]);

  useEffect(() => {
    setPage(0); // Reset to first page when switching view
  }, [view]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  if (loading) return <div className="p-8 text-center">Loading community...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="mb-4 flex gap-2">
        <Link href="/dashboard">
          <Button variant="outline">&larr; Back to Dashboard</Button>
        </Link>
        <Button variant={view === 'all' ? 'default' : 'outline'} onClick={() => setView('all')}>Home</Button>
        <Button variant={view === 'mine' ? 'default' : 'outline'} onClick={() => setView('mine')}>My Posts</Button>
      </div>
      {view === 'mine' && <CreatePostForm onPostCreated={fetchPosts} />}
      {posts.length === 0 && <div className="text-gray-500 text-center">No posts yet.</div>}
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
            <div className="ml-auto">
              <Button size="sm" variant="ghost" onClick={() => setReportingPostId(post.id)}>
                Report
              </Button>
            </div>
          </div>
          <div>
            <div className="font-bold text-lg mb-1">{post.title}</div>
            <div className="text-gray-700 mb-2">{post.description}</div>
            {post.imageUrls && post.imageUrls.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {post.imageUrls.map((url: string, idx: number) => (
                  <Image
                    key={idx}
                    src={url}
                    alt="post-img"
                    width={200}
                    height={180}
                    className="rounded-lg max-h-60 border object-cover"
                    style={{ maxWidth: 200, height: 'auto' }}
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
          {/* Comment Section */}
          {user && (
            <CommentSection
              postId={post.id}
              currentUserName={user.name}
              currentUserProfileImage={user.avatar || null}
            />
          )}
        </div>
      ))}
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={() => handlePageChange(page - 1)} disabled={page === 0}>
            Previous
          </Button>
          <span className="px-2 py-1 text-sm">Page {page + 1} of {totalPages}</span>
          <Button size="sm" variant="outline" onClick={() => handlePageChange(page + 1)} disabled={page + 1 >= totalPages}>
            Next
          </Button>
        </div>
      )}
      {/* Report Modal */}
      {reportingPostId && (
        <ReportPostModal
          postId={reportingPostId}
          open={!!reportingPostId}
          onClose={() => setReportingPostId(null)}
          onReported={fetchPosts}
        />
      )}
    </div>
  );
}
