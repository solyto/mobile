<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getFriends } from '$lib/state/Friends.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';
	import AddButton from '$lib/components/ui/buttons/AddButton.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import { onDestroy, tick } from 'svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const friends = getFriends();
	const keyManager = getKeyManager();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const ts = getTranslation();

	let addFriend = $state<boolean>(false);
	let friendId = $state<string>('');
	let friendIdInput = $state<HTMLInputElement | null>(null);
	let keyHandlers = $state<{ [key: string]: string | null }>({ Enter: null, Escape: null });

	async function toggleAddFriend() {
		addFriend = !addFriend;

		if (addFriend) {
			await tick();
			friendIdInput?.focus();

			keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter);
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
		}
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	async function handleEnter(event: KeyboardEvent): Promise<void> {
		await onsubmit();
		await toggleAddFriend();
	}

	function handleEscape(event: KeyboardEvent): void {
		onblur();
	}

	function onblur(): void {
		addFriend = false;
		keyManager.unregisterAll(keyHandlers);
	}

	async function onsubmit(): Promise<void> {
		loadingIndicator.start();
		keyManager.unregisterKeyDown(keyHandlers.Enter);
		let requestedFriendId = friendId.trim();

		if (requestedFriendId === '') {
			return;
		}

		const res = await friends.createFriendRequest(requestedFriendId);

		if (!res) {
			notifications.error('The requested User ID seems invalid.');
		}

		loadingIndicator.stop();
		friendId = '';
	}
</script>

<div class="flex w-full flex-col">
	<div class="flex items-center gap-8">
		<Heading title={ts.get.profile.friends} my={4} />
		{#if addFriend}
			<div class="w-1/2">
				<TextInput
					bind:value={friendId}
					bind:input={friendIdInput}
					placeholder="Friend ID"
				/>
			</div>
		{:else}
			<AddButton onClick={toggleAddFriend} />
		{/if}
	</div>
	{#each friends.friends as friend (friend.id)}
		<div class="flex items-center gap-4" transition:fade>
			<div class="size-8">
				<img
					src={API_USER_STORAGE_URL + '/' + friend.profile_image_path}
					alt="Profile"
					class="h-full w-full rounded-full object-cover"
				/>
			</div>
			<span>{friend.name}</span>
		</div>
	{/each}
</div>
