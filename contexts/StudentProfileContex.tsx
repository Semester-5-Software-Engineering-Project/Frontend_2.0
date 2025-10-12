"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import StudentProfileApi, { StudentProfileEntity, StudentProfileDto } from '@/apis/StudentProfileApi';
import { useAuth } from './AuthContext';

interface StudentProfileContextType {
	profile: StudentProfileEntity | null;
	isLoading: boolean;
	error: string | null;
	refresh: () => Promise<void>;
	createProfile: (data: StudentProfileDto) => Promise<void>;
	updateProfile: (data: StudentProfileDto) => Promise<void>;
	deleteProfile: () => Promise<void>;
	changePassword: (newPassword: string) => Promise<void>;
}

const StudentProfileContext = createContext<StudentProfileContextType | undefined>(undefined);

export const StudentProfileProvider = ({ children }: { children: React.ReactNode }) => {
	const { user } = useAuth();
	const [profile, setProfile] = useState<StudentProfileEntity | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		if (!user || user.role !== 'STUDENT') {
			setProfile(null);
			return;
		}
		setIsLoading(true);
		setError(null);
		try {
			const data = await StudentProfileApi.getMe();
			setProfile(data);
		} catch (e: any) {
			setError(e.message);
		} finally {
			setIsLoading(false);
		}
	}, [user]);

	useEffect(() => {
		load();
	}, [load]);

	const createProfile = async (data: StudentProfileDto) => {
		setIsLoading(true);
		setError(null);
		try {
			const created = await StudentProfileApi.create(data);
			setProfile(created);
		} catch (e: any) {
			setError(e.message);
			throw e;
		} finally {
			setIsLoading(false);
		}
	};

	const updateProfile = async (data: StudentProfileDto) => {
		setIsLoading(true);
		setError(null);
		try {
			const updated = await StudentProfileApi.update(data);
			setProfile(updated);
		} catch (e: any) {
			setError(e.message);
			throw e;
		} finally {
			setIsLoading(false);
		}
	};

	const deleteProfile = async () => {
		if (!profile) return;
		setIsLoading(true);
		setError(null);
		try {
			await StudentProfileApi.delete();
			setProfile(null);
		} catch (e: any) {
			setError(e.message);
			throw e;
		} finally {
			setIsLoading(false);
		}
	};

	const changePassword = async (newPassword: string) => {
		setIsLoading(true);
		setError(null);
		try {
			await StudentProfileApi.changePassword(newPassword);
		} catch (e: any) {
			setError(e.message);
			throw e;
		} finally {
			setIsLoading(false);
		}
	};

	const value: StudentProfileContextType = {
		profile,
		isLoading,
		error,
		refresh: load,
		createProfile,
		updateProfile,
		deleteProfile,
		changePassword,
	};

	return (
		<StudentProfileContext.Provider value={value}>
			{children}
		</StudentProfileContext.Provider>
	);
};

export const useStudentProfile = () => {
	const ctx = useContext(StudentProfileContext);
	if (!ctx) throw new Error('useStudentProfile must be used within StudentProfileProvider');
	return ctx;
};

export default StudentProfileContext;
