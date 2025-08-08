'use client'

import { useState } from 'react'
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
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'



export default function CoursePage() {
  const params = useParams()
  const [activeModule, setActiveModule] = useState(1)

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

  const modules = [
    {
      id: 1,
      title: 'Introduction to Calculus',
      duration: '2 hours',
      materials: 5,
      completed: true,
      materials_list: [
        { type: 'document', name: 'Calculus Basics.pdf', size: '2.3 MB' },
        { type: 'video', name: 'Introduction Video', duration: '45 min' },
        { type: 'link', name: 'Practice Problems', url: 'https://example.com' }
      ]
    },
    {
      id: 2,
      title: 'Derivatives and Applications',
      duration: '3 hours',
      materials: 7,
      completed: true,
      materials_list: [
        { type: 'document', name: 'Derivatives Guide.pdf', size: '3.1 MB' },
        { type: 'document', name: 'Practice Worksheets.pdf', size: '1.8 MB' },
        { type: 'video', name: 'Derivatives Explained', duration: '52 min' },
        { type: 'link', name: 'Online Calculator', url: 'https://example.com' }
      ]
    },
    {
      id: 3,
      title: 'Integration Techniques',
      duration: '4 hours',
      materials: 6,
      completed: false,
      materials_list: [
        { type: 'document', name: 'Integration Methods.pdf', size: '2.7 MB' },
        { type: 'video', name: 'Integration Tutorial', duration: '38 min' },
        { type: 'link', name: 'Interactive Examples', url: 'https://example.com' }
      ]
    },
    {
      id: 4,
      title: 'Differential Equations',
      duration: '5 hours',
      materials: 8,
      completed: false,
      materials_list: [
        { type: 'document', name: 'Differential Equations.pdf', size: '4.2 MB' },
        { type: 'video', name: 'Advanced Techniques', duration: '67 min' }
      ]
    }
  ]

  const activeModuleData = modules.find(m => m.id === activeModule)

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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Module Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Modules</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {modules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => setActiveModule(module.id)}
                      className={`
                        w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between
                        ${activeModule === module.id ? 'bg-green-50 border-r-4 border-green-600' : ''}
                      `}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                            ${module.completed 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                            }
                          `}>
                            {module.completed ? '✓' : module.id}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{module.title}</h4>
                            <p className="text-xs text-gray-500">{module.duration} • {module.materials} materials</p>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Module Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{activeModuleData?.title}</CardTitle>
                    <CardDescription>
                      {activeModuleData?.duration} • {activeModuleData?.materials} materials
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={activeModuleData?.completed ? 'default' : 'secondary'}
                    className={activeModuleData?.completed ? 'bg-green-100 text-green-700' : ''}
                  >
                    {activeModuleData?.completed ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Module Materials */}
                <div>
                  <h3 className="font-semibold mb-4">Course Materials</h3>
                  <div className="space-y-3">
                    {activeModuleData?.materials_list.map((material, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        {getIconForMaterial(material.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{material.name}</h4>
                          <p className="text-xs text-gray-500">
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
                  </div>
                </div>

                <Separator />

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  <Link href="/dashboard/sessions/new">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Video className="w-4 h-4 mr-2" />
                      Start Video Session
                    </Button>
                  </Link>
                  <Link href="/dashboard/schedule">
                    <Button variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Session
                    </Button>
                  </Link>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download All Materials
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}