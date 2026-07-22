<script lang="ts">
	import { onMount } from 'svelte';
	import { getUserManagement } from '$lib/state/UserManagement.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import UserList from '$lib/components/admin/UserList.svelte';
	import UserGrowthChart from '$lib/components/admin/UserGrowthChart.svelte';
	import IconUsers from '@lucide/svelte/icons/users';

	const userManagement = getUserManagement();
	const loadingIndicator = getLoadingIndicator();

	onMount(async () => {
		if (!userManagement.loaded) {
			loadingIndicator.start();
			await userManagement.load();
			loadingIndicator.stop();
		}
	});
</script>

<div class="flex h-full w-full flex-col gap-6 overflow-auto bg-c-neutral p-8 dark:bg-s-dark">
	<div class="flex items-center gap-3">
		<div class="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
			<IconUsers class="h-6 w-6 text-blue-600" />
		</div>
		<div>
			<h1 class="text-2xl font-bold text-c-neutral-9 dark:text-white">Users</h1>
			<p class="text-c-neutral-5 dark:text-c-neutral-4">Manage user accounts and roles</p>
		</div>
	</div>

	{#if userManagement.loaded}
		<UserGrowthChart users={userManagement.users} />
	{/if}

	<UserList />
</div>
