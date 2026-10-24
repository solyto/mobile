<script lang="ts">
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import ActiveTimer from '$lib/components/time-tracking/ActiveTimer.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import type { StartTimerRequest } from '$lib/types/time_tracking';

	const tt = getTimeTracking();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	// No silent default to the first project: the user must pick one.
	let timerProjectId = $state<string>('');
	let timerDescription = $state<string>('');

	let projectOptions = $derived([
		{ label: '—', value: '' },
		...tt.projects.map((p) => ({ label: p.title, value: p.id }))
	]);

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
			<label class="flex flex-col gap-1">
				<span class="text-xs font-medium text-c-neutral-5 dark:text-c-neutral-4">
					{ts.get.timeTracking.project}
				</span>
				<Select bind:value={timerProjectId} options={projectOptions} />
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-xs font-medium text-c-neutral-5 dark:text-c-neutral-4">
					{ts.get.timeTracking.description}
				</span>
				<TextInput bind:value={timerDescription} placeholder={ts.get.timeTracking.description} />
			</label>
			<TextButton
				title={ts.get.timeTracking.start_timer}
				onclick={startTimer}
				disabled={!timerProjectId}
			/>
		</div>
	{:else}
		<p class="text-sm text-c-neutral-5 dark:text-c-neutral-4">
			{ts.get.timeTracking.no_projects}
		</p>
	{/if}
</div>
