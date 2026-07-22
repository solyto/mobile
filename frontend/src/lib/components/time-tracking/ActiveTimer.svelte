<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';

	const tt = getTimeTracking();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	let elapsed = $state<string>('00:00:00');
	let interval: ReturnType<typeof setInterval> | null = null;

	function updateElapsed(): void {
		if (!tt.activeTimer) return;
		const start = new Date(tt.activeTimer.started_at).getTime();
		const now = Date.now();
		const diff = Math.floor((now - start) / 1000);
		const h = Math.floor(diff / 3600);
		const m = Math.floor((diff % 3600) / 60);
		const s = diff % 60;
		elapsed = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}

	onMount(() => {
		updateElapsed();
		interval = setInterval(updateElapsed, 1000);
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	async function stopTimer(): Promise<void> {
		if (!tt.activeTimer) return;
		loadingIndicator.start();
		await tt.stopTimer(tt.activeTimer.id);
		loadingIndicator.stop();
	}
</script>

{#if tt.activeTimer}
	<div class="flex flex-row items-center justify-between rounded-md border-l-4 border-c-primary bg-c-bg-surface p-4 shadow-sm">
		<div class="flex flex-col gap-1">
			<div class="flex flex-row items-center gap-2">
				<div class="h-2 w-2 animate-pulse rounded-full bg-c-primary"></div>
				<span class="text-sm font-medium text-c-primary">
					{ts.get.timeTracking.timer_running}
				</span>
			</div>
			<span class="text-2xl font-bold tabular-nums">{elapsed}</span>
			{#if tt.activeTimer.project}
				<span class="text-sm text-c-neutral-5 dark:text-c-neutral-4">
					{tt.activeTimer.project.title}
				</span>
			{/if}
			{#if tt.activeTimer.description}
				<span class="text-sm text-c-neutral-4 dark:text-c-neutral-5">
					{tt.activeTimer.description}
				</span>
			{/if}
		</div>
		<TextButton title={ts.get.timeTracking.stop_timer} type="danger" onclick={stopTimer} />
	</div>
{/if}
