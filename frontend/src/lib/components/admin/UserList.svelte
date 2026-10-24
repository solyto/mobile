<script lang="ts">
	import { getUserManagement } from '$lib/state/UserManagement.svelte';
	import UserEntry from '$lib/components/admin/UserEntry.svelte';
	import { fade } from 'svelte/transition';
	import IconSearch from '@lucide/svelte/icons/search';
	import IconX from '@lucide/svelte/icons/x';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const userManagement = getUserManagement();
	const ts = getTranslation();

	let searchQuery = $state('');
	let filteredUsers = $derived(userManagement.filterUsers());
</script>

<div class="flex flex-col gap-4">
	<div class="relative">
		<IconSearch class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-c-neutral-4" />
		<TextInput
			bind:value={userManagement.search}
			placeholder={ts.get.admin.search_placeholder}
			class="py-2.5 pr-10 pl-10"
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
