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


async function fetchMaterials(module_id: string) {
  const response = await fetch(`http://localhost:8080/api/materials/fetchAll?module_id=${module_id}`, {
  
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch materials: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(data);
  return data;
}



  // State for fetched materials
  const [lectureMaterials, setLectureMaterials] = useState<any[]>([]);

  useEffect(() => {
    fetchMaterials("16afc951-af56-4e56-95c8-d54e4fb07779")
      .then((materials) => setLectureMaterials(materials))
      .catch((err) => {
        // Optionally handle error
        setLectureMaterials([]);
      });
  }, []);

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

  async function handleDownload(materialId: string) {
    try {
      // Find the material by id
      const material = lectureMaterials.find(
        (m) => (m.id || m.material_id) === materialId
      );
      if (!material || !material.url) {
        alert('Download link not available.');
        return;
      }

      // Start download
      const response = await fetch(material.url);
      if (!response.ok) {
        alert('Failed to download file.');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link to trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = material.title || 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('An error occurred while downloading.');
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
              className="rounded-full w-12 h-12 -pr-20 shadow-lg absolute top-12 -left-9 bg-green-500 opacity-50"
            >
              <ChevronRight className="w-6 h-6"/>
            </Button>
          </div>

          {/* Top Actions */}
          <div className={`flex justify-end ${sidebarCollapsed ? 'ml-0' : 'ml-0 lg:ml-80 md:ml-72 sm:ml-64'}`}>
            <Button asChild>
              <Link href="/meeting">Join Live Session</Link>
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
            <Card className="h-full w-80 lg:w-80 md:w-72 sm:w-64 rounded-none border-r border-b border-l-0 border-t-0 shadow-lg">
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
              <CardContent className="overflow-y-auto h-[calc(100vh-80px)] p-0">
              {lectureMaterials.map((material) => (
                <button
                key={material.id || material.material_id}
                onClick={() => handleMaterialClick(material.id || material.material_id)}
                className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                <div className="flex items-center space-x-3">
                  {material.type === 'Document' && (
                  <FileText className="w-4 h-4 text-red-500" />
                  )}
                  {material.type === 'Link' && (
                  <LinkIcon className="w-4 h-4 text-green-500" />
                  )}
                  {material.type === 'Video' && (
                  <Video className="w-4 h-4 text-blue-500" />
                  )}
                  {material.type !== 'Document' && material.type !== 'Link' && material.type !== 'Video' && (
                  <FileText className="w-4 h-4 text-gray-500" />
                  )}
                  <div>
                  <h4 className="font-medium text-sm">{material.title}</h4>
                  <p className="text-xs text-gray-500">
                    {material.type === 'Document' && 'PDF'}
                    {material.type === 'Link' && 'External Resource'}
                  </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area for Materials */}
          <div className="space-y-4">
            {lectureMaterials.map((material) => (
              <div
                key={material.id || material.material_id}
                ref={(el) => (materialRefs.current[material.id || material.material_id] = el)}
                id={`material-${material.id || material.material_id}`}
                className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {material.type === 'Document' && getIconForMaterial('document')}
                {material.type === 'Link' && getIconForMaterial('link')}
                {material.type === 'Video' && getIconForMaterial('video')}
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{material.title}</h4>
                  <p className="text-xs text-gray-500">
                    {material.type === 'Document' && 'PDF'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {material.type === 'Link' && 'External Resource'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {material.type === 'Video' && (
                    <Button size="sm" variant="outline">
                      <Play className="w-4 h-4 mr-1" />
                      Watch
                    </Button>
                  )}
                  {material.type === 'Link' && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={material.url} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="w-4 h-4 mr-1" />
                        Open
                      </a>
                    </Button>
                  )}
                  {material.type === 'Document' && (
                    <Button size="sm" variant="outline" onClick={() => handleDownload(material.id || material.material_id)}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  )
}