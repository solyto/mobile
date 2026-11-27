<script lang="ts">
	import { onMount } from 'svelte';
	import { getUserManagement } from '$lib/state/UserManagement.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import UserList from '$lib/components/admin/UserList.svelte';
	import UserGrowthChart from '$lib/components/admin/UserGrowthChart.svelte';
	import IconUsers from '$lib/icons/lucide/users.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { UserGrowthGroupBy } from '$lib/types/managed_user';

	const userManagement = getUserManagement();
	const loadingIndicator = getLoadingIndicator();
	const ts = getTranslation();

	onMount(async () => {
		if (userManagement.loaded) return;
		await withLoadingIndicator(() => Promise.all([userManagement.load(), userManagement.loadGrowth()]));
	});

	function groupGrowthBy(groupBy: UserGrowthGroupBy): Promise<void> {
		return withLoadingIndicator(() => userManagement.loadGrowth(groupBy));
	}

	async function withLoadingIndicator(load: () => Promise<unknown>): Promise<void> {
		loadingIndicator.start();
		try {
			await load();
		} finally {
			loadingIndicator.stop();
		}
	}
</script>

<div class="flex h-full w-full flex-col gap-6 overflow-auto p-8">
	<div class="flex items-center gap-3">
		<div class="rounded-lg bg-c-btn/10 p-2 dark:bg-c-btn/20">
			<IconUsers class="h-6 w-6 text-c-btn" />
		</div>
		<div>
			<h1 class="text-2xl font-bold text-c-neutral-9 dark:text-white">{ts.get.admin.users}</h1>
			<p class="text-c-neutral-5 dark:text-c-neutral-4">{ts.get.admin.users_description}</p>
		</div>
	</div>

	{#if userManagement.loaded}
		<UserGrowthChart points={userManagement.growth} groupBy={userManagement.growthGroupBy} ongroupby={groupGrowthBy} />
	{/if}

	<UserList />
</div>
