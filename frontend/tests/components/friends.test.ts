import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import type { Component } from 'svelte';
import { setFriends, type Friends } from '$lib/state/Friends.svelte';
import type { KeyManager } from '$lib/state/KeyManager.svelte';
import type { LoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
import type { UiNotifications } from '$lib/state/UiNotifications.svelte';
import type { FriendRequest } from '$lib/types/friend';
import { en } from '$lib/i18n/en';
import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';
import { renderWithContext } from './helpers/context';
import StoreHarness from './helpers/StoreHarness.svelte';
import FriendList from '$lib/components/users/Friends.svelte';
import FriendRequests from '$lib/components/users/FriendRequests.svelte';
import ProfilePage from '../../src/routes/profile/+page.svelte';

type Rendered = { friends: Friends; keyManager: KeyManager; loadingIndicator: LoadingIndicator; notifications: UiNotifications };

function renderFriends(component: Component<never>, setup: (friends: Friends) => void = () => {}): Rendered {
	const rendered = {} as Rendered;
	renderWithContext(
		StoreHarness,
		{
			component,
			provide: setFriends,
			onReady: (friends: Friends) => {
				setup(friends);
				rendered.friends = friends;
			}
		},
		{
			onReady: (stores) => {
				rendered.keyManager = stores.keyManager as KeyManager;
				rendered.loadingIndicator = stores.loadingIndicator as LoadingIndicator;
				rendered.notifications = stores.uiNotifications as UiNotifications;
			}
		}
	);
	return rendered;
}

function request(overrides: Partial<FriendRequest> = {}): FriendRequest {
	return {
		id: 1,
		status: 'pending',
		direction: 'received',
		user: { id: 'u2', name: 'Bob', profile_image_path: 'u2/avatar.png' },
		...overrides
	} as FriendRequest;
}

async function requestFriend(rendered: Rendered, id: string): Promise<void> {
	await userEvent.click(screen.getByRole('button'));
	if (id) await userEvent.type(screen.getByPlaceholderText(en.profile.friend_id_placeholder), id);
	rendered.keyManager.handleKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));
	await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('Friends', () => {
	it('sends a friend request for the typed id', async () => {
		const rendered = renderFriends(FriendList as Component<never>, (friends) => {
			friends.createFriendRequest = vi.fn().mockResolvedValue(true);
		});

		await requestFriend(rendered, ' u42 ');

		expect(rendered.friends.createFriendRequest).toHaveBeenCalledWith('u42');
		expect(rendered.notifications.queue).toEqual([]);
		expect(rendered.loadingIndicator.active).toBe(false);
	});

	it('releases its keys once the request is sent', async () => {
		const rendered = renderFriends(FriendList as Component<never>, (friends) => {
			friends.createFriendRequest = vi.fn().mockResolvedValue(true);
		});

		await requestFriend(rendered, 'u42');

		await waitFor(() => expect(rendered.keyManager.handlers.Escape).toHaveLength(0));
		expect(rendered.keyManager.handlers.Enter).toHaveLength(0);
	});

	it('says when the id is invalid', async () => {
		const rendered = renderFriends(FriendList as Component<never>, (friends) => {
			friends.createFriendRequest = vi.fn().mockResolvedValue(false);
		});

		await requestFriend(rendered, 'nope');

		expect(rendered.notifications.queue.map((n) => n.message)).toEqual([en.profile.friend_request_invalid]);
		expect(rendered.loadingIndicator.active).toBe(false);
	});

	it('sends nothing and stops the loading indicator for an empty id', async () => {
		const rendered = renderFriends(FriendList as Component<never>, (friends) => {
			friends.createFriendRequest = vi.fn();
		});

		await requestFriend(rendered, '');

		expect(rendered.friends.createFriendRequest).not.toHaveBeenCalled();
		expect(rendered.loadingIndicator.active).toBe(false);
	});

	it('shows each friend with their profile image', () => {
		renderFriends(FriendList as Component<never>, (friends) => {
			friends.friends = [{ id: 'u2', name: 'Bob', profile_image_path: 'u2/avatar.png' } as Friends['friends'][number]];
		});

		expect(screen.getByText('Bob')).toBeTruthy();
		expect(screen.getByAltText('Profile').getAttribute('src')).toBe(API_USER_STORAGE_URL + '/u2/avatar.png');
	});
});

describe('FriendRequests', () => {
	it('lists received and sent requests with their images', () => {
		renderFriends(FriendRequests as Component<never>, (friends) => {
			friends.receivedRequests = [request()];
			friends.sentRequests = [request({ id: 2, direction: 'sent', status: 'rejected', user: { id: 'u3', name: 'Carol', profile_image_path: 'u3/a.png' } as FriendRequest['user'] })];
		});

		expect(screen.getByText('Request from Bob')).toBeTruthy();
		expect(screen.getByText('Request to Carol')).toBeTruthy();
		expect(screen.getByText(en.profile.request_rejected)).toBeTruthy();
		expect(screen.getByAltText('Bob profile').getAttribute('src')).toBe(API_USER_STORAGE_URL + '/u2/avatar.png');
		expect(screen.getByAltText('Carol profile').getAttribute('src')).toBe(API_USER_STORAGE_URL + '/u3/a.png');
	});

	it('stops the loading indicator when accepting fails', async () => {
		const rendered = renderFriends(FriendRequests as Component<never>, (friends) => {
			friends.receivedRequests = [request()];
			friends.acceptRequest = vi.fn().mockRejectedValue(new Error('offline'));
		});
		const rejections: unknown[] = [];
		const collect = (reason: unknown) => rejections.push(reason);
		process.on('unhandledRejection', collect);

		await userEvent.click(screen.getAllByRole('button')[0]);
		await new Promise((resolve) => setTimeout(resolve, 0));
		process.off('unhandledRejection', collect);

		expect(rejections).toEqual([new Error('offline')]);
		expect(rendered.loadingIndicator.active).toBe(false);
	});
});

describe('Profile page', () => {
	it('shows the stored profile image', () => {
		renderWithContext(
			StoreHarness,
			{
				component: ProfilePage,
				provide: setFriends,
				onReady: (friends: Friends) => {
					vi.spyOn(friends, 'load').mockResolvedValue();
					vi.spyOn(friends, 'loadRequests').mockResolvedValue();
				}
			},
			{ stores: { auth: { user: { id: 'u1', name: 'Alice', profile: { profile_image_path: 'u1/me.png' } } } } }
		);

		expect(screen.getByAltText(en.profile.profile_image_alt).getAttribute('src')).toBe(API_USER_STORAGE_URL + '/u1/me.png');
	});
});
