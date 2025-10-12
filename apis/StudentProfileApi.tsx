import axiosInstance from '@/app/utils/axiosInstance';

// --- Types (aligned with latest backend response) -----------------------
export interface RoleRef {
	id: number;
	name: string; // e.g. "STUDENT"
}

export interface UserEmbedded {
	id: string;
	role: RoleRef;
	email: string;
	providerid: string | null;
	createdAt: string;
	updatedAt: string;
	emailVerified: boolean;
}

// Entity returned by backend
export interface StudentProfileEntity {
	studentId: string;
	user: UserEmbedded;
	firstName: string;
	lastName: string;
	birthday: string;    // ISO date string (YYYY-MM-DD)
	imageUrl: string;
	lastAccessed: string | null;
	isActive: boolean | null;
	phoneNumber: string;
	bio: string;
	address: string;
	city: string;
	country: string;
	createdAt: string;
	updatedAt: string;
	// Forward compatibility for extra backend fields
	[key: string]: any;
}

// DTO we send when creating/updating (omit server-managed & nested user)
export interface StudentProfileDto {
	firstName?: string;
	lastName?: string;
	birthday?: string;
	imageUrl?: string;
	phoneNumber?: string;
	bio?: string;
	address?: string;
	city?: string;
	country?: string;
	isActive?: boolean; // allow client to set initial active state
}

// --- Internal helpers ----------------------------------------------------
// Note: axiosInstance now automatically handles auth tokens via interceptors
// so we don't need to manually pass tokens anymore

// Generic error normalizer
const parseError = (err: any): Error => {
	if (err?.response) {
		const msg = err.response.data?.message || err.response.data || `Request failed (${err.response.status})`;
		return new Error(msg);
	}
	return new Error(err?.message || 'Network error');
};

// --- API surface ---------------------------------------------------------
export const StudentProfileApi = {
	/** Create a new profile for the authenticated student */
	async create(data: StudentProfileDto): Promise<StudentProfileEntity> {
		try {
			const res = await axiosInstance.post('/api/student-profile', data);
			return res.data as StudentProfileEntity;
            console.log(res.data);
		} catch (e) {
			throw parseError(e);
		}
	},

	/** Fetch current student's profile */
	async getMe(): Promise<StudentProfileEntity> {
		try {
			const res = await axiosInstance.get('/api/student-profile/me');
			return res.data as StudentProfileEntity;
		} catch (e) {
			throw parseError(e);
		}
	},

	/** Update current student's profile */
	async update(data: StudentProfileDto): Promise<StudentProfileEntity> {
		try {
			const res = await axiosInstance.put('/api/student-profile', data);
			return res.data as StudentProfileEntity;
		} catch (e) {
			throw parseError(e);
		}
	},

	/** Delete current student's profile */
	async delete(): Promise<void> {
		try {
			await axiosInstance.delete('/api/student-profile');
		} catch (e) {
			throw parseError(e);
		}
	},

	/** Change password for current student */
	async changePassword(newPassword: string): Promise<void> {
		try {
			await axiosInstance.put('/api/student-profile/change-password', { newPassword });
		} catch (e) {
			throw parseError(e);
		}
	},

	/** Get student profile image URL */
	async getImageUrl(): Promise<string | null> {
		try {
			const res = await axiosInstance.get('/api/student-profile/image');
			return res.data?.imageUrl || null;
		} catch (e) {
			console.error('Error fetching student image URL:', e);
			return null;
		}
	},
};

export default StudentProfileApi;
