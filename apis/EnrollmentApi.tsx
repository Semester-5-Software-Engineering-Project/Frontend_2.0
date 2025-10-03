import axiosInstance from '@/app/utils/axiosInstance';

// --- Types ---------------------------------------------------------------
export interface EnrollmentResponse {
	enrollmentId: string;
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
export const EnrollmentApi = {
	/** Get enrollment ID by module ID (requires authentication) */
	async getEnrollmentId(moduleId: string, token?: string): Promise<string> {
		const t = token || discoverToken();
		try {
			const res = await axiosInstance.get('/api/enrollment/getenrollmentid', {
				params: { Module_Id: moduleId },
				headers: authHeader(t)
			});
			return res.data; // Returns the enrollment ID as string
		} catch (e) {
			throw parseError(e);
		}
	}
};

export default EnrollmentApi;
