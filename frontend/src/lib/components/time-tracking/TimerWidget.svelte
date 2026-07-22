<script lang="ts">
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import ActiveTimer from '$lib/components/time-tracking/ActiveTimer.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import type { StartTimerRequest } from '$lib/types/time_tracking';

	const tt = getTimeTracking();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	let timerProjectId = $state<string>(tt.projects.length > 0 ? tt.projects[0].id : '');
	let timerDescription = $state<string>('');

	let projectOptions = $derived(
		tt.projects.map((p) => ({ label: p.title, value: p.id }))
	);

	async function startTimer(): Promise<void> {
		if (!timerProjectId) return;
		loadingIndicator.start();
		const request: StartTimerRequest = {
			project_id: timerProjectId,
			description: timerDescription.trim() || null
		};
		await tt.startTimer(request);
		timerDescription = '';
		loadingIndicator.stop();
	}
</script>

<div class="h-full rounded-lg bg-c-bg-surface p-4 shadow-sm">
	{#if tt.activeTimer}
		<ActiveTimer />
	{:else if tt.projects.length > 0}
		<div class="flex flex-col gap-3">
			<span class="text-sm font-bold text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.timeTracking.start_timer}
			</span>
			<Select bind:value={timerProjectId} options={projectOptions} />
			<input
				type="text"
				bind:value={timerDescription}
				placeholder={ts.get.timeTracking.description}
				class="w-full rounded-lg border-1 border-c-neutral-2 px-3 py-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-3 dark:bg-inherit dark:text-white dark:focus:ring-c-primary"
			/>
			<TextButton title={ts.get.timeTracking.start_timer} onclick={startTimer} />
		</div>
	{:else}
		<p class="text-sm text-c-neutral-5 dark:text-c-neutral-4">
			{ts.get.timeTracking.no_projects}
		</p>
	{/if}
</div>
