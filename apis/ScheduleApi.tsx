import axiosInstance from '@/app/utils/axiosInstance';

// --- Types for Schedule API ---------------------------------------------
export interface ScheduleDto {
    scheduleId: string;
    moduleId: string;
    date: string; // YYYY-MM-DD format
    time: string; // HH:mm:ss format
    duration: number; // in minutes
    weekNumber: number;
    recurrentType: string; // "specific", "Weekly", etc.
    moduleName: string;
    tutorName: string;
    valid: boolean;
    scheduleType: string; // "One-time", etc.
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
        const status = err.response.status;
        const message = err.response.data?.message || err.response.data || 'Unknown error';
        return new Error(`HTTP ${status}: ${message}`);
    }
    return err instanceof Error ? err : new Error(String(err));
};

// --- ScheduleApiService --------------------------------------------------
export class ScheduleApiService {
    /** Get all schedules for the current user */
    async getMySchedules(token?: string): Promise<ScheduleDto[]> {
        const t = token || discoverToken();
        try {
            const res = await axiosInstance.get('/api/schedules/my-schedules', { 
                headers: authHeader(t) 
            });
            return res.data as ScheduleDto[];
        } catch (e) {
            throw parseError(e);
        }
    }

    /** Get schedules for a specific module */
    async getSchedulesForModule(moduleId: string, token?: string): Promise<ScheduleDto[]> {
        const schedules = await this.getMySchedules(token);
        return schedules.filter(schedule => schedule.moduleId === moduleId);
    }

    /** Check if a schedule is within the join window (1 hour before) */
    isScheduleJoinable(schedule: ScheduleDto): boolean {
        const now = new Date();
        const scheduleDateTime = new Date(`${schedule.date}T${schedule.time}`);
        const timeDiff = scheduleDateTime.getTime() - now.getTime();
        const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds
        
        // Schedule is joinable if it's within 1 hour before the scheduled time
        // and hasn't passed yet
        return timeDiff <= oneHourInMs && timeDiff > 0;
    }

    /** Get upcoming schedules (future schedules only) */
    getUpcomingSchedules(schedules: ScheduleDto[]): ScheduleDto[] {
        const now = new Date();
        return schedules
            .filter(schedule => {
                const scheduleDateTime = new Date(`${schedule.date}T${schedule.time}`);
                return scheduleDateTime > now && schedule.valid;
            })
            .sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateA.getTime() - dateB.getTime();
            });
    }
}

// Export a singleton instance
export const scheduleApi = new ScheduleApiService();