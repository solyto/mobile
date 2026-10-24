<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getFriends } from '$lib/state/Friends.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';
	import type { FriendRequest } from '$lib/types/friend';
	import type { ProfileRecords } from '$lib/types/translation';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import AcceptButton from '$lib/components/ui/buttons/AcceptButton.svelte';
	import SubHeading from '$lib/components/ui/SubHeading.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const friends = getFriends();
	const loadingIndicator = getLoadingIndicator();
	const ts = getTranslation();

	async function onAccept(request: FriendRequest): Promise<void> {
		loadingIndicator.start();
		await friends.acceptRequest(request);
		loadingIndicator.stop();
	}

	async function onReject(request: FriendRequest): Promise<void> {
		loadingIndicator.start();
		await friends.rejectRequest(request);
		loadingIndicator.stop();
	}
</script>

<div class="flex w-full flex-col">
	<Heading title={ts.get.profile.friend_requests} my={4} />
	{#if friends.receivedRequests.length > 0}
		<SubHeading title={ts.get.profile.received} my={0} mb={2} />
		{#each friends.receivedRequests as request (request.id)}
			{#if request.status === 'pending'}
				<div class="flex items-center gap-4" transition:fade>
					<div class="size-8">
						<img
							src={API_USER_STORAGE_URL + '/' + request.user.profile_image_path}
							alt={request.user.name + ' Profile'}
							class="h-full w-full rounded-full object-cover"
						/>
					</div>
					<span>Request from {request.user.name}</span>
					<div class="ml-8 flex gap-2">
						<AcceptButton onClick={() => onAccept(request)} />
						<DeleteButton inModal={false} onClick={() => onReject(request)} />
					</div>
				</div>
			{/if}
		{/each}
	{/if}
	{#if friends.sentRequests.length > 0}
		<SubHeading title={ts.get.profile.sent} my={0} mt={4} mb={2} />
		{#each friends.sentRequests as request (request.id)}
			<div class="flex items-center gap-4" transition:fade>
				<div class="size-8">
					<img
						src={API_USER_STORAGE_URL + '/' + request.user.profile_image_path}
						alt={request.user.name + ' Profile'}
						class="h-full w-full rounded-full object-cover"
					/>
				</div>
				<span>{ts.get.profile.request_to.replace('%s', request.user.name)}</span>
				<div
					class="rounded-lg px-4 py-1 text-sm shadow-sm"
					class:bg-c-neutral-2={request.status === 'pending'}
					class:bg-c-danger={request.status === 'rejected'}
					class:bg-c-success={request.status === 'accepted'}
					class:text-white={request.status === 'rejected' ||
						request.status === 'accepted'}
				>
					{ts.get.profile[('request_' + request.status) as keyof ProfileRecords]}
				</div>
			</div>
		{/each}
	{/if}
</div>
