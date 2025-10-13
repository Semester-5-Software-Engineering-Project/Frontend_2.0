import { Users } from 'lucide-react';

export const studentCommunityNavItem = {
  name: 'Explore the community',
  href: '/dashboard/community',
  icon: Users,
  children: [
    {
      name: 'My Posts',
      href: '/dashboard/community/myposts',
    },
  ],
};
