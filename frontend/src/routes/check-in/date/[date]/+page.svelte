<script lang="ts">
	import type { CheckInTracker } from '$lib/types/check_in';
	import DailyCheckIn from '$lib/components/check-in/daily/DailyCheckIn.svelte';
	import DailyLogTracker from '$lib/components/check-in/daily/DailyLogTracker.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { page } from '$app/state';
	import { afterNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { urls } from '$lib/config/urls';
	import { SvelteMap } from 'svelte/reactivity';
	import { formatDate, getUrlFormat, isDateToday, isDateYesterday, parseUrlFormat } from '$lib/helpers/DateHelper';
	import { goalProgressText, trackerLabel } from '$lib/helpers/CheckInHelper';
	import type { GoalLine } from '$lib/types/goal';
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { getGoals } from '$lib/state/Goals.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const checkInData = getCheckInData();
	const goals = getGoals();
	const auth = getAuth();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

	const SIDE_COLUMN =
		'2xl:col-start-3 2xl:mr-0 2xl:ml-16 2xl:w-auto 2xl:max-w-[22rem] 2xl:border-l-2 2xl:border-c-neutral-1 2xl:pl-6 dark:2xl:border-s-dark';

	// Unsaved changes by tracker id: the settings reload the trackers as new objects while this page stays open.
	const pending = new SvelteMap<number, number | null>();
	const changes = $derived(checkInData.trackerService.pendingChanges(checkInData.activeTrackers, pending));

	let saving = $state<boolean>(false);

	let date = $derived(page.params.date ?? '');
	let parsedDate = $derived(parseUrlFormat(date));
	const isToday = $derived(parsedDate !== null && isDateToday(parsedDate));
	const isYesterday = $derived(parsedDate !== null && isDateYesterday(parsedDate));

	afterNavigate(() => {
		pending.clear();
		// A link without a valid date (a mangled bookmark) opens today instead, as the journal does.
		if (parsedDate === null) {
			void goto(resolve(urls.checkInDate, { date: getUrlFormat(new Date()) }), { replaceState: true });
			return;
		}
		void checkInData.loadValuesFrom(date);
	});

	// Today only: the goal's period is the one running now.
	function goalLine(tracker: CheckInTracker): GoalLine | null {
		const goal = goals.forTracker(tracker.id);
		if (!goal || !isToday || parsedDate === null) return null;

		const progress = checkInData.trackerService.goalProgress(goal, tracker, checkInData.index, parsedDate, auth.getWeekStart());
		return { text: goalProgressText(goal, tracker, progress, ts.get.checkIn), met: progress.met };
	}

	function shownValue(tracker: CheckInTracker): number | null {
		const pendingValue = pending.get(tracker.id);
		return pendingValue !== undefined ? pendingValue : checkInData.getValue(tracker, date);
	}

	async function onSave(): Promise<void> {
		if (changes.size === 0 || saving) return;
		saving = true;
		const saved = new Map(changes);
		loadingIndicator.start();
		let ok: boolean;
		try {
			ok = await checkInData.saveDay(date, saved);
		} finally {
			loadingIndicator.stop();
			saving = false;
		}

		if (ok) {
			for (const [tracker, value] of saved) {
				if (pending.get(tracker.id) === value) pending.delete(tracker.id);
			}
			notifications.success(ts.get.checkIn.save_success);
			// Goal progress is worked out on the server, so the Goals tab needs it fresh.
			void goals.load();
		} else {
			notifications.error(ts.get.checkIn.save_error);
		}
	}
</script>

<div class="relative mt-8 flex flex-col gap-8 pb-8 2xl:pb-0">
	<div class="flex w-full flex-col items-center justify-center gap-1">
		<h2 class="text-3xl font-bold">
			{#if isToday}
				{ts.get.checkIn.today}
			{:else if isYesterday}
				{ts.get.checkInSummary.day_yesterday}
			{:else if parsedDate}
				{formatDate(parsedDate)}
			{/if}
		</h2>
	</div>

	{#if checkInData.activeTrackers.length > 0}
		<div
			class="z-10 flex w-full justify-center max-sm:sticky max-sm:bottom-4 max-sm:order-last max-sm:px-4 sm:absolute sm:top-0 sm:right-8 sm:w-auto"
			class:max-sm:hidden={changes.size === 0}
		>
			<TextButton title={ts.get.layout.save} onclick={onSave} disabled={changes.size === 0 || saving} class="max-sm:h-14 max-sm:w-full max-sm:shadow-md" />
		</div>
	{/if}

	<div class="flex flex-col gap-6 md:mx-auto md:w-fit 2xl:grid 2xl:w-full 2xl:grid-cols-[1fr_auto_1fr] 2xl:items-start 2xl:gap-0">
		{#if checkInData.ratingTrackers.length > 0}
			<section class="flex flex-col space-y-3 2xl:col-start-2">
				{#each checkInData.ratingTrackers as tracker (tracker.id)}
					<DailyCheckIn
						{tracker}
						label={trackerLabel(tracker, ts.get.checkIn)}
						currentValue={shownValue(tracker)}
						onChange={(changed, value) => pending.set(changed.id, value)}
						selectedSports={checkInData.selectedSports}
						goalLine={goalLine(tracker)}
					/>
				{/each}
			</section>
		{/if}

		{#if checkInData.logTrackers.length > 0}
			<section class={['flex flex-col gap-1 px-5 md:px-0 2xl:mx-auto 2xl:w-[26rem]', checkInData.ratingTrackers.length > 0 && SIDE_COLUMN]}>
				{#each checkInData.logTrackers as tracker (tracker.id)}
					<DailyLogTracker
						{tracker}
						label={trackerLabel(tracker, ts.get.checkIn)}
						value={shownValue(tracker)}
						goalLine={goalLine(tracker)}
						onSet={(value) => pending.set(tracker.id, value)}
					/>
				{/each}
			</section>
		{/if}
	</div>
</div>

