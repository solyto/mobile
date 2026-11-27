import { describe, it, expect } from 'vitest';
import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';
import { profileImageUrl } from '$lib/helpers/ProfileImageHelper';

describe('ProfileImageHelper', () => {
	it('finds a profile image in the user storage', () => {
		expect(profileImageUrl('u1/profile/me.jpg')).toBe(`${API_USER_STORAGE_URL}/u1/profile/me.jpg`);
	});
});
