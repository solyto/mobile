<script lang="ts">
	import { getUserManagement, UserManagement } from '$lib/state/UserManagement.svelte';
	import UserEntry from '$lib/components/admin/UserEntry.svelte';
	import { fade } from 'svelte/transition';
	import IconSearch from '$lib/icons/lucide/search.svelte';
	import IconX from '$lib/icons/lucide/x.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';

	const userManagement = getUserManagement();
	const loadingIndicator = getLoadingIndicator();
	const ts = getTranslation();

	async function goToPage(page: number): Promise<void> {
		loadingIndicator.start();
		try {
			await userManagement.goToPage(page);
		} finally {
			loadingIndicator.stop();
		}
	}
</script>

<div class="flex flex-col gap-4">
	<div class="relative">
		<IconSearch class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-c-neutral-4" />
		<TextInput
			bind:value={userManagement.search}
			oninput={() => userManagement.scheduleSearch()}
			placeholder={ts.get.admin.search_placeholder}
			maxlength={UserManagement.SEARCH_MAX_LENGTH}
			class="py-2.5 pr-10 pl-10"
		/>
		{#if userManagement.search}
			<button
				class="absolute top-1/2 right-3 -translate-y-1/2 text-c-neutral-4 hover:text-c-neutral-6 dark:hover:text-c-neutral-2"
				onclick={() => userManagement.clearSearch()}
			>
				<IconX class="h-5 w-5" />
			</button>
		{/if}
	</div>

	<div class="flex flex-col gap-3">
		{#if userManagement.loaded}
			{#each userManagement.users as user (user.id)}
				<div transition:fade={{ duration: 150 }}>
					<UserEntry {user} />
				</div>
			{/each}
			{#if userManagement.users.length === 0}
				<p class="py-8 text-center text-c-neutral-5 dark:text-c-neutral-4">
					{userManagement.search ? ts.get.admin.no_search_results : ts.get.admin.no_users}
				</p>
			{/if}
		{:else}
			<p class="py-8 text-center text-c-neutral-5 dark:text-c-neutral-4">{ts.get.admin.loading_users}</p>
		{/if}
	</div>

	{#if userManagement.lastPage > 1}
		<Pagination page={userManagement.page} lastPage={userManagement.lastPage} onchange={goToPage} />
	{/if}
</div>
