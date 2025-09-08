'use client'
import Cookies from "js-cookie";
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, FileText, Video, Link as LinkIcon, Trash2, Plus, Save } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

export default function UploadMaterials() {
  const { user } = useAuth() // make sure your AuthContext provides JWT token
  const [modules, setModules] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  console.log('Selected Course:', selectedCourse)
  const [materials, setMaterials] = useState<any[]>([])
  const [newMaterial, setNewMaterial] = useState({
    type: 'Document',
    title: '',
    description: '',
    url: '',
    file: null as File | null
  })

  const token = Cookies.get('jwt_token');

  useEffect(() => {
    const fetchModules = async () => {
      if (!user || user.role !== 'TUTOR') return;

      try {
        const res = await fetch("http://localhost:8080/api/modules/tutor", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("Fetched modules:", data);
     
        if (Array.isArray(data)) {
          setModules(data);
        } else if (Array.isArray(data.modules)) {
          setModules(data.modules);
        } else if (Array.isArray(data.data)) {
          setModules(data.data);
        } else {
          setModules([]);
        }
      } catch (err) {
        console.error(err);
        setModules([]);
        toast.error("Failed to load modules");
      }
    };

    fetchModules();
  }, [user, token]);



  const handleAddMaterial = () => {
    if (!newMaterial.title.trim()) {
      toast.error('Please enter a title for the material')
      return
    }
    if (!selectedCourse) {
      toast.error('Please select a course')
      return
    }

    const material = {
      id: Date.now(),
      ...newMaterial,
      uploadDate: new Date().toISOString()
    }

    setMaterials([...materials, material])
    setNewMaterial({
      type: 'Document',
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

  const handleSaveAll = async () => {
  try {
    for (const material of materials) {
      const formData = new FormData()
      formData.append('module_id', selectedCourse)
      formData.append('title', material.title)
      formData.append('description', material.description || '')
      formData.append('type', material.type)

      if (material.type === 'Link') {
        formData.append('link', material.url || '')
      } else if (material.file) {
        formData.append('file', material.file)
      }

      console.log(
        'Uploading material:',
        formData.get('title'),
        formData.get('type'),
        formData.get('module_id'),
        formData.get('link') 
      )

      await axios.post("http://localhost:8080/api/materials/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
    }

    toast.success('All materials uploaded successfully!')
    setMaterials([])
  } catch (err) {
    console.error(err)
    toast.error('Failed to upload materials')
  }

 
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'Document':
      return <FileText className="w-5 h-5 text-red-500" />
    case 'Video':
      return <Video className="w-5 h-5 text-blue-500" />
    case 'Link':
      return <LinkIcon className="w-5 h-5 text-green-500" />
    default:
      return <FileText className="w-5 h-5 text-gray-500" />
  }
}

  if (user?.role !== 'TUTOR') {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert variant="destructive" className="max-w-2xl">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Access restricted</AlertTitle>
            <AlertDescription>
              This page is only available to tutors.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Upload Course Materials</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Add New Material</CardTitle>
                <CardDescription>Upload documents, videos, or add links</CardDescription>
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
                      {Array.isArray(modules) && modules.length > 0 ? (
                        modules.map((mod) => (
                          <SelectItem key={mod.moduleId} value={mod.moduleId}>
                            {mod.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-gray-400">No modules found</div>
                      )}
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
                      <TabsTrigger value="Document">Document</TabsTrigger>
                      <TabsTrigger value="Video">Video</TabsTrigger>
                      <TabsTrigger value="Link">Link</TabsTrigger>
                    </TabsList>

                    <TabsContent value="Document">
                      <Label>Upload Document</Label>
                      <Input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={handleFileChange} />
                    </TabsContent>

                    <TabsContent value="Video">
                      <Label>Upload Video</Label>
                      <Input type="file" accept=".mp4,.mov,.avi,.wmv" onChange={handleFileChange} />
                    </TabsContent>

                    <TabsContent value="Link">
                      <Label>External Link</Label>
                      <Input 
                        type="url" 
                        placeholder="https://example.com"
                        value={newMaterial.url}
                        onChange={(e) => setNewMaterial({...newMaterial, url: e.target.value})}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Material Details */}
                <div className="space-y-2">
                  <Label htmlFor="title">Material Title</Label>
                  <Input 
                    id="title"
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                  />
                  <Label>Description</Label>
                  <Textarea 
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                  />
                </div>

                <Button onClick={handleAddMaterial} className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" /> Add Material
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Upload Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Materials Added</span>
                  <Badge>{materials.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Selected Course</span>
                  <span>{selectedCourse ? modules.find(m => m.moduleId === selectedCourse)?.name : 'None'}</span>
                </div>
                <Button 
                  onClick={handleSaveAll}
                  disabled={!selectedCourse || materials.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" /> Save Materials
                </Button>
              </CardContent>
            </Card>

            {/* Recent Materials */}
            <Card>
              <CardHeader><CardTitle>Added Materials</CardTitle></CardHeader>
              <CardContent>
                {materials.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No materials added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materials.map((m) => (
                      <div key={m.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        {getIconForType(m.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{m.title}</h4>
                          <p className="text-xs text-gray-500 capitalize">{m.type}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveMaterial(m.id)}>
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
