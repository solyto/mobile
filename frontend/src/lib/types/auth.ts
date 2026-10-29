import type { Platform } from '$lib/types/platform';

export interface AuthToken {
	token: string | null;
	token_type: string | null;
	expires_at: string | null;
}

export interface UserProfile {
	profile_image_path: string | null;
}

export type WeekStart = 'monday' | 'sunday';

export interface UserSettings {
	language: string;
	timezone: string;
	date_format: string;
	time_format: string;
	week_start: WeekStart;
	widgets: string;
	navigation: string;
	first_visit: boolean;
	temperature_unit: 'c' | 'f';
	journal_enabled: boolean;
	journal_calendar_mark: boolean;
	check_in_calendar_mark: boolean;
}

export interface User {
	id: string;
	name: string;
	email: string;
	role: string;
	profile: UserProfile;
	settings: UserSettings;
	created_at: string;
	updated_at: string;
	additional_info_last_updated_at: string;
}

export interface LoginRequest {
	email: string;
	password: string;
	platform: Platform;
}

export interface LoginResponse {
	token: string;
	token_type: string;
	token_expires_at: string;
	user: User;
}

export interface WidgetTokenResponse {
	token: string;
	token_type: string;
	token_expires_at: string;
}

export interface RegisterRequest {
	name: string;
	email: string;
	password: string;
	password_confirmation: string;
	language?: string;
	platform?: string;
}

export interface VerifyRequest {
	user_id: string;
	token: string;
}

export interface AuthActionResponse {
	success: boolean;
	errors?: Record<string, string[]>;
}

export interface VerifyActionResponse {
	success: boolean;
	errors?: string[];
}

export interface LoginActionResponse {
	success: boolean;
	data?: LoginResponse;
	errors?: string[];
}

export interface AccountDeletionRequestResponse {
	success: boolean;
	errors?: Record<string, string[]>;
	data?: { status: 'email_sent' | 'deleted' };
}

export interface AccountDeletionConfirmResponse {
	success: boolean;
	errors?: string[] | Record<string, string[]>;
}

export interface PasskeyActionResponse {
	success: boolean;
	message?: string;
	data?: LoginResponse;
}

export interface PasskeyAuthenticationOptions {
	challenge: string;
	rpId: string;
	allowCredentials: { type: 'public-key'; id: string }[];
	userVerification: 'required' | 'preferred' | 'discouraged';
	timeout: number;
}

export interface PasskeyRegistrationOptions {
	rp: { name: string; id: string };
	user: { id: string; name: string; displayName: string };
	challenge: string;
	pubKeyCredParams: { type: 'public-key'; alg: number }[];
	authenticatorSelection: { residentKey: 'required' | 'preferred' | 'discouraged'; userVerification: 'required' | 'preferred' | 'discouraged' };
	attestation: 'none' | 'indirect' | 'direct' | 'enterprise';
	timeout: number;
	excludeCredentials: { type: 'public-key'; id: string }[];
}

export interface Passkey {
	id: string;
	name: string;
	created_at: string;
	last_used_at: string | null;
	transports: string[] | null;
}
