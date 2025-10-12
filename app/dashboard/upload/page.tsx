'use client'
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
import { uploadMaterial, getModulesByTutorId } from '@/services/api'

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

  useEffect(() => {
    const fetchModules = async () => {
      if (!user || user.role !== 'TUTOR') return;

      try {
        const data = await getModulesByTutorId();
        console.log("Fetched modules:", data);
     
        // The service returns Module[] directly
        setModules(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setModules([]);
        toast.error("Failed to load modules");
      }
    };

    fetchModules();
  }, [user]);



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

      await uploadMaterial(formData)
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
      return <FileText className="w-6 h-6 text-red-500" />
    case 'Video':
      return <Video className="w-6 h-6 text-blue-500" />
    case 'Link':
      return <LinkIcon className="w-6 h-6 text-green-500" />
    default:
      return <FileText className="w-6 h-6 text-gray-500" />
  }
}

  if (user?.role !== 'TUTOR') {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert variant="destructive" className="max-w-2xl border-red-300 bg-red-50 shadow-lg">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <AlertTitle className="font-bold text-lg">Access restricted</AlertTitle>
            <AlertDescription className="text-red-800 font-medium">
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
        <div className=" rounded-2xl p-8">
          <h1 className="text-4xl font-bold text-[#000000]">Upload Course Materials</h1>
          <p className="text-black/80 mt-2 text-lg">Add documents, videos, and links to your courses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black rounded-t-xl">
                <CardTitle className="text-2xl font-bold">Add New Material</CardTitle>
                <CardDescription className="text-black/80 text-base">Upload documents, videos, or add links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                {/* Course Selection */}
                <div className="space-y-3">
                  <Label htmlFor="course" className="text-base font-bold text-gray-800">Select Course *</Label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="h-12 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24] text-base">
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
                <div className="space-y-3">
                  <Label className="text-base font-bold text-gray-800">Material Type</Label>
                  <Tabs 
                    value={newMaterial.type} 
                    onValueChange={(value) => setNewMaterial({...newMaterial, type: value})}
                  >
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
                      <TabsTrigger value="Document" className="data-[state=active]:bg-[#FBBF24] data-[state=active]:text-black font-semibold">Document</TabsTrigger>
                      <TabsTrigger value="Video" className="data-[state=active]:bg-[#FBBF24] data-[state=active]:text-black font-semibold">Video</TabsTrigger>
                      <TabsTrigger value="Link" className="data-[state=active]:bg-[#FBBF24] data-[state=active]:text-black font-semibold">Link</TabsTrigger>
                    </TabsList>

                    <TabsContent value="Document" className="mt-4">
                      <Label className="text-sm font-semibold text-gray-700">Upload Document</Label>
                      <Input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={handleFileChange} className="mt-2 h-11 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]" />
                    </TabsContent>

                    <TabsContent value="Video" className="mt-4">
                      <Label className="text-sm font-semibold text-gray-700">Upload Video</Label>
                      <Input type="file" accept=".mp4,.mov,.avi,.wmv" onChange={handleFileChange} className="mt-2 h-11 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]" />
                    </TabsContent>

                    <TabsContent value="Link" className="mt-4">
                      <Label className="text-sm font-semibold text-gray-700">External Link</Label>
                      <Input 
                        type="url" 
                        placeholder="https://example.com"
                        value={newMaterial.url}
                        onChange={(e) => setNewMaterial({...newMaterial, url: e.target.value})}
                        className="mt-2 h-11 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Material Details */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-base font-bold text-gray-800">Material Title *</Label>
                    <Input 
                      id="title"
                      value={newMaterial.title}
                      onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                      placeholder="Enter material title"
                      className="mt-2 h-12 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24] text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-bold text-gray-800">Description</Label>
                    <Textarea 
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                      placeholder="Enter material description (optional)"
                      className="mt-2 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
                      rows={4}
                    />
                  </div>
                </div>

                <Button onClick={handleAddMaterial} className="w-full h-12 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-bold text-base">
                  <Plus className="w-5 h-5 mr-2" /> Add Material
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-white rounded-t-xl">
                <CardTitle className="text-xl font-bold  text-black">Upload Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-bold">Materials Added</span>
                  <Badge className="bg-[#FBBF24] text-black font-bold text-base px-3 py-1">{materials.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-bold">Selected Course</span>
                  <span className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
                    {selectedCourse ? modules.find(m => m.moduleId === selectedCourse)?.name : 'None'}
                  </span>
                </div>
                <Button 
                  onClick={handleSaveAll}
                  disabled={!selectedCourse || materials.length === 0}
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5 mr-2" /> Save Materials
                </Button>
              </CardContent>
            </Card>

            {/* Recent Materials */}
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-white rounded-t-xl">
                <CardTitle className="text-xl font-bold text-black">Added Materials</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {materials.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No materials added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materials.map((m) => (
                      <div key={m.id} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-[#FBBF24] transition-all bg-white">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          m.type === 'Document' ? 'bg-red-50' :
                          m.type === 'Video' ? 'bg-blue-50' :
                          'bg-green-50'
                        }`}>
                          {getIconForType(m.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-gray-900">{m.title}</h4>
                          <p className="text-xs text-gray-500 capitalize mt-1">{m.type}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveMaterial(m.id)} className="hover:bg-red-50">
                          <Trash2 className="w-5 h-5 text-red-500" />
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
