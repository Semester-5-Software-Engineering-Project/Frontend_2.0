import axiosInstance from '@/app/utils/axiosInstance';

// --- Types (aligned with backend DomainDto) -----------------------------
export interface DomainDto {
	domainId?: number;
	name: string;
}

export interface CreateDomainRequest {
	name: string;
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
		// try cookie (only works if NOT httpOnly) - check both possible names
		let match = document.cookie.match(/(?:^|; )jwtToken=([^;]+)/);
		if (match) return decodeURIComponent(match[1]);
		
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
export const DomainApi = {
	/** Get all domains */
	async getAllDomains(): Promise<DomainDto[]> {
		try {
			const res = await axiosInstance.get('/api/domains/all');
			return res.data as DomainDto[];
		} catch (e) {
			throw parseError(e);
		}
	},

	/** Create a new domain (requires ADMIN role) */
	async createDomain(data: CreateDomainRequest, token?: string): Promise<string> {
		const t = token || discoverToken();
		try {
			const res = await axiosInstance.post('/api/domains/create', data, { 
				headers: authHeader(t) 
			});
			return res.data; // "Domain created successfully"
		} catch (e) {
			throw parseError(e);
		}
	},

	/** Delete a domain (requires ADMIN role) */
	async deleteDomain(domainId: number, token?: string): Promise<void> {
		const t = token || discoverToken();
		try {
			await axiosInstance.delete(`/api/domains/delete/${domainId}`, { 
				headers: authHeader(t) 
			});
		} catch (e) {
			throw parseError(e);
		}
	}
};

export default DomainApi;
