<script lang="ts">
	import { onMount } from 'svelte';
	import { getStatistics } from '$lib/state/Statistics.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import StatisticWidget from '$lib/components/admin/StatisticWidget.svelte';
	import IconCheckCheck from '@lucide/svelte/icons/check-check';
	import IconNotebook from '@lucide/svelte/icons/notebook';
	import IconMusic from '@lucide/svelte/icons/music';
	import IconBook from '@lucide/svelte/icons/book';
	import IconClapperboard from '@lucide/svelte/icons/clapperboard';
	import IconLink from '@lucide/svelte/icons/link';
	import IconQuote from '@lucide/svelte/icons/quote';
	import IconCookingPot from '@lucide/svelte/icons/cooking-pot';
	import IconUser from '@lucide/svelte/icons/user';
	import IconCoins from '@lucide/svelte/icons/coins';
	import IconLayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import IconFolderOpen from '@lucide/svelte/icons/folder-open';
	import IconLayoutGrid from '@lucide/svelte/icons/layout-grid';
	import IconTag from '@lucide/svelte/icons/tag';
	import IconClock from '@lucide/svelte/icons/clock';
	import IconLayers from '@lucide/svelte/icons/layers';
	import IconFolderKanban from '@lucide/svelte/icons/folder-kanban';
	import IconCalendar from '@lucide/svelte/icons/calendar';
	import IconCalendarDays from '@lucide/svelte/icons/calendar-days';
	import IconBookUser from '@lucide/svelte/icons/book-user';
	import IconUsers from '@lucide/svelte/icons/users';
	import IconUserRoundCheck from '@lucide/svelte/icons/user-round-check';
	import IconUserPlus from '@lucide/svelte/icons/user-plus';
	import IconGamepad2 from '@lucide/svelte/icons/gamepad-2';
	import IconRss from '@lucide/svelte/icons/rss';
	import IconTrendingUp from '@lucide/svelte/icons/trending-up';
	import IconLandmark from '@lucide/svelte/icons/landmark';
	import IconMapPin from '@lucide/svelte/icons/map-pin';
	import IconBell from '@lucide/svelte/icons/bell';
	import IconFolderTree from '@lucide/svelte/icons/folder-tree';

	const statistics = getStatistics();
	const loadingIndicator = getLoadingIndicator();

	let delayIndex = 0;
	const delay = () => delayIndex++ * 25;

	onMount(async () => {
		loadingIndicator.start();
		await statistics.load();
		loadingIndicator.stop();
	});
</script>

