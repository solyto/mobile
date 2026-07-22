<script lang="ts">
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Entry from '$lib/components/time-tracking/Entry.svelte';
	import TimerWidget from '$lib/components/time-tracking/TimerWidget.svelte';
	import PomodoroWidget from '$lib/components/time-tracking/PomodoroWidget.svelte';
	import TimeBreakdownWidget from '$lib/components/time-tracking/TimeBreakdownWidget.svelte';
	import StatisticsView from '$lib/components/time-tracking/StatisticsView.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';

	const tt = getTimeTracking();
	const ts = getTranslation();

	let recentEntries = $derived(
		tt.entries
			.filter((e) => e.stopped_at !== null)
			.slice(0, 10)
	);

	interface ProjectBreakdown {
		title: string;
		color: string;
		minutes: number;
	}

	function groupByProject(
		entries: { project: { id: string } | null; duration_minutes: number }[]
	): ProjectBreakdown[] {
		const map = new Map<string, { color: string; minutes: number }>();
		for (const e of entries) {
			const project = e.project ? tt.projects.find((p) => p.id === e.project!.id) : null;
			const key = project?.title ?? ts.get.timeTracking.uncategorized;
			const color = project?.categories?.[0]?.color ?? '#9ca3af';
			const existing = map.get(key) ?? { color, minutes: 0 };
			existing.minutes += e.duration_minutes;
			map.set(key, existing);
		}
		return [...map.entries()]
			.map(([title, { color, minutes }]) => ({ title, color, minutes }))
			.sort((a, b) => b.minutes - a.minutes);
	}

	let weekBreakdown = $derived(() => {
		const now = new Date();
		const startOfWeek = new Date(now);
		startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
		startOfWeek.setHours(0, 0, 0, 0);
		const filtered = tt.entries.filter(
			(e) => e.stopped_at !== null && new Date(e.started_at) >= startOfWeek
		);
		return groupByProject(filtered);
	});

	let weekTotal = $derived(() => weekBreakdown().reduce((s, c) => s + c.minutes, 0));

	let todayBreakdown = $derived(() => {
		const now = new Date();
		const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const filtered = tt.entries.filter(
			(e) => e.stopped_at !== null && new Date(e.started_at) >= startOfToday
		);
		return groupByProject(filtered);
	});

	let todayTotal = $derived(() => todayBreakdown().reduce((s, c) => s + c.minutes, 0));
</script>

<div class="flex flex-col gap-8">
	<div class="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-4">
		<div class="lg:col-span-1">
			<TimerWidget />
		</div>
		<div class="lg:col-span-1">
			<PomodoroWidget />
		</div>
		<TimeBreakdownWidget
			title={ts.get.timeTracking.today}
			breakdown={todayBreakdown()}
			total={todayTotal()}
		/>
		<TimeBreakdownWidget
			title={ts.get.timeTracking.this_week}
			breakdown={weekBreakdown()}
			total={weekTotal()}
		/>
	</div>

	{#if recentEntries.length > 0}
		<div class="flex flex-col gap-2">
			<Heading title={ts.get.timeTracking.recent_entries} my={0} />
			{#each recentEntries as entry (entry.id)}
				<Entry {entry} showProject showDate />
			{/each}
		</div>
	{/if}

	<StatisticsView />
</div>
