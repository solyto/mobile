<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { setTimeTracking, getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import TimeTrackingNavigation from '$lib/components/time-tracking/TimeTrackingNavigation.svelte';
	import ProjectCreate from '$lib/components/time-tracking/ProjectCreate.svelte';

	setTimeTracking();

	const tt = getTimeTracking();
	const loadingIndicator = getLoadingIndicator();

	let showProjectCreate = $state<boolean>(false);
	let editingProjectId = $state<string | null>(null);

	let activeProjectId = $derived(page.params.id ?? null);

	let { children } = $props();

	onMount(async () => {
		loadingIndicator.start();
		try {
			await tt.load();
		} finally {
			loadingIndicator.stop();
		}
	});

	function createProject(): void {
		showProjectCreate = true;
	}

	function editProject(id: string): void {
		editingProjectId = id;
		showProjectCreate = true;
	}

	function closeProjectForm(): void {
		showProjectCreate = false;
		editingProjectId = null;
	}
</script>

{#if tt.loaded}
	<div class="flex h-full w-full flex-row" in:fade>
		<TimeTrackingNavigation
			{activeProjectId}
			onCreateProject={createProject}
			onEditProject={editProject}
		/>
		<div class="relative max-h-full w-full overflow-y-auto">
			{@render children?.()}
		</div>
	</div>
{/if}

{#if showProjectCreate}
	<ProjectCreate projectId={editingProjectId} onClose={closeProjectForm} />
{/if}
