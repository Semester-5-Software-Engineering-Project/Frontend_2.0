import axiosInstance from '@/app/utils/axiosInstance';

// --- Types ---------------------------------------------------------------
// These mirror (and are defensive toward) the backend structures. Because
// the exact TutorProfileDto / TutorEntity fields weren't provided, the
// interfaces below include common/likely fields plus an index signature so
// unexpected backend additions won't immediately break the UI.

export interface RoleRef {
	id: number;
	name: string; // e.g. "TUTOR"
}

export interface UserEmbedded {
	id: string;          // UUID
	role: RoleRef;       // Role object
	email: string;
	providerid: string | null;
	createdAt: string;
	updatedAt: string;
	emailVerified: boolean;
	[key: string]: any;  // forward compatibility
}

// Entity returned by backend (TutorEntity)
export interface TutorProfileEntity {
	tutorId: string;          // UUID
	user: UserEmbedded;       // nested user entity
	firstName: string;
	lastName: string;
	phoneNo: string;
	gender?: string;          // e.g. "MALE" | "FEMALE" | other enum
	dob?: string;             // ISO date (YYYY-MM-DD)
	image?: string;           // image URL
	portfolio?: string;       // portfolio URL
	bio: string;
	address?: string;
	city?: string;
	country?: string;
	lastAccessed: string | null;
	createdAt: string;
	updatedAt: string;
	// Additional / future backend fields
	[key: string]: any;
}

// DTO sent to backend for create/update. Excludes server-managed and nested user field.
export interface TutorProfileDto {
	firstName?: string;
	lastName?: string;
	phoneNo?: string;
	gender?: string;
	dob?: string;
	image?: string;
	portfolio?: string;
	bio?: string;
	address?: string;
	city?: string;
	country?: string;
	// Optional if backend allows partial updates; controller overrides tutorId from JWT
	tutorId?: string;
}

// Legacy/alternate create payload shape supplied by user (e.g. during initial form submission)
// { name, birthday, imageUrl, phoneNumber, bio, isActive }
export interface TutorProfileLegacyCreatePayload {
	name?: string;          // full name -> split into firstName / lastName
	birthday?: string;      // -> dob
	imageUrl?: string;      // -> image
	phoneNumber?: string;   // -> phoneNo
	bio?: string;           // -> bio
	isActive?: boolean;     // currently no direct field; ignored or future use
}

// Normalize any incoming object into TutorProfileDto expected by backend.
// Accepts either the new shape (firstName, etc.) or the legacy shape provided above.
const normalizeTutorProfileInput = (input: TutorProfileDto | TutorProfileLegacyCreatePayload): TutorProfileDto => {
	if (!input) return {};
	const out: TutorProfileDto = {};

	// If already in new shape, copy recognized fields directly.
	const newShapeKeys = ['firstName','lastName','phoneNo','gender','dob','image','portfolio','bio', 'address', 'city', 'country', 'tutorId'];
	let hasNewShape = false;
	for (const k of newShapeKeys) {
		if ((input as any)[k] !== undefined) {
			(out as any)[k] = (input as any)[k];
			hasNewShape = true;
		}
	}

	// If legacy shape (no firstName/lastName but has name or birthday, etc.) map them.
	if (!hasNewShape) {
		const legacy = input as TutorProfileLegacyCreatePayload;
		if (legacy.name) {
			const parts = legacy.name.trim().split(/\s+/);
			out.firstName = parts.shift() || '';
			out.lastName = parts.join(' ') || '';
		}
		if (legacy.birthday) out.dob = legacy.birthday; // assume format acceptable
		if (legacy.imageUrl) out.image = legacy.imageUrl;
		if (legacy.phoneNumber) out.phoneNo = legacy.phoneNumber;
		if (legacy.bio) out.bio = legacy.bio;
		// isActive currently not represented on TutorProfileDto; ignore safely.
	}

	return out;
};

// Type returned by search endpoint (controller returns List<TutorProfileDto>)
export interface TutorProfileSearchResult extends TutorProfileDto {
	tutorId?: string; // may be present if backend includes it
	[key: string]: any;
}

// --- Internal helpers ----------------------------------------------------
// For production deployment, manually extract and include Authorization header
const getTokenAndHeaders = () => {
    try {
        // Try localStorage first
        let token = localStorage.getItem('token');
        
        // Try cookies if localStorage is empty - check both possible names
        if (!token && typeof document !== 'undefined') {
            // Check for jwtToken first (backend preference)
            let match = document.cookie.match(/(?:^|; )jwtToken=([^;]+)/);
            if (match) token = decodeURIComponent(match[1]);
            
            // Fallback to jwt_token
            if (!token) {
                match = document.cookie.match(/(?:^|; )jwt_token=([^;]+)/);
                if (match) token = decodeURIComponent(match[1]);
            }
        }
        
        return token ? { Authorization: `Bearer ${token}` } : {};
    } catch (error) {
        return {};
    }
};

// Generic error normalizer
const parseError = (err: any): Error => {
	if (err?.response) {
		const msg = err.response.data?.message || err.response.data || `Request failed (${err.response.status})`;
		return new Error(msg);
	}
	return new Error(err?.message || 'Network error');
};

// --- API surface ---------------------------------------------------------
export const TutorProfileApi = {
	/** Create a tutor profile for the authenticated tutor */
	async create(data: TutorProfileDto | TutorProfileLegacyCreatePayload): Promise<TutorProfileEntity> {
		try {
			const normalized = normalizeTutorProfileInput(data);
			const headers = getTokenAndHeaders();
			const res = await axiosInstance.post('/api/tutor-profile', normalized, { headers });
			return res.data as TutorProfileEntity;
		} catch (e) {
			throw parseError(e);
		}
	},

	/** Get current tutor's profile ("/me") */
	async getMe(): Promise<TutorProfileEntity> {
		try {
			const headers = getTokenAndHeaders();
			const res = await axiosInstance.get('/api/tutor-profile/me', { headers });
			return res.data as TutorProfileEntity;
		} catch (e) {
			throw parseError(e);
		}
	},

	/** Update current tutor's profile */
	async update(data: TutorProfileDto): Promise<TutorProfileEntity> {
		try {
			const headers = getTokenAndHeaders();
			const res = await axiosInstance.put('/api/tutor-profile', data, { headers });
			return res.data as TutorProfileEntity;
		} catch (e) {
			throw parseError(e);
		}
	},

	/** Delete current tutor's profile */
	async delete(): Promise<void> {
		try {
			await axiosInstance.delete('/api/tutor-profile');
		} catch (e) {
			throw parseError(e);
		}
	},

	/** Change password for current tutor */
	async changePassword(newPassword: string): Promise<void> {
		try {
			await axiosInstance.put('/api/tutor-profile/change-password', { newPassword });
		} catch (e) {
			throw parseError(e);
		}
	},

	/** Fetch all tutor profiles (public or admin view depends on backend auth rules) */
	async getAll(): Promise<TutorProfileEntity[]> {
		try {
			const res = await axiosInstance.get('/api/tutor-profile/all');
			return res.data as TutorProfileEntity[];
		} catch (e) {
			throw parseError(e);
		}
	},

	/** Search tutor profiles by query param */
	async search(query: string): Promise<TutorProfileSearchResult[]> {
		try {
			const res = await axiosInstance.get('/api/tutor-profile/search', {
				params: { query },
			});
			return res.data as TutorProfileSearchResult[];
		} catch (e) {
			throw parseError(e);
		}
	},
};

export default TutorProfileApi;

