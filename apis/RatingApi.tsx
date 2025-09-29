import axiosInstance from '@/app/utils/axiosInstance';

// --- Types (aligned with backend RatingCreateDto) ----------
export interface RatingCreateDto {
    enrolmentId: string;
    rating: number;
    feedback?: string;
    studentName?: string; // This will be set by the backend from the JWT token
}

export interface RatingResponse {
    message: string;
}

export interface RatingGetDto {
    enrolmentId: string;
    rating: number; // BigDecimal from backend will be received as number in frontend
    feedback?: string;
    studentName?: string;
    createdAt?: string; // Instant from backend will be received as ISO string in frontend
}

// --- API Functions ----------------------------------------------------

/**
 * Create a new rating for an enrollment
 * @param ratingData - The rating data to create
 * @returns Promise with the creation response message
 */
export const createRating = async (ratingData: RatingCreateDto): Promise<string> => {
    try {
        const response = await axiosInstance.post<string>('/api/ratings/create', ratingData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        return response.data;
    } catch (error: any) {
        // Handle different types of errors
        if (error.response) {
            // Server responded with error status
            const errorMessage = error.response.data || 'Failed to create rating';
            throw new Error(errorMessage);
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('No response from server. Please check your connection.');
        } else {
            // Something else happened
            throw new Error('Error creating rating: ' + error.message);
        }
    }
};

/**
 * Get all ratings for a specific module
 * @param moduleId - The UUID of the module to get ratings for
 * @returns Promise with array of ratings for the module
 */
export const getRatingsByModuleId = async (moduleId: string): Promise<RatingGetDto[]> => {
    try {
        const response = await axiosInstance.get<RatingGetDto[]>('/api/ratings/module', {
            params: { moduleId },
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        return response.data;
    } catch (error: any) {
        // Handle different types of errors
        if (error.response) {
            // Server responded with error status
            const errorMessage = error.response.data || 'Failed to fetch ratings';
            throw new Error(errorMessage);
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('No response from server. Please check your connection.');
        } else {
            // Something else happened
            throw new Error('Error fetching ratings: ' + error.message);
        }
    }
};

const RatingApi = {
    createRating,
    getRatingsByModuleId
};

export default RatingApi;
