// services/api.ts
import axiosInstance from "@/app/utils/axiosInstance";
import {
  // Auth types
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  GetUserResponse,
  LogoutResponse,
  
  // Module types
  CreateModuleRequest,
  CreateModuleResponse,
  GetAllModulesResponse,
  GetModulesByDomainRequest,
  GetModulesByDomainResponse,
  GetModulesByTutorResponse,
  SearchModulesRequest,
  SearchModulesResponse,
  DeleteModuleRequest,
  DeleteModuleResponse,
  Module,
  
  // Enrollment types
  EnrollRequest,
  EnrollResponse,
  GetEnrollmentsResponse,
  UnenrollRequest,
  UnenrollResponse,
  
  // Student Profile types
  CreateStudentProfileRequest,
  CreateStudentProfileResponse,
  GetStudentProfileResponse,
  UpdateStudentProfileRequest,
  UpdateStudentProfileResponse,
  DeleteStudentProfileResponse,
  ChangeStudentPasswordRequest,
  ChangeStudentPasswordResponse,
  
  // Tutor Profile types
  CreateTutorProfileRequest,
  CreateTutorProfileResponse,
  GetTutorProfileResponse,
  UpdateTutorProfileRequest,
  UpdateTutorProfileResponse,
  DeleteTutorProfileResponse,
  ChangeTutorPasswordRequest,
  ChangeTutorPasswordResponse,
  GetAllTutorProfilesResponse,
  SearchTutorProfilesRequest,
  SearchTutorProfilesResponse,
  
  // Domain types
  CreateDomainRequest,
  CreateDomainResponse,
  GetAllDomainsResponse,
  DeleteDomainRequest,
  DeleteDomainResponse,
  
  // Materials types
  Material,
  GetMaterialsRequest,
  GetMaterialsResponse,
  UploadMaterialRequest,
  UploadMaterialResponse,
  UploadImageRequest,
  UploadImageResponse,
  
  // Meeting types
  JoinMeetingRequest,
  JoinMeetingResponse,
  CreateMeetingRequest,
  CreateMeetingResponse,
  
  // Schedule types
  CreateScheduleRequest,
  CreateScheduleResponse,
  GetSchedulesRequest,
  GetSchedulesResponse,
  UpdateScheduleRequest,
  UpdateScheduleResponse,
  DeleteScheduleRequest,
  DeleteScheduleResponse,
  
  // Common types
  UserType,
  UpcomingSessionsRequest,
  UpcomingSessionResponse,
} from "@/types/api";

// =====================================================================
// AUTHENTICATION API
// =====================================================================

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>("/api/auth/login", { email, password }, { withCredentials: true });
  return response.data;
};

export const checkProfile = async (): Promise<{
  hasTutorProfile: boolean;
  userId: string;
  hasStudentProfile: boolean;
  hasAnyProfile: boolean;
}> => {
  const response = await axiosInstance.get<{
    hasTutorProfile: boolean;
    userId: string;
    hasStudentProfile: boolean;
    hasAnyProfile: boolean;
  }>("/api/profile-status", { withCredentials: true });
  return response.data;
};

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await axiosInstance.post<RegisterResponse>("/api/register", data, { withCredentials: true });
  return response.data;
};

export const getUser = async (): Promise<GetUserResponse> => {
  const response = await axiosInstance.get<GetUserResponse>("/api/getuser", { withCredentials: true });
  return response.data;
};

export const logout = async (): Promise<LogoutResponse> => {
  const response = await axiosInstance.get<LogoutResponse>("/api/logout", { withCredentials: true });
  return response.data;
};

