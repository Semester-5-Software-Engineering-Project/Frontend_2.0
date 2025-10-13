// StudentCommunity/index.tsx
'use client';
import React from 'react';
import PostFeed from './PostFeed';
import StudentOnlyGuard from './StudentOnlyGuard';

export default function StudentCommunityPage() {
  return (
    <StudentOnlyGuard>
      <div className="min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-center py-6">Student Community</h1>
        <PostFeed />
      </div>
    </StudentOnlyGuard>
  );
}
