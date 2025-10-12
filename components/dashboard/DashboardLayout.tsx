'use client'

import { useState, useEffect } from 'react'
import { useAuth, userType } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  BookOpen, 
  Calendar, 
  Video, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home,
  Upload,
  CreditCard,
  Star,
  Search,
  Bot,
  Wallet
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import StudentProfileApi from '@/apis/StudentProfileApi'
import { TutorProfileApi } from '@/apis/TutorProfile'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const pathname = usePathname()

  const studentNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Courses', href: '/dashboard/courses', icon: BookOpen },
    { name: 'Find New', href: '/dashboard/findnew', icon: Search },
    // Students can see module/courses but not create or manage schedules
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Ask AI', href: '/dashboard/ask-ai', icon: Bot },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ]

  const tutorNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Courses', href: '/dashboard/courses', icon: BookOpen },
    { name: 'Upload Materials', href: '/dashboard/upload', icon: Upload },
    { name: 'My Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ]

  const navItems = user?.role === userType.STUDENT ? studentNavItems : tutorNavItems

  // Fetch profile image URL when user changes
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!user) {
        setProfileImageUrl(null)
        return
      }

      try {
        let imageUrl: string | null = null
        
        if (user.role === userType.STUDENT) {
          imageUrl = await StudentProfileApi.getImageUrl()
        } else if (user.role === userType.TUTOR) {
          imageUrl = await TutorProfileApi.getImageUrl()
        }
        
        setProfileImageUrl(imageUrl)
      } catch (error) {
        console.error('Error fetching profile image:', error)
        setProfileImageUrl(null)
      }
    }

    fetchProfileImage()
  }, [user])

  // Listen for profile image updates from other components
  useEffect(() => {
    const handleProfileImageUpdate = (event: CustomEvent<{ imageUrl: string }>) => {
      setProfileImageUrl(event.detail.imageUrl)
    }

    window.addEventListener('profileImageUpdated', handleProfileImageUpdate as EventListener)
    
    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate as EventListener)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50" data-cy="dashboard-layout">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm" data-cy="top-header">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-yellow-50 lg:hidden"
            data-cy="mobile-menu-toggle"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDesktopSidebarCollapsed(!desktopSidebarCollapsed)}
            className="hover:bg-yellow-50 hidden lg:flex"
            title={desktopSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            data-cy="desktop-sidebar-toggle"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <Link href="/dashboard" className="flex items-center space-x-2" data-cy="logo-link">
            <div className="w-10 h-10 bg-[#FBBF24] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">TV</span>
            </div>
            <span className="text-xl font-bold">Tutor<span className="text-[#FBBF24]">Verse</span></span>
          </Link>
        </div>

        <div className="flex items-center space-x-4" data-cy="user-menu">
          <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2">
            <Avatar className="w-9 h-9 ring-2 ring-[#FBBF24]" data-cy="user-avatar">
              <AvatarImage src={profileImageUrl || user?.avatar || undefined} />
              <AvatarFallback className="bg-[#FBBF24] text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900" data-cy="user-name">{user?.name}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide" data-cy="user-role">{user?.role}</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="hover:bg-red-50 hover:text-red-600"
            data-cy="logout-button"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          ${desktopSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
          lg:translate-x-0
          fixed inset-y-0 left-0 top-[73px] z-40 w-64 bg-white border-r border-gray-200 
          transition-all duration-300 ease-in-out shadow-lg lg:shadow-none
        `} data-cy="sidebar">
          <div className="p-6 h-full overflow-y-auto flex flex-col">
            <nav className="space-y-1 flex-1" data-cy="navigation">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center ${desktopSidebarCollapsed ? 'lg:justify-center' : 'space-x-3'} px-4 py-3 rounded-lg text-sm font-medium transition-all
                      ${isActive 
                        ? 'bg-[#FBBF24] text-black shadow-md' 
                        : 'text-gray-600 hover:bg-yellow-50 hover:text-gray-900'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                    title={desktopSidebarCollapsed ? item.name : ''}
                    data-cy={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gray-500'} ${desktopSidebarCollapsed ? '' : 'flex-shrink-0'}`} />
                    <span className={`${desktopSidebarCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
            
            {/* Logout Button */}
            <div className="mt-auto pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={logout}
                className={`
                  w-full flex items-center ${desktopSidebarCollapsed ? 'lg:justify-center' : 'space-x-3'} px-4 py-3 rounded-lg text-sm font-medium transition-all
                  text-gray-600 hover:bg-red-50 hover:text-red-600
                `}
                title={desktopSidebarCollapsed ? 'Logout' : ''}
              >
                <LogOut className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <span className={`${desktopSidebarCollapsed ? 'lg:hidden' : ''}`}>Logout</span>
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden top-[73px]"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 min-h-screen bg-gray-50 transition-all duration-300 ${
          desktopSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}>
          {children}
        </main>
      </div>
    </div>
  )
}