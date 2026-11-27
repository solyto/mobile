<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getFriends } from '$lib/state/Friends.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import { profileImageUrl } from '$lib/helpers/ProfileImageHelper';
	import AddButton from '$lib/components/ui/buttons/AddButton.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import { onDestroy, tick } from 'svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';

	const friends = getFriends();
	const keyManager = getKeyManager();
	const ts = getTranslation();
	const sending = new SaveAction(() => ts.get.profile.friend_request_invalid);

	let addFriend = $state<boolean>(false);
	let friendId = $state<string>('');
	let friendIdInput = $state<HTMLInputElement | null>(null);
	let keyHandlers: { [key: string]: string | null } = { Enter: null, Escape: null };

	async function toggleAddFriend() {
		addFriend = !addFriend;

		if (addFriend) {
			await tick();
			friendIdInput?.focus();

			keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter);
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
		} else {
			keyManager.unregisterAll(keyHandlers);
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
		keyManager.unregisterKeyDown(keyHandlers.Enter);
		const requestedFriendId = friendId.trim();
		if (requestedFriendId === '') return;

		await sending.run(() => friends.createFriendRequest(requestedFriendId));
		friendId = '';
	}
</script>

<div class="flex w-full flex-col">
	<div class="flex items-center gap-8">
		<Heading title={ts.get.profile.friends} my={4} />
		{#if addFriend}
			<div class="w-1/2">
				<TextInput bind:value={friendId} bind:input={friendIdInput} placeholder={ts.get.profile.friend_id_placeholder} />
			</div>
		{:else}
			<AddButton onClick={toggleAddFriend} />
		{/if}
	</div>
	{#each friends.friends as friend (friend.id)}
		<div class="flex items-center gap-4" transition:fade>
			<div class="size-8">
				<img
					src={profileImageUrl(friend.profile_image_path)}
					alt={ts.get.profile.profile_image_alt}
					class="h-full w-full rounded-full object-cover"
				/>
			</div>
			<span>{friend.name}</span>
		</div>
	{/each}
</div>
