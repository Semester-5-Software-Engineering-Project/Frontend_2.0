import axiosInstance from '@/app/utils/axiosInstance';

// --- Types (aligned with backend ModuelsDto and ModuelsEntity) ----------
export interface ModuleDto {
	moduleId?: string;
	id?: string; // Keep for backward compatibility
	name: string;
	domain: string;
	fee: number;
	duration: number; // Changed to number to match backend long type (minutes)
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
	duration: number; // Changed to number to match backend long type
	status: string;
}

// --- Internal helpers ----------------------------------------------------
const authHeader = (token?: string) => {
	if (!token) return {};
	return { Authorization: `Bearer ${token}` };
};

// Attempt to read a token if the application stored it in localStorage or a non-httpOnly cookie.
const discoverToken = (): string | undefined => {
	try {
		const fromLocalStorage = localStorage.getItem('token');
		if (fromLocalStorage) return fromLocalStorage;
		// try cookie - check both possible names
		// Check for jwtToken first (backend preference)
		let match = document.cookie.match(/(?:^|; )jwtToken=([^;]+)/);
		if (match) return decodeURIComponent(match[1]);
		
		// Fallback to jwt_token
		match = document.cookie.match(/(?:^|; )jwt_token=([^;]+)/);
		if (match) return decodeURIComponent(match[1]);
	} catch {
		/* no-op */
	}
	return undefined;
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
export const ModuleApi = {
	/** Get all modules */
	async getAllModules(): Promise<ModuleDto[]> {
		try {
			const res = await axiosInstance.get('/api/modules');
			return res.data as ModuleDto[];
		} catch (e) {
			throw parseError(e);
		}
	},

	/** Get modules by domain ID */
	async getModulesByDomainId(domainId: number): Promise<ModuleDto[]> {
		try {
			const res = await axiosInstance.get(`/api/modules/domain/${domainId}`);
			return res.data as ModuleDto[];
		} catch (e) {
			throw parseError(e);
		}
	},

	/** Create a new module (requires TUTOR role) */
	async createModule(data: CreateModuleRequest, token?: string): Promise<string> {
		const t = token || discoverToken();
		try {
			const res = await axiosInstance.post('/api/modules/create', data, { 
				headers: authHeader(t) 
			});
			return res.data; // "Module created successfully"
		} catch (e) {
			throw parseError(e);
		}
	},

	/** Delete a module (requires TUTOR role and ownership) */
	async deleteModule(moduleId: string, token?: string): Promise<void> {
		const t = token || discoverToken();
		try {
			await axiosInstance.delete(`/api/modules/delete/${moduleId}`, { 
				headers: authHeader(t) 
			});
		} catch (e) {
			throw parseError(e);
		}
	},

	/** Search modules by query string */
	async searchModules(query: string): Promise<ModuleDto[]> {
		try {
			const res = await axiosInstance.get('/api/modules/search', {
				params: { query }
			});
			return res.data as ModuleDto[];
		} catch (e) {
			throw parseError(e);
		}
	},

	/** Get modules by tutor ID (for authenticated tutor) */
	async getModulesByTutorId(token?: string): Promise<ModuleDto[]> {
		const t = token || discoverToken();
		try {
			const res = await axiosInstance.get('/api/modules/tutor', { 
				headers: authHeader(t) 
			});
			return res.data as ModuleDto[];
		} catch (e) {
			throw parseError(e);
		}
	}
};

export default ModuleApi;