<div class="flex h-full w-full flex-col gap-8 overflow-auto bg-c-neutral p-8 dark:bg-s-dark">
	<div class="flex items-center gap-3">
		<div class="rounded-lg bg-teal-50 p-2 dark:bg-teal-900/20">
			<IconLayoutDashboard class="h-6 w-6 text-teal-600" />
		</div>
		<div>
			<h1 class="text-2xl font-bold text-c-neutral-9 dark:text-white">Dashboard</h1>
			<p class="text-c-neutral-5 dark:text-c-neutral-4">Overview of platform statistics</p>
		</div>
	</div>

	{#if statistics.loaded}
		<section class="flex flex-col gap-3">
			<h2 class="text-sm font-semibold uppercase tracking-wider text-c-neutral-4 dark:text-c-neutral-5">Users</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				<StatisticWidget label="Users" number={statistics.overview?.users ?? 0} icon={IconUser} color="blue" loadDelay={delay()} />
				<StatisticWidget label="Active Users" number={statistics.overview?.active_users ?? 0} icon={IconUserRoundCheck} color="blue" loadDelay={delay()} />
				<StatisticWidget label="Confirmed Users" number={statistics.overview?.confirmed_users ?? 0} icon={IconUsers} color="teal" loadDelay={delay()} />
				<StatisticWidget label="Friends" number={statistics.overview?.friends ?? 0} icon={IconUserPlus} color="purple" loadDelay={delay()} />
				<StatisticWidget label="Notifications" number={statistics.overview?.ui_notifications ?? 0} icon={IconBell} color="yellow" loadDelay={delay()} />
			</div>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-sm font-semibold uppercase tracking-wider text-c-neutral-4 dark:text-c-neutral-5">Calendars</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				<StatisticWidget label="Calendars" number={statistics.overview?.calendars ?? 0} icon={IconCalendar} color="teal" loadDelay={delay()} />
				<StatisticWidget label="Events" number={statistics.overview?.calendar_events ?? 0} icon={IconCalendarDays} color="green" loadDelay={delay()} />
			</div>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-sm font-semibold uppercase tracking-wider text-c-neutral-4 dark:text-c-neutral-5">Todos</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				<StatisticWidget label="Todos" number={statistics.overview?.todos ?? 0} icon={IconCheckCheck} color="green" loadDelay={delay()} />
				<StatisticWidget label="Categories" number={statistics.overview?.todo_categories ?? 0} icon={IconFolderOpen} color="teal" loadDelay={delay()} />
				<StatisticWidget label="Workspaces" number={statistics.overview?.todo_workspaces ?? 0} icon={IconLayoutGrid} color="blue" loadDelay={delay()} />
			</div>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-sm font-semibold uppercase tracking-wider text-c-neutral-4 dark:text-c-neutral-5">Notes</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				<StatisticWidget label="Notes" number={statistics.overview?.notes ?? 0} icon={IconNotebook} color="yellow" loadDelay={delay()} />
				<StatisticWidget label="Folders" number={statistics.overview?.note_folders ?? 0} icon={IconFolderTree} color="orange" loadDelay={delay()} />
			</div>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-sm font-semibold uppercase tracking-wider text-c-neutral-4 dark:text-c-neutral-5">Libraries</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				<StatisticWidget label="Books" number={statistics.overview?.books ?? 0} icon={IconBook} color="orange" loadDelay={delay()} />
				<StatisticWidget label="Albums" number={statistics.overview?.albums ?? 0} icon={IconMusic} color="purple" loadDelay={delay()} />
				<StatisticWidget label="Movies" number={statistics.overview?.movies ?? 0} icon={IconClapperboard} color="red" loadDelay={delay()} />
				<StatisticWidget label="Recipes" number={statistics.overview?.recipes ?? 0} icon={IconCookingPot} color="teal" loadDelay={delay()} />
				<StatisticWidget label="Links" number={statistics.overview?.links ?? 0} icon={IconLink} color="blue" loadDelay={delay()} />
				<StatisticWidget label="Quotes" number={statistics.overview?.quotes ?? 0} icon={IconQuote} color="yellow" loadDelay={delay()} />
				<StatisticWidget label="Games" number={statistics.overview?.library_games ?? 0} icon={IconGamepad2} color="green" loadDelay={delay()} />
			</div>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-sm font-semibold uppercase tracking-wider text-c-neutral-4 dark:text-c-neutral-5">Contacts</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				<StatisticWidget label="Address Books" number={statistics.overview?.address_books ?? 0} icon={IconBookUser} color="yellow" loadDelay={delay()} />
				<StatisticWidget label="Contacts" number={statistics.overview?.contacts ?? 0} icon={IconUsers} color="blue" loadDelay={delay()} />
			</div>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-sm font-semibold uppercase tracking-wider text-c-neutral-4 dark:text-c-neutral-5">Check-in</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				<StatisticWidget label="Entries" number={statistics.overview?.check_in_entries ?? 0} icon={IconMapPin} color="red" loadDelay={delay()} />
			</div>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-sm font-semibold uppercase tracking-wider text-c-neutral-4 dark:text-c-neutral-5">Finances</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				<StatisticWidget label="Income Entries" number={statistics.overview?.income_entries ?? 0} icon={IconTrendingUp} color="green" loadDelay={delay()} />
				<StatisticWidget label="Wealth Entries" number={statistics.overview?.wealth_entries ?? 0} icon={IconLandmark} color="teal" loadDelay={delay()} />
			</div>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-sm font-semibold uppercase tracking-wider text-c-neutral-4 dark:text-c-neutral-5">Time Tracking</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				<StatisticWidget label="Entries" number={statistics.overview?.time_tracking_entries ?? 0} icon={IconClock} color="orange" loadDelay={delay()} />
				<StatisticWidget label="Categories" number={statistics.overview?.time_tracking_categories ?? 0} icon={IconLayers} color="teal" loadDelay={delay()} />
				<StatisticWidget label="Projects" number={statistics.overview?.time_tracking_projects ?? 0} icon={IconFolderKanban} color="blue" loadDelay={delay()} />
			</div>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-sm font-semibold uppercase tracking-wider text-c-neutral-4 dark:text-c-neutral-5">Feeds</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				<StatisticWidget label="Subscribed Feeds" number={statistics.overview?.feed_subscriptions ?? 0} icon={IconRss} color="orange" loadDelay={delay()} />
			</div>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-sm font-semibold uppercase tracking-wider text-c-neutral-4 dark:text-c-neutral-5">Other</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				<StatisticWidget label="Tags" number={statistics.overview?.tags ?? 0} icon={IconTag} color="purple" loadDelay={delay()} />
				<StatisticWidget label="AI Tokens" number={statistics.overview?.ai_tokens ?? 0} icon={IconCoins} color="yellow" loadDelay={delay()} />
			</div>
		</section>
	{/if}
</div>
