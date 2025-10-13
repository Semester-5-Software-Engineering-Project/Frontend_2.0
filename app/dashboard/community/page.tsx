import dynamic from 'next/dynamic';

const StudentCommunityPage = dynamic(
  () => import('@/components/StudentCommunity'),
  { ssr: false }
);

export default function CommunityPage() {
  return <StudentCommunityPage />;
}
