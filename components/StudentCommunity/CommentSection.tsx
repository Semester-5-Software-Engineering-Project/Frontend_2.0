// StudentCommunity/CommentSection.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { CommentDto } from './types';
import { CommunityCommentApi, PaginatedComments } from '@/apis/CommunityCommentApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CommentSectionProps {
  postId: string;
  currentUserName: string;
  currentUserProfileImage?: string | null;
}

export default function CommentSection({ postId, currentUserName, currentUserProfileImage }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  const fetchComments = () => {
    setLoading(true);
    setError(null);
    CommunityCommentApi.getCommentsByPost(postId, page, pageSize)
      .then((data: PaginatedComments) => {
        setComments(data.comments);
        setTotalPages(data.totalPages);
      })
      .catch((err) => setError(err.message || 'Failed to load comments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, page]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await CommunityCommentApi.createComment(postId, newComment);
      setNewComment('');
      setPage(0); // Go to first page to see new comment
      fetchComments();
    } catch (err: any) {
      setError(err.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (id: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await CommunityCommentApi.updateComment(id, editingContent);
      setEditingId(null);
      setEditingContent('');
      fetchComments();
    } catch (err: any) {
      setError(err.message || 'Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (id: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await CommunityCommentApi.deleteComment(id);
      fetchComments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleAddComment} className="flex gap-2 mb-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={currentUserProfileImage || undefined} />
          <AvatarFallback>{currentUserName?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          disabled={submitting}
          className="flex-1"
        />
        <Button type="submit" disabled={submitting || !newComment.trim()}>Post</Button>
      </form>
      {error && <div className="text-xs text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div className="text-xs text-gray-400">Loading comments...</div>
      ) : (
        <div className="space-y-3">
          {comments.length === 0 && <div className="text-xs text-gray-400">No comments yet.</div>}
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2 bg-gray-50 rounded p-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={c.userProfileImage || undefined} />
                <AvatarFallback>{c.userName?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-700">{c.userName}</div>
                {editingId === c.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleEditComment(c.id);
                    }}
                    className="flex gap-2 mt-1"
                  >
                    <Input
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="flex-1 text-xs"
                    />
                    <Button type="submit" size="sm" disabled={submitting}>Save</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </form>
                ) : (
                  <div className="text-xs text-gray-600 mt-1">{c.content}</div>
                )}
              </div>
              {c.userName === currentUserName && editingId !== c.id && (
                <div className="flex flex-col gap-1 ml-2">
                  <Button size="sm" variant="ghost" className="text-xs px-2 py-1" onClick={() => { setEditingId(c.id); setEditingContent(c.content); }}>Edit</Button>
                  <Button size="sm" variant="ghost" className="text-xs px-2 py-1 text-red-500" onClick={() => handleDeleteComment(c.id)}>Delete</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
