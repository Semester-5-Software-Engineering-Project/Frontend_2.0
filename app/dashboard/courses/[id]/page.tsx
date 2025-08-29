'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  Video, 
  FileText, 
  Link as LinkIcon, 
  Download,
  Star,
  Clock,
  Users,
  Play,
  ChevronRight,
  Calendar,
  ChevronLeft,
} from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default function CoursePage() {
  const params = useParams()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const materialRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Auto-collapse sidebar on mobile when clicking a material
  const handleMaterialClick = (materialId: string) => {
    scrollToMaterial(materialId)
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true)
    }
  }

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Initial check

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Mock course data
  const course = {
    id: params.id,
    title: 'Advanced Mathematics',
    tutor: 'Dr. Sarah Johnson',
    description: 'Master advanced mathematical concepts including calculus, linear algebra, and differential equations.',
    rating: 4.8,
    students: 24,
    duration: '12 weeks',
    progress: 75,
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop'
  }

  // Source list of materials (flattened, no modules)
  const lectureMaterials = [
    { id: 'calc-basics', type: 'document', name: 'Calculus Basics.pdf', size: '2.3 MB' },
    { id: 'intro-video', type: 'video', name: 'Introduction Video', duration: '45 min' },
    { id: 'practice-problems', type: 'link', name: 'Practice Problems', url: 'https://example.com' },
    { id: 'derivatives-guide', type: 'document', name: 'Derivatives Guide.pdf', size: '3.1 MB' },
    { id: 'worksheets', type: 'document', name: 'Practice Worksheets.pdf', size: '1.8 MB' },
    { id: 'derivatives-explained', type: 'video', name: 'Derivatives Explained', duration: '52 min' },
    { id: 'online-calculator', type: 'link', name: 'Online Calculator', url: 'https://example.com' },
    { id: 'integration-methods', type: 'document', name: 'Integration Methods.pdf', size: '2.7 MB' },
    { id: 'integration-tutorial', type: 'video', name: 'Integration Tutorial', duration: '38 min' },
    { id: 'interactive-examples', type: 'link', name: 'Interactive Examples', url: 'https://example.com' },
    { id: 'diff-eq', type: 'document', name: 'Differential Equations.pdf', size: '4.2 MB' },
    { id: 'advanced-techniques', type: 'video', name: 'Advanced Techniques', duration: '67 min' }
  ]

  const scrollToMaterial = (materialId: string) => {
    const materialElement = materialRefs.current[materialId]
    if (materialElement) {
      materialElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  const getIconForMaterial = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-4 h-4 text-red-500" />
      case 'video':
        return <Video className="w-4 h-4 text-blue-500" />
      case 'link':
        return <LinkIcon className="w-4 h-4 text-green-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
       

        

          {/* Backdrop Overlay for Mobile */}
          {!sidebarCollapsed && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarCollapsed(true)}
            />
          )}

          {/* Toggle Button for Collapsed Sidebar */}
          <div className={`fixed top-4 left-4 z-100 transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <Button
              variant="default"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="rounded-full w-12 h-12 -pr-20 shadow-lg absolute top-12 -left-9 bg-primary/70"
            >
              <ChevronRight className="w-6 h-6"/>
            </Button>
          </div>

          

          {/* All Content */}
          <div className={`space-y-6 transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'ml-0' : 'ml-0 lg:ml-80 md:ml-72 sm:ml-64'
          }`}>


         {/* Course Header */}
         <div className="relative">
          <img 
            src={course.image} 
            alt={course.title}
            className="w-full h-64 object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
              <p className="text-xl text-gray-200 mb-4">{course.description}</p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span>{course.rating}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>{course.students} students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className={`flex justify-end ${sidebarCollapsed ? 'ml-0' : 'ml-0 lg:ml-80 md:ml-72 sm:ml-64'}`}>
            <Button asChild>
              <Link href="/meeting">Join Live Session</Link>
            </Button>
          </div>



        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
            <CardDescription>Track your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-500">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-3" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>2 of 4 modules completed</span>
                <span>Estimated completion: 3 weeks</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Materials Sidebar */}
          <div className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
          }`}>
            <Card className="h-full w-80 lg:w-80 md:w-72 sm:w-64 rounded-none border-r border-b border-l-0 border-t-0 shadow-lg bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Course Materials</CardTitle>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-1 h-6 w-6"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 max-h-[calc(100vh-120px)] overflow-y-auto">
                  {lectureMaterials.map((material) => (
                    <button
                      key={material.id}
                      onClick={() => handleMaterialClick(material.id)}
                      className="w-full text-left p-4 hover:bg-muted transition-colors flex items-center justify-between bg-muted"
                    >
                      <div className="flex items-center space-x-3">
                        {getIconForMaterial(material.type)}
                        <div>
                          <h4 className="font-medium text-sm">{material.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {material.type === 'document' && material.size}
                            {material.type === 'video' && material.duration}
                            {material.type === 'link' && 'External Resource'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>


            <Card>
              <CardHeader>
                <CardTitle>Lecture Materials</CardTitle>
                <CardDescription>All resources for this course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {lectureMaterials.map((material) => (
                  <div
                    key={material.id}
                    ref={(el) => (materialRefs.current[material.id] = el)}
                    id={`material-${material.id}`}
                    className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-muted transition-colors border-border"
                  >
                    {getIconForMaterial(material.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{material.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {material.type === 'document' && material.size}
                        {material.type === 'video' && material.duration}
                        {material.type === 'link' && 'External Resource'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {material.type === 'video' && (
                        <Button size="sm" variant="outline">
                          <Play className="w-4 h-4 mr-1" />
                          Watch
                        </Button>
                      )}
                      {material.type === 'link' && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={material.url} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="w-4 h-4 mr-1" />
                            Open
                          </a>
                        </Button>
                      )}
                      {material.type === 'document' && (
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}