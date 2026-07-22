<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { apiRoutes, API_USER_STORAGE_URL } from '$lib/config/apiRoutes.js';
	import ApiService from '$lib/services/ApiService.js';
	import type { Friend } from '$lib/types/friend.js';
	import type { Calendar, CalendarSharee } from '$lib/types/calendar.js';
	import IconUserPlus from '@lucide/svelte/icons/user-plus';
	import IconUsers from '@lucide/svelte/icons/users';
	import IconX from '@lucide/svelte/icons/x';
	import { onMount } from 'svelte';

	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const calendars = getCalendars();
	const auth = getAuth();
	const notifications = getUiNotifications();

	let { calendar, onClose } = $props<{ calendar: Calendar; onClose: () => void }>();

	let friends = $state<Friend[]>([]);
	let sharees = $state<CalendarSharee[]>([]);
	let loaded = $state<boolean>(false);
	let sharing = $state<string | null>(null);
	let revoking = $state<string | null>(null);

	const apiService = new ApiService(auth.getToken());

	const sharedUserIds = $derived(new Set(sharees.map((s) => s.user_id)));
	const unsharedFriends = $derived(friends.filter((f) => !sharedUserIds.has(f.id)));

	onMount(async () => {
		const [friendsRes, shareesRes] = await Promise.all([
			apiService.list(apiRoutes.friends.list),
			apiService.list(apiRoutes.calendars.listSharees.replace('%d', calendar.id.toString()))
		]);

		if (friendsRes) friends = friendsRes.data as Friend[];
		if (shareesRes) sharees = shareesRes.data as CalendarSharee[];

		loaded = true;
	});

	async function shareWithFriend(friend: Friend): Promise<void> {
		sharing = friend.id;
		loadingIndicator.start();

		const success = await calendars.shareCalendar(calendar.id, friend.id);

		if (success) {
			sharees = [...sharees, { user_id: friend.id, user_name: friend.name, user_email: '', access: 3, status: 'pending' }];
			notifications.add({ type: 'success', message: ts.get.calendar.share_success });
		} else {
			notifications.add({ type: 'error', message: ts.get.calendar.share_error });
		}

		loadingIndicator.stop();
		sharing = null;
	}

	async function revoke(sharee: CalendarSharee): Promise<void> {
		revoking = sharee.user_id;
		loadingIndicator.start();

		const success = await calendars.revokeShare(calendar.id, sharee.user_id);

		if (success) {
			sharees = sharees.filter((s) => s.user_id !== sharee.user_id);
		} else {
			notifications.add({ type: 'error', message: ts.get.calendar.share_error });
		}

		loadingIndicator.stop();
		revoking = null;
	}
</script>

<ContentModal title={ts.get.calendar.share_calendar} rounded="2xl" p="4" {onClose}>
	<div class="flex w-full min-w-80 flex-col gap-4">
		{#if !loaded}
			<div class="py-4 text-center text-c-neutral-5">{ts.get.widgets.loading}...</div>
		{:else}
			{#if sharees.length > 0}
				<div class="flex flex-col gap-1">
					<p class="text-xs font-semibold uppercase tracking-wider text-c-neutral-4">
						{ts.get.calendar.shared_with}
					</p>
					{#each sharees as sharee (sharee.user_id)}
						<div class="flex items-center gap-3 rounded-lg p-2">
							<div class="flex size-8 items-center justify-center rounded-full bg-c-neutral-2 dark:bg-s-dark-3">
								<span class="text-sm font-medium text-c-neutral-5">{sharee.user_name[0].toUpperCase()}</span>
							</div>
							<span class="flex-1 text-sm font-medium">{sharee.user_name}</span>
							<span class="text-xs text-c-neutral-4">{ts.get.calendar[`invite_${sharee.status}` as keyof typeof ts.get.calendar]}</span>
							<button
								class="cursor-pointer rounded-full p-1.5 text-c-neutral-4 transition-colors hover:bg-c-neutral-2 hover:text-c-danger disabled:opacity-50 dark:hover:bg-s-dark-2"
								onclick={() => revoke(sharee)}
								disabled={revoking !== null}
								title={ts.get.calendar.revoke_share}
							>
								{#if revoking === sharee.user_id}
									<div class="size-3.5 animate-spin rounded-full border-2 border-c-neutral-4 border-t-transparent"></div>
								{:else}
									<IconX class="size-3.5" />
								{/if}
							</button>
						</div>
					{/each}
				</div>
			{/if}

			<div class="flex flex-col gap-1">
				<p class="text-xs font-semibold uppercase tracking-wider text-c-neutral-4">
					{ts.get.calendar.share_with_friend}
				</p>
				{#if unsharedFriends.length === 0}
					<p class="py-2 text-sm text-c-neutral-4">{ts.get.calendar.no_friends_to_share}</p>
				{:else}
					<div class="flex max-h-64 flex-col gap-1 overflow-y-auto">
						{#each unsharedFriends as friend (friend.id)}
							<button
								class="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-c-neutral-1 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-s-dark-3"
								onclick={() => shareWithFriend(friend)}
								disabled={sharing !== null || revoking !== null}
							>
								<div class="flex size-8 items-center justify-center rounded-full bg-c-neutral-2 dark:bg-s-dark-3">
									{#if friend.profile_image_path}
										<img
											src={API_USER_STORAGE_URL + '/' + friend.profile_image_path}
											alt="Profile"
											class="h-full w-full rounded-full object-cover"
										/>
									{:else}
										<span class="text-sm font-medium text-c-neutral-5">{friend.name[0].toUpperCase()}</span>
									{/if}
								</div>
								<span class="flex-1 text-sm font-medium">{friend.name}</span>
								{#if sharing === friend.id}
									<div class="size-4 animate-spin rounded-full border-2 border-c-primary border-t-transparent"></div>
								{:else}
									<IconUserPlus class="size-4 text-c-primary" />
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</ContentModal>
