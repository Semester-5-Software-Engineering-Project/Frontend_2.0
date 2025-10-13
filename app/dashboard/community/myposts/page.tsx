import dynamic from 'next/dynamic';

const MyPosts = dynamic(() => import('@/components/StudentCommunity/MyPosts'), { ssr: false });

export default function MyPostsPage() {
  return <MyPosts />;
}