export const googleLogin = (role?: UserType): void => {
  const redirectUrl = encodeURIComponent(`${window.location.origin}/dashboard`);
  const roleParam = role ? `/${role}` : '';
  window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/login${roleParam}?redirect_uri=${redirectUrl}`;
};

// =====================================================================
// MODULE API
// =====================================================================

export const getAllModules = async (): Promise<Module[]> => {
  const response = await axiosInstance.get<Module[]>("/api/modules");
  return response.data;
};

export const getModulesByDomain = async (domainId: number): Promise<Module[]> => {
  const response = await axiosInstance.get<Module[]>(`/api/modules/domain/${domainId}`);
  return response.data;
};

export const getModulesForTutor = async (): Promise<Module[]> => {
  const response = await axiosInstance.get<Module[]>("/api/modules/get-modulesfortutor");
  return response.data;
};

export const getTotalRevenueForTutor = async (): Promise<number> => {
  const response = await axiosInstance.get<number>("/api/payments/totalEarningsForTutor");
  return response.data;
};

export const getModulesByTutorId = async (): Promise<Module[]> => {
  const response = await axiosInstance.get<Module[]>("/api/modules/tutor");
  return response.data;
};

export const createModule = async (data: CreateModuleRequest): Promise<CreateModuleResponse> => {
  const response = await axiosInstance.post<CreateModuleResponse>("/api/modules/create", data);
  return response.data;
};

export const deleteModule = async (moduleId: string): Promise<DeleteModuleResponse> => {
  await axiosInstance.delete(`/api/modules/delete/${moduleId}`);
  return { success: true, message: "Module deleted successfully" };
};

export const searchModules = async (query: string): Promise<Module[]> => {
  const response = await axiosInstance.get<Module[]>("/api/modules/search", {
    params: { query }
  });
  return response.data;
};

export const getAllModulesPublic = async (): Promise<Module[]> => {
  const response = await axiosInstance.get<Module[]>("/api/modules");
  return response.data;
};

// Get recommended modules by domain (backend picks based on user + domain)
export const getRecommendedModules = async (domain: string): Promise<Module[]> => {
  const response = await axiosInstance.get<Module[]>("/api/modules/recommendedmodules", {
    params: { domain },
  });
  return response.data;
};

// =====================================================================
// ENROLLMENT API
// =====================================================================

export const enrollInModule = async (data: EnrollRequest): Promise<EnrollResponse> => {
  const response = await axiosInstance.post<EnrollResponse>("/api/enrollment/enroll", data, {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
  });
  return response.data;
};

export const getEnrollments = async (): Promise<any[]> => {
  const response = await axiosInstance.get<any[]>("/api/enrollment/get-enrollments");
  return response.data;
};

export const unenrollFromModule = async (data: UnenrollRequest): Promise<UnenrollResponse> => {
  const response = await axiosInstance.post<UnenrollResponse>("/api/enrollment/unenroll", data);
  return response.data;
};

// =====================================================================
// STUDENT PROFILE API
// =====================================================================

export const createStudentProfile = async (data: CreateStudentProfileRequest): Promise<CreateStudentProfileResponse> => {
  const response = await axiosInstance.post<CreateStudentProfileResponse>("/api/student-profile", data);
  return response.data;
};

export const getStudentProfile = async (): Promise<GetStudentProfileResponse> => {
  const response = await axiosInstance.get<GetStudentProfileResponse>("/api/student-profile/me");
  return response.data;
};

export const updateStudentProfile = async (data: UpdateStudentProfileRequest): Promise<UpdateStudentProfileResponse> => {
  const response = await axiosInstance.put<UpdateStudentProfileResponse>("/api/student-profile", data);
  return response.data;
};

export const deleteStudentProfile = async (): Promise<DeleteStudentProfileResponse> => {
  await axiosInstance.delete("/api/student-profile");
  return { success: true, message: "Student profile deleted successfully" };
};

export const changeStudentPassword = async (data: ChangeStudentPasswordRequest): Promise<ChangeStudentPasswordResponse> => {
  await axiosInstance.put("/api/student-profile/change-password", data);
  return { success: true, message: "Password changed successfully" };
};

// =====================================================================
// TUTOR PROFILE API
// =====================================================================

export const createTutorProfile = async (data: CreateTutorProfileRequest): Promise<CreateTutorProfileResponse> => {
  const response = await axiosInstance.post<CreateTutorProfileResponse>("/api/tutor-profile", data);
  return response.data;
};

export const getTutorProfile = async (): Promise<GetTutorProfileResponse> => {
  const response = await axiosInstance.get<GetTutorProfileResponse>("/api/tutor-profile/me");
  return response.data;
};

export const updateTutorProfile = async (data: UpdateTutorProfileRequest): Promise<UpdateTutorProfileResponse> => {
  const response = await axiosInstance.put<UpdateTutorProfileResponse>("/api/tutor-profile", data);
  return response.data;
};

export const deleteTutorProfile = async (): Promise<DeleteTutorProfileResponse> => {
  await axiosInstance.delete("/api/tutor-profile");
  return { success: true, message: "Tutor profile deleted successfully" };
};

export const changeTutorPassword = async (data: ChangeTutorPasswordRequest): Promise<ChangeTutorPasswordResponse> => {
  await axiosInstance.put("/api/tutor-profile/change-password", data);
  return { success: true, message: "Password changed successfully" };
};

export const getAllTutorProfiles = async (): Promise<GetAllTutorProfilesResponse> => {
  const response = await axiosInstance.get<GetAllTutorProfilesResponse>("/api/tutor-profile/all");
  return response.data;
};

export const searchTutorProfiles = async (query: string): Promise<SearchTutorProfilesResponse> => {
  const response = await axiosInstance.get<SearchTutorProfilesResponse>("/api/tutor-profile/search", {
    params: { query }
  });
  return response.data;
};

// =====================================================================
// DOMAIN API
// =====================================================================

export const getAllDomains = async (): Promise<GetAllDomainsResponse> => {
  const response = await axiosInstance.get<GetAllDomainsResponse>("/api/domains/all");
  return response.data;
};

export const createDomain = async (data: CreateDomainRequest): Promise<CreateDomainResponse> => {
  const response = await axiosInstance.post<CreateDomainResponse>("/api/domains/create", data);
  return response.data;
};

export const deleteDomain = async (domainId: number): Promise<DeleteDomainResponse> => {
  await axiosInstance.delete(`/api/domains/delete/${domainId}`);
  return { success: true, message: "Domain deleted successfully" };
};

// =====================================================================
// MATERIALS API
// =====================================================================

export const getMaterials = async (moduleId: string): Promise<Material[]> => {
  const response = await axiosInstance.get<Material[]>(`/api/materials/fetchAll?module_id=${moduleId}`);
  return response.data;
};

export const uploadMaterial = async (data: FormData): Promise<UploadMaterialResponse> => {
  const response = await axiosInstance.post<UploadMaterialResponse>("/api/materials/upload", data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadImage = async (data: FormData): Promise<UploadImageResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/materials/upload/image`, {
    method: 'POST',
    body: data,
    credentials: 'include',
  });
  const result = await response.json();
  return result;
};

