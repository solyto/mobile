<script lang="ts">
	import { onMount } from 'svelte';
	import { getStatistics } from '$lib/state/Statistics.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import StatisticWidget from '$lib/components/admin/StatisticWidget.svelte';
	import IconCheckCheck from '$lib/icons/lucide/check-check.svelte';
	import IconNotebook from '$lib/icons/lucide/notebook.svelte';
	import IconMusic from '$lib/icons/lucide/eighth-notes.svelte';
	import IconBook from '$lib/icons/lucide/book.svelte';
	import IconClapperboard from '$lib/icons/lucide/clapperboard.svelte';
	import IconLink from '$lib/icons/lucide/link.svelte';
	import IconQuote from '$lib/icons/lucide/quote.svelte';
	import IconCookingPot from '$lib/icons/lucide/cooking-pot.svelte';
	import IconUser from '$lib/icons/lucide/user.svelte';
	import IconLayoutDashboard from '$lib/icons/lucide/layout-dashboard.svelte';
	import IconFolderOpen from '$lib/icons/lucide/folder-open.svelte';
	import IconLayoutGrid from '$lib/icons/lucide/layout-grid.svelte';
	import IconTag from '$lib/icons/lucide/tag.svelte';
	import IconClock from '$lib/icons/lucide/clock.svelte';
	import IconLayers from '$lib/icons/lucide/layers.svelte';
	import IconFolderKanban from '$lib/icons/lucide/folder-kanban.svelte';
	import IconCalendar from '$lib/icons/lucide/calendar.svelte';
	import IconCalendarDays from '$lib/icons/lucide/calendar-days.svelte';
	import IconBookUser from '$lib/icons/lucide/book-user.svelte';
	import IconUsers from '$lib/icons/lucide/users.svelte';
	import IconUserRoundCheck from '$lib/icons/lucide/user-round-check.svelte';
	import IconUserPlus from '$lib/icons/lucide/user-plus.svelte';
	import IconGamepad2 from '$lib/icons/lucide/gamepad-2.svelte';
	import IconRss from '$lib/icons/lucide/rss.svelte';
	import IconTrendingUp from '$lib/icons/lucide/trending-up.svelte';
	import IconLandmark from '$lib/icons/lucide/landmark.svelte';
	import IconMapPin from '$lib/icons/lucide/map-pin.svelte';
	import IconBell from '$lib/icons/lucide/bell.svelte';
	import IconFolderTree from '$lib/icons/lucide/folder-tree.svelte';
	import type { Component } from 'svelte';
	import type { StatisticsOverview } from '$lib/types/statistic';
	import type { AdminRecords } from '$lib/types/translation';
	import { getTranslation } from '$lib/state/Translation.svelte';

	type Statistic = {
		field: keyof StatisticsOverview;
		label: keyof AdminRecords;
		icon: Component<{ class?: string }>;
		color: 'teal' | 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
	};

	const STAGGER_MS = 25;

	const SECTIONS: { title: keyof AdminRecords; statistics: Statistic[] }[] = [
		{
			title: 'users',
			statistics: [
				{ field: 'users', label: 'stat_users', icon: IconUser, color: 'blue' },
				{ field: 'active_users', label: 'stat_active_users', icon: IconUserRoundCheck, color: 'blue' },
				{ field: 'confirmed_users', label: 'stat_confirmed_users', icon: IconUsers, color: 'teal' },
				{ field: 'friends', label: 'stat_friends', icon: IconUserPlus, color: 'purple' },
				{ field: 'ui_notifications', label: 'stat_notifications', icon: IconBell, color: 'yellow' }
			]
		},
		{
			title: 'section_calendars',
			statistics: [
				{ field: 'calendars', label: 'stat_calendars', icon: IconCalendar, color: 'teal' },
				{ field: 'calendar_events', label: 'stat_events', icon: IconCalendarDays, color: 'green' }
			]
		},
		{
			title: 'section_todos',
			statistics: [
				{ field: 'todos', label: 'stat_todos', icon: IconCheckCheck, color: 'green' },
				{ field: 'todo_categories', label: 'stat_categories', icon: IconFolderOpen, color: 'teal' },
				{ field: 'todo_workspaces', label: 'stat_workspaces', icon: IconLayoutGrid, color: 'blue' }
			]
		},
		{
			title: 'section_notes',
			statistics: [
				{ field: 'notes', label: 'stat_notes', icon: IconNotebook, color: 'yellow' },
				{ field: 'note_folders', label: 'stat_folders', icon: IconFolderTree, color: 'orange' }
			]
		},
		{
			title: 'section_libraries',
			statistics: [
				{ field: 'books', label: 'stat_books', icon: IconBook, color: 'orange' },
				{ field: 'albums', label: 'stat_albums', icon: IconMusic, color: 'purple' },
				{ field: 'movies', label: 'stat_movies', icon: IconClapperboard, color: 'red' },
				{ field: 'recipes', label: 'stat_recipes', icon: IconCookingPot, color: 'teal' },
				{ field: 'links', label: 'stat_links', icon: IconLink, color: 'blue' },
				{ field: 'quotes', label: 'stat_quotes', icon: IconQuote, color: 'yellow' },
				{ field: 'library_games', label: 'stat_games', icon: IconGamepad2, color: 'green' }
			]
		},
		{
			title: 'section_contacts',
			statistics: [
				{ field: 'address_books', label: 'stat_address_books', icon: IconBookUser, color: 'yellow' },
				{ field: 'contacts', label: 'stat_contacts', icon: IconUsers, color: 'blue' }
			]
		},
		{
			title: 'section_check_in',
			statistics: [{ field: 'check_in_entries', label: 'stat_entries', icon: IconMapPin, color: 'red' }]
		},
		{
			title: 'section_finances',
			statistics: [
				{ field: 'income_entries', label: 'stat_income_entries', icon: IconTrendingUp, color: 'green' },
				{ field: 'wealth_entries', label: 'stat_wealth_entries', icon: IconLandmark, color: 'teal' }
			]
		},
		{
			title: 'section_time_tracking',
			statistics: [
				{ field: 'time_tracking_entries', label: 'stat_entries', icon: IconClock, color: 'orange' },
				{ field: 'time_tracking_categories', label: 'stat_categories', icon: IconLayers, color: 'teal' },
				{ field: 'time_tracking_projects', label: 'stat_projects', icon: IconFolderKanban, color: 'blue' }
			]
		},
		{
			title: 'section_feeds',
			statistics: [{ field: 'feed_subscriptions', label: 'stat_subscribed_feeds', icon: IconRss, color: 'orange' }]
		},
		{
			title: 'section_other',
			statistics: [{ field: 'tags', label: 'stat_tags', icon: IconTag, color: 'purple' }]
		}
	];

	const ALL_STATISTICS = SECTIONS.flatMap((section) => section.statistics);

	const statistics = getStatistics();
	const loadingIndicator = getLoadingIndicator();
	const ts = getTranslation();

	onMount(async () => {
		loadingIndicator.start();
		try {
			await statistics.load();
		} finally {
			loadingIndicator.stop();
		}
	});

	function loadDelay(statistic: Statistic): number {
		return ALL_STATISTICS.indexOf(statistic) * STAGGER_MS;
	}
</script>

<div class="flex h-full w-full flex-col gap-8 overflow-auto p-8">
	<div class="flex items-center gap-3">
		<div class="rounded-lg bg-c-primary/10 p-2 dark:bg-c-primary/20">
			<IconLayoutDashboard class="h-6 w-6 text-c-primary" />
		</div>
		<div>
			<h1 class="text-2xl font-bold text-c-neutral-9 dark:text-white">{ts.get.admin.dashboard}</h1>
			<p class="text-c-neutral-5 dark:text-c-neutral-4">{ts.get.admin.dashboard_description}</p>
		</div>
	</div>

	{#if statistics.loaded}
		{#each SECTIONS as section (section.title)}
			<section class="flex flex-col gap-3">
				<h2 class="text-sm font-semibold uppercase tracking-wider text-c-neutral-4 dark:text-c-neutral-5">{ts.get.admin[section.title]}</h2>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each section.statistics as statistic (statistic.field)}
						<StatisticWidget
							label={ts.get.admin[statistic.label]}
							number={statistics.overview?.[statistic.field] ?? 0}
							icon={statistic.icon}
							color={statistic.color}
							loadDelay={loadDelay(statistic)}
						/>
					{/each}
				</div>
			</section>
		{/each}
	{/if}
</div>
