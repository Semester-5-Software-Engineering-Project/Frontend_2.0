'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ModuleApi, CreateModuleRequest } from '@/apis/ModuleApi';
import { DomainApi, DomainDto } from '@/apis/DomainApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Validation schema for module creation
const moduleSchema = z.object({
  name: z.string()
    .min(1, 'Module name is required')
    .min(3, 'Module name must be at least 3 characters')
    .max(100, 'Module name must be less than 100 characters'),
  domain: z.string()
    .min(1, 'Domain is required'),
  fee: z.number()
    .positive('Fee must be a positive number')
    .min(0.01, 'Fee must be at least Rs. 0.01')
    .max(99999.99, 'Fee must be less than Rs. 100,000'),
  duration: z.number()
    .positive('Duration must be a positive number')
    .min(15, 'Duration must be at least 15 minutes')
    .max(2400, 'Duration must be less than 40 hours (2400 minutes)'),
  status: z.enum(['Active', 'Inactive', 'Draft'], {
    required_error: 'Status is required',
  }),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

interface ModuleCreationProps {
  onSuccess?: (module: any) => void;
  onCancel?: () => void;
  initialData?: Partial<ModuleFormData>;
}

export default function ModuleCreation({ 
  onSuccess, 
  onCancel, 
  initialData 
}: ModuleCreationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [createdModule, setCreatedModule] = useState<any>(null);
  const [domains, setDomains] = useState<DomainDto[]>([]);
  const [domainsLoading, setDomainsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch domains on component mount
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setDomainsLoading(true);
        const fetchedDomains = await DomainApi.getAllDomains();
        setDomains(fetchedDomains);
      } catch (err: any) {
        console.error('Error fetching domains:', err);
        toast({
          title: 'Error',
          description: 'Failed to load domains. Please refresh the page.',
          variant: 'destructive',
        });
      } finally {
        setDomainsLoading(false);
      }
    };

    fetchDomains();
  }, [toast]);

  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: initialData?.name || '',
      domain: initialData?.domain || '',
      fee: initialData?.fee || 0,
      duration: initialData?.duration || 60,
      status: initialData?.status || 'Active',
    },
  });

  const onSubmit = async (data: ModuleFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('Submitting module data:', data);
      
      // Prepare data for API - send numeric duration directly
      const moduleData: CreateModuleRequest = {
        name: data.name,
        domain: data.domain, // This will be the domain name
        fee: data.fee,
        duration: data.duration, // Send numeric value (minutes)
        status: data.status,
      };

      const response = await ModuleApi.createModule(moduleData);
      console.log('Module created successfully:', response);
      setSuccess(true);
      setCreatedModule(moduleData);
      
      // Small delay to ensure state is set before showing popup
      setTimeout(() => {
        setShowSuccessPopup(true);
      }, 100);
      
      toast({
        title: '🎉 Success!',
        description: `Module "${data.name}" has been created successfully.`,
        duration: 5000,
      });

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess({ ...moduleData, message: response });
      }

      // Don't reset form immediately - let user choose when to reset

    } catch (err: any) {
      console.error('Error creating module:', err);
      
      let errorMessage = 'Failed to create module. Please try again.';
      
      if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(value);
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto border-none shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black rounded-t-xl">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
          {success ? (
            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-black/20 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-black" />
            </div>
          )}
          Create New Module
        </CardTitle>
        <CardDescription className="text-black/80 text-base">
          Add a new learning module to your course catalog. Fill in all required information below.
          {domainsLoading && (
            <span className="block text-sm font-semibold mt-2 text-black/70">
              ⏳ Loading available domains...
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 p-8">
        {error && (
          <Alert variant="destructive" className="border-red-300 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-300 bg-green-50 shadow-md">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-2">
                <div className="font-bold text-lg">Module created successfully! 🎉</div>
                <div className="text-sm font-medium">
                  Your module is now available in the catalog. You can create another module or close this form.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Module Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-bold text-gray-800">Module Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Linear Algebra 101"
                      {...field}
                      disabled={isLoading}
                      className="h-12 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24] text-base"
                    />
                  </FormControl>
                  <FormDescription className="text-gray-600">
                    Enter a descriptive name for your module
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Domain */}
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-bold text-gray-800">Domain *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading || domainsLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24] text-base">
                        <SelectValue 
                          placeholder={domainsLoading ? "Loading domains..." : "Select a domain"} 
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {domainsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading domains...
                        </SelectItem>
                      ) : domains.length === 0 ? (
                        <SelectItem value="no-domains" disabled>
                          No domains available
                        </SelectItem>
                      ) : (
                        domains.map((domain) => (
                          <SelectItem key={domain.domainId} value={domain.name}>
                            {domain.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-gray-600">
                    Choose the subject area for this module
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fee and Duration Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fee */}
              <FormField
                control={form.control}
                name="fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-bold text-gray-800">Fee (LKR) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="99999.99"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        disabled={isLoading}
                        className="h-12 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24] text-base"
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value > 0 && (
                        <span className="text-sm font-bold text-[#FBBF24]">
                          {formatCurrency(field.value)}
                        </span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-bold text-gray-800">Duration (minutes) *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Enter duration in minutes"
                          min="15"
                          max="2400"
                          step="15"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          disabled={isLoading}
                          className="h-12 pr-20 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24] text-base"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-sm font-semibold text-gray-600">min</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {field.value > 0 && (
                        <span className="text-sm font-bold text-blue-600">
                          Duration: {field.value} minutes ({Math.floor(field.value / 60)}h {field.value % 60}m)
                        </span>
                      )}
                      <span className="block text-xs text-gray-500 mt-1">
                        Range: 15 minutes to 40 hours (2400 minutes)
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-bold text-gray-800">Status *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24] text-base">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Draft">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-gray-400" />
                          <span className="font-medium">Draft</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Active">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                          <span className="font-medium">Active</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Inactive">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-red-500" />
                          <span className="font-medium">Inactive</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-gray-600">
                    Set the availability status for this module
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex gap-4 pt-6">
              {success ? (
                <Button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setError(null);
                    form.reset({
                      name: '',
                      domain: '',
                      fee: 0,
                      duration: 60,
                      status: 'Draft',
                    });
                  }}
                  className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-base"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Create Another Module
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading || domainsLoading}
                  className="flex-1 h-12 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-bold text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Module...
                    </>
                  ) : domainsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Create Module'
                  )}
                </Button>
              )}
              
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading || domainsLoading}
                  className="h-12 font-semibold border-gray-300 hover:bg-gray-100"
                >
                  {success ? 'Close' : 'Cancel'}
                </Button>
              )}
            </div>
          </form>
        </Form>

        {/* Module Preview (when form is filled) */}
        {form.watch('name') && form.watch('domain') && (
          <div className="mt-6 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-[#FBBF24] shadow-md">
            <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FBBF24] animate-pulse"></span>
              Preview:
            </h4>
            <div className="text-sm space-y-3">
              <p className="flex justify-between">
                <span className="font-bold text-gray-700">Name:</span> 
                <span className="text-gray-900 font-semibold">{form.watch('name')}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-bold text-gray-700">Domain:</span> 
                <span className="text-gray-900 font-semibold">{form.watch('domain')}</span>
              </p>
              {form.watch('fee') > 0 && (
                <p className="flex justify-between">
                  <span className="font-bold text-gray-700">Fee:</span> 
                  <span className="text-[#FBBF24] font-bold text-base">{formatCurrency(form.watch('fee'))}</span>
                </p>
              )}
              {form.watch('duration') && (
                <p className="flex justify-between">
                  <span className="font-bold text-gray-700">Duration:</span> 
                  <span className="text-blue-600 font-semibold">{form.watch('duration')} minutes ({Math.floor(form.watch('duration') / 60)}h {form.watch('duration') % 60}m)</span>
                </p>
              )}
              <p className="flex justify-between items-center">
                <span className="font-bold text-gray-700">Status:</span> 
                <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                  form.watch('status') === 'Active' ? 'bg-green-100 text-green-700' :
                  form.watch('status') === 'Inactive' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {form.watch('status')}
                </span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Success Popup Modal - Custom Overlay */}
    {showSuccessPopup && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Background Overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm"></div>
        
        {/* Modal Content */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 z-10 border-4 border-[#FBBF24]">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-4 shadow-lg">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              🎉 Success!
            </h2>
            <p className="text-xl text-green-600 font-bold">
              Module Created Successfully!
            </p>
          </div>
          
          {/* Module Details */}
          {createdModule && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-[#FBBF24] mb-6 shadow-md">
              <h4 className="font-bold text-gray-900 mb-4 text-center text-lg">Module Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">Name:</span>
                  <span className="text-gray-900 font-semibold">{createdModule.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">Domain:</span>
                  <span className="text-gray-900 font-semibold">{createdModule.domain}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">Fee:</span>
                  <span className="text-[#FBBF24] font-bold text-base">{formatCurrency(createdModule.fee)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">Duration:</span>
                  <span className="text-blue-600 font-semibold">{createdModule.duration} min ({Math.floor(createdModule.duration / 60)}h {createdModule.duration % 60}m)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">Status:</span>
                  <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                    createdModule.status === 'Active' ? 'bg-green-100 text-green-700' :
                    createdModule.status === 'Inactive' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {createdModule.status}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Success Message */}
          <div className="text-center text-gray-700 font-medium mb-6">
            Your module is now live and ready for students to enroll!
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                setShowSuccessPopup(false);
                setSuccess(false);
                setError(null);
                setCreatedModule(null);
                form.reset({
                  name: '',
                  domain: '',
                  fee: 0,
                  duration: 60,
                  status: 'Draft',
                });
              }}
              className="bg-green-600 hover:bg-green-700 text-white py-3 w-full h-12 font-bold text-base shadow-lg"
              size="lg"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Create Another Module
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessPopup(false);
                if (onCancel) onCancel();
              }}
              size="lg"
              className="py-3 w-full h-12 font-bold border-2 border-gray-300 hover:bg-gray-100"
            >
              Close & Exit
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}