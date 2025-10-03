// types/api.ts

import { UUID } from "node:crypto";

// =====================================================================
// COMMON TYPES
// =====================================================================

export enum UserType {
  STUDENT = 'STUDENT',
  TUTOR = 'TUTOR'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserType;
  avatar?: string;
}

export interface RoleRef {
  id: number;
  name: string;
}

export interface UserEmbedded {
  id: number;
  name: string;
  email: string;
  role: RoleRef;
  enabled: boolean;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  authorities?: any[];
  username?: string;
}

// =====================================================================
// AUTHENTICATION API TYPES
// =====================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserType;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface GetUserResponse {
  user: User;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface GoogleLoginRequest {
  role: UserType;
}

// =====================================================================
// MODULE API TYPES
// =====================================================================

export interface Module {
  moduleId?: string;
  id?: string; // Keep for backward compatibility
  name: string;
  domain: string;
  fee: number;
  duration: number; // minutes
  status: string;
  tutorId?: string;
  averageRatings?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateModuleRequest {
  name: string;
  domain: string;
  fee: number;
  duration: number;
  status: string;
}

export interface CreateModuleResponse {
  message: string;
  moduleId?: string;
}

export interface GetAllModulesResponse {
  modules: Module[];
}

export interface GetModulesByDomainRequest {
  domainId: number;
}

export interface GetModulesByDomainResponse {
  modules: Module[];
}

export interface GetModulesByTutorResponse {
  modules: Module[];
}

export interface SearchModulesRequest {
  query: string;
}

export interface SearchModulesResponse {
  modules: Module[];
}

export interface DeleteModuleRequest {
  moduleId: string;
}

export interface DeleteModuleResponse {
  success: boolean;
  message: string;
}

// =====================================================================
// ENROLLMENT API TYPES
// =====================================================================

export interface Enrollment {
  id?: string;
  studentId: string;
  moduleId: string;
  enrollmentDate?: string;
  status?: string;
  module?: Module;
  student?: User;
}

export interface EnrollRequest {
  moduleId: string;
}

export interface EnrollResponse {
  success: boolean;
  message: string;
  enrollment?: Enrollment;
}

export interface GetEnrollmentsResponse {
  enrollments: Enrollment[];
}

export interface UnenrollRequest {
  moduleId: string;
}

export interface UnenrollResponse {
  success: boolean;
  message: string;
}

// =====================================================================
// STUDENT PROFILE API TYPES
// =====================================================================

export interface StudentProfile {
  id?: string;
  name?: string;
  birthday?: string;
  imageUrl?: string;
  phoneNumber?: string;
  bio?: string;
  isActive?: boolean;
  user?: UserEmbedded;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudentProfileRequest {
  name?: string;
  birthday?: string;
  imageUrl?: string;
  phoneNumber?: string;
  bio?: string;
  isActive?: boolean;
}

export interface CreateStudentProfileResponse {
  profile: StudentProfile;
}

export interface GetStudentProfileResponse {
  profile: StudentProfile;
}

export interface UpdateStudentProfileRequest {
  name?: string;
  birthday?: string;
  imageUrl?: string;
  phoneNumber?: string;
  bio?: string;
  isActive?: boolean;
}

export interface UpdateStudentProfileResponse {
  profile: StudentProfile;
}

export interface DeleteStudentProfileResponse {
  success: boolean;
  message: string;
}

export interface ChangeStudentPasswordRequest {
  newPassword: string;
}

export interface ChangeStudentPasswordResponse {
  success: boolean;
  message: string;
}

// =====================================================================
// TUTOR PROFILE API TYPES
// =====================================================================

export interface TutorProfile {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Legacy support
  birthday?: string;
  imageUrl?: string;
  phoneNumber?: string;
  bio?: string;
  isActive?: boolean;
  averageRating?: number;
  totalRatings?: number;
  hourlyRate?: number;
  specializations?: string[];
  qualifications?: string;
  experience?: string;
  user?: UserEmbedded;
  createdAt?: string;
  updatedAt?: string;
  tutorId?: string;
}

export interface CreateTutorProfileRequest {
  firstName?: string;
  lastName?: string;
  name?: string; // Legacy support
  birthday?: string;
  imageUrl?: string;
  phoneNumber?: string;
  bio?: string;
  isActive?: boolean;
  hourlyRate?: number;
  specializations?: string[];
  qualifications?: string;
  experience?: string;
}

export interface CreateTutorProfileResponse {
  profile: TutorProfile;
}

export interface GetTutorProfileResponse {
  profile: TutorProfile;
}

export interface UpdateTutorProfileRequest {
  firstName?: string;
  lastName?: string;
  name?: string;
  birthday?: string;
  imageUrl?: string;
  phoneNumber?: string;
  bio?: string;
  isActive?: boolean;
  hourlyRate?: number;
  specializations?: string[];
  qualifications?: string;
  experience?: string;
}

export interface UpdateTutorProfileResponse {
  profile: TutorProfile;
}

export interface DeleteTutorProfileResponse {
  success: boolean;
  message: string;
}

export interface ChangeTutorPasswordRequest {
  newPassword: string;
}

export interface ChangeTutorPasswordResponse {
  success: boolean;
  message: string;
}

export interface GetAllTutorProfilesResponse {
  profiles: TutorProfile[];
}

export interface SearchTutorProfilesRequest {
  query: string;
}

export interface SearchTutorProfilesResponse {
  profiles: TutorProfile[];
}

// =====================================================================
// DOMAIN API TYPES
// =====================================================================

export interface Domain {
  domainId?: number;
  name: string;
}

export interface CreateDomainRequest {
  name: string;
}

export interface CreateDomainResponse {
  message: string;
  domainId?: number;
}

export interface GetAllDomainsResponse {
  domains: Domain[];
}

export interface DeleteDomainRequest {
  domainId: number;
}

export interface DeleteDomainResponse {
  success: boolean;
  message: string;
}

// =====================================================================
// MATERIALS API TYPES
// =====================================================================

export interface Material {
  id?: string;
  moduleId: string;
  title: string;
  description?: string;
  type: 'document' | 'video' | 'image' | 'audio' | 'other';
  url: string;
  size?: number;
  uploadedAt?: string;
  uploadedBy?: string;
}

export interface GetMaterialsRequest {
  module_id: string;
}

export interface GetMaterialsResponse {
  materials: Material[];
}

export interface UploadMaterialRequest {
  moduleId: string;
  title: string;
  description?: string;
  type: string;
  file: File;
}

export interface UploadMaterialResponse {
  success: boolean;
  message: string;
  material?: Material;
}

export interface UploadImageRequest {
  image: File;
}

export interface UploadImageResponse {
  success: boolean;
  imageUrl: string;
}

// =====================================================================
// MEETING API TYPES
// =====================================================================

export interface Meeting {
  id?: string;
  moduleId: string;
  tutorId: string;
  studentId: string;
  scheduledTime: string;
  duration: number; // minutes
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  meetingUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JoinMeetingRequest {
  moduleId: string;
  tutorId: string;
  studentId: string;
  scheduledTime: string;
  duration?: number;
}

export interface JoinMeetingResponse {
  success: boolean;
  message: string;
  meetingUrl?: string;
  meeting?: Meeting;
}

export interface CreateMeetingRequest {
  moduleId: string;
  tutorId: string;
  studentId: string;
  title?: string;
  scheduledTime: string;
  duration: number;
}

export interface CreateMeetingResponse {
  success: boolean;
  message: string;
  meetingUrl?: string;
  meeting?: Meeting;
}

// =====================================================================
// SCHEDULE API TYPES
// =====================================================================

export interface Schedule {
  id?: string;
  tutorId: string;
  studentId?: string;
  moduleId: string;
  moduleName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'completed' | 'cancelled';
  title?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpcomingSessionResponse {
    schedule_id: UUID;
    module_id: UUID;
    tutor: string;
    course: string;
    Date: string;
    time: string;
    duration: number;
    active: boolean;
}


export interface UpcomingSessionsRequest {
    date: string;
    time: string;
    moduleId?: string;
}

export interface CreateScheduleRequest {
    tutorId: string;
    studentId?: string;
    moduleId: string;
    date: string;
    startTime: string;
    endTime: string;
    title?: string;
    description?: string;
}

export interface CreateScheduleResponse {
    success: boolean;
    message: string;
    schedule?: Schedule;
}

export interface GetSchedulesRequest {
  tutorId?: string;
  studentId?: string;
  moduleId?: string;
  date?: string;
}

export interface GetSchedulesResponse {
  schedules: Schedule[];
}

export interface UpdateScheduleRequest {
  id: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  title?: string;
  description?: string;
}

export interface UpdateScheduleResponse {
  success: boolean;
  message: string;
  schedule?: Schedule;
}

export interface DeleteScheduleRequest {
  id: string;
}

export interface DeleteScheduleResponse {
  success: boolean;
  message: string;
}

// =====================================================================
// ERROR RESPONSE TYPES
// =====================================================================

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
  timestamp?: string;
}

// =====================================================================
// UTILITY TYPES
// =====================================================================

export interface PaginationRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      ascending: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// =====================================================================
// API RESPONSE WRAPPER
// =====================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Generic types for common patterns
export type ApiRequest<T> = T;
export type ApiResponseData<T> = T;
export type ListResponse<T> = T[];
