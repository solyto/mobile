<script lang="ts">
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import IconPlus from '@lucide/svelte/icons/plus';
	import IconLogout from '@lucide/svelte/icons/log-out';
	import IconShieldUser from '@lucide/svelte/icons/shield-user';
	import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';
	import { onMount } from 'svelte';
	import { getFriends } from '$lib/state/Friends.svelte';
	import Friends from '$lib/components/users/Friends.svelte';
	import FriendRequests from '$lib/components/users/FriendRequests.svelte';
	import { urls } from '$lib/config/urls';
	import { resolve } from '$app/paths';

	const loadingIndicator = getLoadingIndicator();
	const auth = getAuth();
	const friends = getFriends();

	let fileInput = $state<HTMLInputElement | null>(null);
	let selectedFileUrl = $state<string>('');

	onMount(async () => {
		loadingIndicator.start();
		await Promise.all([friends.load(), friends.loadRequests()]);
		await friends.load();
		loadingIndicator.stop();
	});

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			selectedFileUrl = URL.createObjectURL(input.files[0]);
			onUpload(input.files[0]);
		}
	}

	async function onUpload(file: File): Promise<void> {
		loadingIndicator.start();
		await auth.setProfileImage(file);
		loadingIndicator.stop();
	}
</script>

<div class="bg-red relative flex w-full flex-col gap-8 p-8">
	<div class="absolute top-4 right-4 flex gap-4">
		{#if auth.isAdmin()}
			<a
				href={resolve(urls.admin.home)}
				class="rounded-full bg-c-primary p-2 text-white hover:text-black"
			>
				<IconShieldUser class="size-6" />
			</a>
		{/if}
		<a href={resolve(urls.logout)} class="rounded-full bg-c-action p-2 text-white hover:text-black">
			<IconLogout class="size-6" />
		</a>
	</div>
	<div class="flex flex-row items-center gap-8">
		<div>
			<input
				type="file"
				bind:this={fileInput}
				onchange={handleFileSelect}
				class="hidden"
				accept="image/*"
			/>
			<button
				class="group relative h-32 w-32 rounded-full border-2 border-c-neutral-1 transition-all hover:border-c-btn-hover dark:border-s-dark-3"
				onclick={() => fileInput?.click()}
			>
				<div
					class="absolute top-0 left-0 flex h-full w-full cursor-pointer items-center justify-center bg-transparent text-c-btn-hover opacity-0 transition-opacity group-hover:opacity-100"
				>
					<IconPlus class="size-10" />
				</div>
				{#if selectedFileUrl}
					<img
						src={selectedFileUrl}
						alt="Profile"
						class="h-full w-full rounded-full object-cover"
					/>
				{:else if auth.user?.profile?.profile_image_path}
					<img
						src={API_USER_STORAGE_URL + '/' + auth.user.profile.profile_image_path}
						alt="Profile"
						class="h-full w-full rounded-full object-cover"
					/>
				{/if}
			</button>
		</div>
		<div class="flex flex-col gap-2">
			<span class="text-lg font-bold lg:text-2xl">{auth.user?.name}</span>
			<span class="text-sm text-c-neutral-5">{auth.user?.id}</span>
		</div>
	</div>
	<div class="flex w-full flex-col justify-between md:flex-row">
		{#if friends.friendsLoaded}
			<Friends />
		{/if}
		{#if friends.requestsLoaded}
			<FriendRequests />
		{/if}
	</div>
</div>
