'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  FileText, 
  Video, 
  Link as LinkIcon, 
  Trash2,
  Plus,
  Save
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { toast } from 'sonner'

export default function UploadMaterials() {
  const [selectedCourse, setSelectedCourse] = useState('')
  const [materials, setMaterials] = useState<any[]>([])
  const [newMaterial, setNewMaterial] = useState({
    type: 'document',
    title: '',
    description: '',
    url: '',
    file: null as File | null
  })

  const courses = [
    { id: '1', title: 'Advanced Mathematics' },
    { id: '2', title: 'Calculus Fundamentals' },
    { id: '3', title: 'Statistics & Probability' }
  ]

  const handleAddMaterial = () => {
    if (!newMaterial.title.trim()) {
      toast.error('Please enter a title for the material')
      return
    }

    const material = {
      id: Date.now(),
      ...newMaterial,
      uploadDate: new Date().toISOString()
    }

    setMaterials([...materials, material])
    setNewMaterial({
      type: 'document',
      title: '',
      description: '',
      url: '',
      file: null
    })
    toast.success('Material added successfully!')
  }

  const handleRemoveMaterial = (id: number) => {
    setMaterials(materials.filter(m => m.id !== id))
    toast.success('Material removed')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewMaterial({ ...newMaterial, file })
    }
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-5 h-5 text-red-500" />
      case 'video':
        return <Video className="w-5 h-5 text-blue-500" />
      case 'link':
        return <LinkIcon className="w-5 h-5 text-green-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Upload Course Materials</h1>
            <p className="text-gray-600">Add documents, videos, and links to enhance your courses</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Add New Material</CardTitle>
                <CardDescription>
                  Upload documents, videos, or add external links for your students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Course Selection */}
                <div className="space-y-2">
                  <Label htmlFor="course">Select Course</Label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Material Type */}
                <div className="space-y-2">
                  <Label>Material Type</Label>
                  <Tabs 
                    value={newMaterial.type} 
                    onValueChange={(value) => setNewMaterial({...newMaterial, type: value})}
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="document">Document</TabsTrigger>
                      <TabsTrigger value="video">Video</TabsTrigger>
                      <TabsTrigger value="link">Link</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="document" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="file">Upload Document</Label>
                        <Input 
                          id="file" 
                          type="file" 
                          accept=".pdf,.doc,.docx,.ppt,.pptx"
                          onChange={handleFileChange}
                        />
                        <p className="text-xs text-gray-500">
                          Supported formats: PDF, DOC, DOCX, PPT, PPTX (Max 10MB)
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="video" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="video-file">Upload Video</Label>
                        <Input 
                          id="video-file" 
                          type="file" 
                          accept=".mp4,.mov,.avi,.wmv"
                          onChange={handleFileChange}
                        />
                        <p className="text-xs text-gray-500">
                          Supported formats: MP4, MOV, AVI, WMV (Max 100MB)
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="link" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="url">External Link</Label>
                        <Input 
                          id="url" 
                          type="url" 
                          placeholder="https://example.com"
                          value={newMaterial.url}
                          onChange={(e) => setNewMaterial({...newMaterial, url: e.target.value})}
                        />
                        <p className="text-xs text-gray-500">
                          Add links to external resources, websites, or tools
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Material Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Material Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter material title"
                      value={newMaterial.title}
                      onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Add a description for this material"
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleAddMaterial} 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Material
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview & Materials List */}
          <div className="space-y-6">
            {/* Upload Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Materials Added</span>
                  <Badge variant="secondary">{materials.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Selected Course</span>
                  <span className="text-sm text-gray-600">
                    {selectedCourse ? courses.find(c => c.id === selectedCourse)?.title : 'None'}
                  </span>
                </div>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  disabled={!selectedCourse || materials.length === 0}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Materials
                </Button>
              </CardContent>
            </Card>

            {/* Recent Materials */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Added Materials</CardTitle>
              </CardHeader>
              <CardContent>
                {materials.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No materials added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <div key={material.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        {getIconForType(material.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{material.title}</h4>
                          <p className="text-xs text-gray-500 capitalize">{material.type}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleRemoveMaterial(material.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}