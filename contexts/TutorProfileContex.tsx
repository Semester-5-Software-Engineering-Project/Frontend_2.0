"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import TutorProfileApi, { TutorProfileEntity, TutorProfileDto } from '@/apis/TutorProfile';
import { useAuth } from './AuthContext';

interface TutorProfileContextType {
	profile: TutorProfileEntity | null;
	isLoading: boolean;
	error: string | null;
	refresh: () => Promise<void>;
	createProfile: (data: TutorProfileDto) => Promise<void>;
	updateProfile: (data: TutorProfileDto) => Promise<void>;
	deleteProfile: () => Promise<void>;
	changePassword: (newPassword: string) => Promise<void>;
	search: (q: string) => Promise<any[]>; // search results may be DTO-like
	allTutors: TutorProfileEntity[];
}

const TutorProfileContext = createContext<TutorProfileContextType | undefined>(undefined);

export const TutorProfileProvider = ({ children }: { children: React.ReactNode }) => {
	const { user } = useAuth();
	const [profile, setProfile] = useState<TutorProfileEntity | null>(null);
	const [allTutors, setAllTutors] = useState<TutorProfileEntity[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		if (!user || user.role !== 'TUTOR') {
			setProfile(null);
			return;
		}
		setIsLoading(true);
		setError(null);
		try {
			const data = await TutorProfileApi.getMe();
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

	const createProfile = async (data: TutorProfileDto) => {
		setIsLoading(true);
		setError(null);
		try {
			const created = await TutorProfileApi.create(data);
			setProfile(created);
		} catch (e: any) {
			setError(e.message);
			throw e;
		} finally {
			setIsLoading(false);
		}
	};

	const updateProfile = async (data: TutorProfileDto) => {
		setIsLoading(true);
		setError(null);
		try {
			const updated = await TutorProfileApi.update(data);
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
			await TutorProfileApi.delete();
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
			await TutorProfileApi.changePassword(newPassword);
		} catch (e: any) {
			setError(e.message);
			throw e;
		} finally {
			setIsLoading(false);
		}
	};

	const search = async (q: string) => {
		try {
			return await TutorProfileApi.search(q);
		} catch (e: any) {
			setError(e.message);
			throw e;
		}
	};

	const value: TutorProfileContextType = {
		profile,
		isLoading,
		error,
		refresh: load,
		createProfile,
		updateProfile,
		deleteProfile,
		changePassword,
		search,
		allTutors,
	};

	return (
		<TutorProfileContext.Provider value={value}>
			{children}
		</TutorProfileContext.Provider>
	);
};

export const useTutorProfile = () => {
	const ctx = useContext(TutorProfileContext);
	if (!ctx) throw new Error('useTutorProfile must be used within TutorProfileProvider');
	return ctx;
};

export default TutorProfileContext;

