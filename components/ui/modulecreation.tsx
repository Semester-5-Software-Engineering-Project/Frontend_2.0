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
    .min(0.01, 'Fee must be at least $0.01')
    .max(99999.99, 'Fee must be less than $100,000'),
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
      status: initialData?.status || 'Draft',
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {success ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
          )}
          Create New Module
        </CardTitle>
        <CardDescription>
          Add a new learning module to your course catalog. Fill in all required information below.
          {domainsLoading && (
            <span className="block text-sm text-muted-foreground mt-1">
              Loading available domains...
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-1">
                <div className="font-medium">Module created successfully! 🎉</div>
                <div className="text-sm">
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
                  <FormLabel>Module Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Linear Algebra 101"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
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
                  <FormLabel>Domain *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading || domainsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
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
                  <FormDescription>
                    Choose the subject area for this module
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fee and Duration Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fee */}
              <FormField
                control={form.control}
                name="fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee (USD) *</FormLabel>
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
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value > 0 && (
                        <span className="text-sm font-medium">
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
                    <FormLabel>Duration (minutes) *</FormLabel>
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
                          className="pr-20"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-sm text-muted-foreground">min</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {field.value > 0 && (
                        <span className="text-sm">
                          Duration: {field.value} minutes ({Math.floor(field.value / 60)}h {field.value % 60}m)
                        </span>
                      )}
                      <span className="block text-xs text-muted-foreground mt-1">
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
                  <FormLabel>Status *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Draft">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-gray-400" />
                          Draft
                        </div>
                      </SelectItem>
                      <SelectItem value="Active">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="Inactive">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          Inactive
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Set the availability status for this module
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex gap-3 pt-6">
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
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Create Another Module
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading || domainsLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Module...
                    </>
                  ) : domainsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                >
                  {success ? 'Close' : 'Cancel'}
                </Button>
              )}
            </div>
          </form>
        </Form>

        {/* Module Preview (when form is filled) */}
        {form.watch('name') && form.watch('domain') && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Preview:</h4>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Name:</span> {form.watch('name')}</p>
              <p><span className="font-medium">Domain:</span> {form.watch('domain')}</p>
              {form.watch('fee') > 0 && (
                <p><span className="font-medium">Fee:</span> {formatCurrency(form.watch('fee'))}</p>
              )}
              {form.watch('duration') && (
                <p><span className="font-medium">Duration:</span> {form.watch('duration')} minutes ({Math.floor(form.watch('duration') / 60)}h {form.watch('duration') % 60}m)</p>
              )}
              <p><span className="font-medium">Status:</span> {form.watch('status')}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Success Popup Modal - Custom Overlay */}
    {showSuccessPopup && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Background Overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50"></div>
        
        {/* Modal Content */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 z-10">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              🎉 Success!
            </h2>
            <p className="text-lg text-green-700 font-medium">
              Module Created Successfully!
            </p>
          </div>
          
          {/* Module Details */}
          {createdModule && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
              <h4 className="font-semibold text-green-900 mb-3 text-center">Module Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-green-800">Name:</span>
                  <span className="text-green-700">{createdModule.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-green-800">Domain:</span>
                  <span className="text-green-700">{createdModule.domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-green-800">Fee:</span>
                  <span className="text-green-700">{formatCurrency(createdModule.fee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-green-800">Duration:</span>
                  <span className="text-green-700">{createdModule.duration} min ({Math.floor(createdModule.duration / 60)}h {createdModule.duration % 60}m)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-green-800">Status:</span>
                  <span className="text-green-700">{createdModule.status}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Success Message */}
          <div className="text-center text-gray-600 mb-6">
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
              className="bg-green-600 hover:bg-green-700 text-white py-3 w-full"
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
              className="py-3 w-full"
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