// =====================================================================
// MEETING API
// =====================================================================

export const joinMeeting = async (data: JoinMeetingRequest): Promise<JoinMeetingResponse> => {
  const response = await axiosInstance.post<JoinMeetingResponse>("/api/meeting/join", data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const createMeet = async (): Promise<CreateMeetingResponse> => {
  const response = await axiosInstance.post<CreateMeetingResponse>("/create/meet", {}, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

// =====================================================================
// SCHEDULE API
// =====================================================================

export const createSchedule = async (data: CreateScheduleRequest): Promise<CreateScheduleResponse> => {
  const response = await axiosInstance.post<CreateScheduleResponse>("/api/schedules/create", data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const upcomingSchedulesByTutor = async (req_data: UpcomingSessionsRequest): Promise<UpcomingSessionResponse> => {
  const response = await axiosInstance.post<UpcomingSessionResponse>("/api/schedules/upcoming-by-tutor", req_data
  );
  return response.data;
};

export const upcomingSchedulesByStudent = async (req_data: UpcomingSessionsRequest): Promise<UpcomingSessionResponse> => {
  const response = await axiosInstance.post<UpcomingSessionResponse>("/api/schedules/upcoming-by-student", req_data);
  return response.data;
};

export const upcomingSchedulesByModule = async (req_data: UpcomingSessionsRequest): Promise<UpcomingSessionResponse> => {
  const response = await axiosInstance.post<UpcomingSessionResponse>("/api/schedules/upcoming-by-module", req_data);
  return response.data;
};

export const getSchedules = async (params?: GetSchedulesRequest): Promise<GetSchedulesResponse> => {
  const response = await axiosInstance.get<GetSchedulesResponse>("/api/schedules", {
    params
  });
  return response.data;
};

export const updateSchedule = async (data: UpdateScheduleRequest): Promise<UpdateScheduleResponse> => {
  const response = await axiosInstance.put<UpdateScheduleResponse>(`/api/schedules/${data.id}`, data);
  return response.data;
};

export const deleteSchedule = async (id: string): Promise<DeleteScheduleResponse> => {
  await axiosInstance.delete(`/api/schedules/${id}`);
  return { success: true, message: "Schedule deleted successfully" };
};

// =====================================================================
// ERROR HANDLING UTILITIES
// =====================================================================

export const handleApiError = (error: any): never => {
  if (error?.response) {
    const message = error.response.data?.message || error.response.data || `Request failed (${error.response.status})`;
    throw new Error(message);
  }
  throw new Error(error?.message || 'Network error');
};

// =====================================================================
// EXPORT DEFAULT API OBJECT (Optional alternative usage pattern)
// =====================================================================

export const api = {
  // Auth
  auth: {
    login,
    register,
    getUser,
    logout,
    googleLogin,
  },
  
  // Modules
  modules: {
    getAll: getAllModules,
    getByDomain: getModulesByDomain,
    getForTutor: getModulesForTutor,
    getByTutorId: getModulesByTutorId,
    create: createModule,
    delete: deleteModule,
    search: searchModules,
    getAllPublic: getAllModulesPublic,
    getRecommended: getRecommendedModules,
  },
  
  // Enrollment
  enrollment: {
    enroll: enrollInModule,
    getEnrollments,
    unenroll: unenrollFromModule,
  },
  
  // Profiles
  student: {
    create: createStudentProfile,
    get: getStudentProfile,
    update: updateStudentProfile,
    delete: deleteStudentProfile,
    changePassword: changeStudentPassword,
  },
  
  tutor: {
    create: createTutorProfile,
    get: getTutorProfile,
    update: updateTutorProfile,
    delete: deleteTutorProfile,
    changePassword: changeTutorPassword,
    getAll: getAllTutorProfiles,
    search: searchTutorProfiles,
  },
  
  // Domains
  domains: {
    getAll: getAllDomains,
    create: createDomain,
    delete: deleteDomain,
  },
  
  // Materials
  materials: {
    get: getMaterials,
    upload: uploadMaterial,
    uploadImage,
  },
  
  // Meetings
  meetings: {
    join: joinMeeting,
    create: createMeet,
  },
  
  // Schedules
  schedules: {
    create: createSchedule,
    get: getSchedules,
    update: updateSchedule,
    delete: deleteSchedule,
  },
};

export default api;
