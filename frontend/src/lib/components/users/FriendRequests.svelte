<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getFriends } from '$lib/state/Friends.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import { profileImageUrl } from '$lib/helpers/ProfileImageHelper';
	import type { Friend, FriendRequest, FriendRequestStatus } from '$lib/types/friend';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import AcceptButton from '$lib/components/ui/buttons/AcceptButton.svelte';
	import SubHeading from '$lib/components/ui/SubHeading.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const friends = getFriends();
	const loadingIndicator = getLoadingIndicator();
	const ts = getTranslation();

	async function onAccept(request: FriendRequest): Promise<void> {
		await withLoadingIndicator(() => friends.acceptRequest(request));
	}

	async function onReject(request: FriendRequest): Promise<void> {
		await withLoadingIndicator(() => friends.rejectRequest(request));
	}

	async function withLoadingIndicator(action: () => Promise<void>): Promise<void> {
		loadingIndicator.start();
		try {
			await action();
		} finally {
			loadingIndicator.stop();
		}
	}

	function statusLabel(status: FriendRequestStatus): string {
		return ts.get.profile[`request_${status}`];
	}

	function isAnswered(request: FriendRequest): boolean {
		return request.status === 'rejected' || request.status === 'accepted';
	}
</script>

{#snippet avatar(user: Friend)}
	<div class="size-8">
		<img
			src={profileImageUrl(user.profile_image_path)}
			alt={ts.get.profile.user_profile_image_alt.replace('%s', user.name)}
			class="h-full w-full rounded-full object-cover"
		/>
	</div>
{/snippet}

<div class="flex w-full flex-col">
	<Heading title={ts.get.profile.friend_requests} my={4} />
	{#if friends.receivedRequests.length > 0}
		<SubHeading title={ts.get.profile.received} my={0} mb={2} />
		{#each friends.receivedRequests as request (request.id)}
			{#if request.status === 'pending'}
				<div class="flex items-center gap-4" transition:fade>
					{@render avatar(request.user)}
					<span>{ts.get.profile.request_from.replace('%s', request.user.name)}</span>
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
				{@render avatar(request.user)}
				<span>{ts.get.profile.request_to.replace('%s', request.user.name)}</span>
				<div
					class="rounded-lg px-4 py-1 text-sm shadow-sm"
					class:bg-c-neutral-2={request.status === 'pending'}
					class:bg-c-danger={request.status === 'rejected'}
					class:bg-c-success={request.status === 'accepted'}
					class:text-white={isAnswered(request)}
				>
					{statusLabel(request.status)}
				</div>
			</div>
		{/each}
	{/if}
</div>
