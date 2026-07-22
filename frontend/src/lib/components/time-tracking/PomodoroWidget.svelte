<script lang="ts">
	import { onDestroy } from 'svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Play from '@lucide/svelte/icons/play';
	import Pause from '@lucide/svelte/icons/pause';
	import SkipForward from '@lucide/svelte/icons/skip-forward';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

	const ts = getTranslation();

	type Phase = 'work' | 'shortBreak' | 'longBreak';

	const WORK_SECONDS = 25 * 60;
	const SHORT_BREAK_SECONDS = 5 * 60;
	const LONG_BREAK_SECONDS = 15 * 60;
	const SESSIONS_PER_CYCLE = 4;

	let phase = $state<Phase>('work');
	let secondsRemaining = $state<number>(WORK_SECONDS);
	let running = $state<boolean>(false);
	let started = $state<boolean>(false);
	let sessionsCompleted = $state<number>(0);
	let interval: ReturnType<typeof setInterval> | null = null;

	let phaseLabel = $derived({
		work: ts.get.timeTracking.work_session,
		shortBreak: ts.get.timeTracking.short_break,
		longBreak: ts.get.timeTracking.long_break,
	}[phase]);

	let accentColor = $derived(phase === 'work' ? 'teal' : 'amber');

	let display = $derived(
		`${String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:${String(secondsRemaining % 60).padStart(2, '0')}`
	);

	function getDurationForPhase(p: Phase): number {
		if (p === 'work') return WORK_SECONDS;
		if (p === 'shortBreak') return SHORT_BREAK_SECONDS;
		return LONG_BREAK_SECONDS;
	}

	function nextPhase(): Phase {
		if (phase === 'work') {
			const completed = sessionsCompleted + 1;
			sessionsCompleted = completed;
			if (completed % SESSIONS_PER_CYCLE === 0) return 'longBreak';
			return 'shortBreak';
		}
		return 'work';
	}

	function advancePhase(): void {
		const next = nextPhase();
		phase = next;
		secondsRemaining = getDurationForPhase(next);
		running = false;
		stopInterval();
	}

	function playBeep(): void {
		try {
			const ctx = new AudioContext();
			const oscillator = ctx.createOscillator();
			const gain = ctx.createGain();
			oscillator.connect(gain);
			gain.connect(ctx.destination);
			oscillator.frequency.value = 880;
			oscillator.type = 'sine';
			gain.gain.value = 0.3;
			oscillator.start();
			oscillator.stop(ctx.currentTime + 0.2);
		} catch {
			// audio not available
		}
	}

	function tick(): void {
		if (secondsRemaining <= 1) {
			secondsRemaining = 0;
			playBeep();
			advancePhase();
			return;
		}
		secondsRemaining--;
	}

	function startInterval(): void {
		if (interval) return;
		interval = setInterval(tick, 1000);
	}

	function stopInterval(): void {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	}

	function toggleRunning(): void {
		running = !running;
		if (running) {
			started = true;
			startInterval();
		} else {
			stopInterval();
		}
	}

	function skip(): void {
		advancePhase();
	}

	function reset(): void {
		stopInterval();
		phase = 'work';
		secondsRemaining = WORK_SECONDS;
		running = false;
		started = false;
		sessionsCompleted = 0;
	}

	onDestroy(() => {
		stopInterval();
	});
</script>

<div
	class="flex h-full flex-col gap-3 rounded-lg bg-c-bg-surface p-4 shadow-sm"
>
	<div class="flex flex-row items-center justify-between">
		<span class="text-sm font-bold text-c-neutral-5 dark:text-c-neutral-4">
			{ts.get.timeTracking.pomodoro}
		</span>
		<div class="flex flex-row items-center gap-2">
			{#if started}
				{#if running}
					<div
						class="h-2 w-2 animate-pulse rounded-full"
						class:bg-c-primary={accentColor === 'teal'}
						class:bg-amber-500={accentColor === 'amber'}
					></div>
				{/if}
				<span
					class="text-xs font-medium"
					class:text-c-primary={accentColor === 'teal'}
					class:text-amber-500={accentColor === 'amber'}
				>
					{phaseLabel}
				</span>
				<button
					onclick={reset}
					class="flex cursor-pointer items-center gap-1 text-xs text-c-neutral-4 transition-all hover:text-c-neutral-6 dark:text-c-neutral-5 dark:hover:text-c-neutral-3"
				>
					<RotateCcw size={13} />
					{ts.get.timeTracking.reset}
				</button>
			{/if}
		</div>
	</div>

	<div class="flex flex-col items-center gap-3 mt-4">
		<span
			class="text-4xl font-bold tabular-nums"
			class:text-c-primary={accentColor === 'teal'}
			class:text-amber-500={accentColor === 'amber'}
		>
			{display}
		</span>

		<div class="flex flex-row items-center gap-1">
			{#each Array(SESSIONS_PER_CYCLE) as _, i}
				<div
					class="h-2.5 w-2.5 rounded-full"
					class:bg-c-primary={i < sessionsCompleted % SESSIONS_PER_CYCLE}
					class:bg-c-neutral-2={i >= sessionsCompleted % SESSIONS_PER_CYCLE}
				></div>
			{/each}
			<span class="ml-1 text-xs text-c-neutral-4 dark:text-c-neutral-5">
				{sessionsCompleted} {ts.get.timeTracking.sessions_completed}
			</span>
		</div>

		<div class="flex flex-row items-center gap-2 mt-4">
			<button
				onclick={toggleRunning}
				class="flex cursor-pointer items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-white transition-all hover:shadow-xs"
				class:bg-c-primary={accentColor === 'teal'}
				class:bg-amber-500={accentColor === 'amber'}
			>
				{#if running}
					<Pause size={14} />
					{ts.get.timeTracking.pause}
				{:else if secondsRemaining < getDurationForPhase(phase)}
					<Play size={14} />
					{ts.get.timeTracking.resume}
				{:else}
					<Play size={14} />
					{ts.get.timeTracking.start}
				{/if}
			</button>
			<button
				onclick={skip}
				class="flex cursor-pointer items-center gap-1 rounded-md bg-c-neutral-1 px-3 py-1.5 text-sm text-c-neutral-6 transition-all hover:bg-c-neutral-2 dark:bg-s-dark-3 dark:text-c-neutral-3 dark:hover:bg-s-dark"
			>
				<SkipForward size={14} />
				{ts.get.timeTracking.skip}
			</button>
		</div>
	</div>
</div>
