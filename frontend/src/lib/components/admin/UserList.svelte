<script lang="ts">
	import { getUserManagement } from '$lib/state/UserManagement.svelte';
	import UserEntry from '$lib/components/admin/UserEntry.svelte';
	import { fade } from 'svelte/transition';
	import IconSearch from '@lucide/svelte/icons/search';
	import IconX from '@lucide/svelte/icons/x';

	const userManagement = getUserManagement();

	let searchQuery = $state('');
	let filteredUsers = $derived(userManagement.filterUsers());
</script>

<div class="flex flex-col gap-4">
	<div class="relative">
		<IconSearch class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-c-neutral-4" />
		<input
			type="text"
			placeholder="Search by name or email..."
			class="w-full rounded-lg border border-c-neutral-2 bg-white py-2.5 pr-10 pl-10 text-c-neutral-9 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-c-btn-hover focus:outline-none dark:border-s-dark-3 dark:bg-s-dark-2 dark:text-white"
			bind:value={userManagement.search}
		/>
		{#if searchQuery}
			<button
				class="absolute top-1/2 right-3 -translate-y-1/2 text-c-neutral-4 hover:text-c-neutral-6 dark:hover:text-c-neutral-2"
				onclick={() => (searchQuery = '')}
			>
				<IconX class="h-5 w-5" />
			</button>
		{/if}
	</div>

	<div class="flex flex-col gap-3">
		{#if userManagement.loaded}
			{#each filteredUsers as user (user.id)}
				<div transition:fade={{ duration: 150 }}>
					<UserEntry {user} />
				</div>
			{/each}
			{#if filteredUsers.length === 0}
				<p class="py-8 text-center text-c-neutral-5 dark:text-c-neutral-4">
					{searchQuery ? 'No users match your search' : 'No users found'}
				</p>
			{/if}
		{:else}
			<p class="py-8 text-center text-c-neutral-5 dark:text-c-neutral-4">Loading users...</p>
		{/if}
	</div>
</div>
