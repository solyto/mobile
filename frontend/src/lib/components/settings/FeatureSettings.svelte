<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import SettingsSection from '$lib/components/settings/SettingsSection.svelte';
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import NavigationOrder from '$lib/components/settings/NavigationOrder.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';

	const ts = getTranslation();
	const auth = getAuth();
	const loadingIndicator = getLoadingIndicator();

	async function onJournalEnabled(value: boolean): Promise<void> {
		await withLoadingIndicator(() => auth.updateJournalEnabled(value));
	}

	async function onJournalCalendarMark(value: boolean): Promise<void> {
		await withLoadingIndicator(() => auth.updateJournalCalendarMark(value));
	}

	async function onCheckInCalendarMark(value: boolean): Promise<void> {
		await withLoadingIndicator(() => auth.updateCheckInCalendarMark(value));
	}

	async function withLoadingIndicator(action: () => Promise<unknown>): Promise<void> {
		loadingIndicator.start();
		try {
			await action();
		} finally {
			loadingIndicator.stop();
		}
	}
</script>

<div class="flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-16">
	<div class="xl:flex-1">
		<NavigationOrder />
	</div>

	<!-- Side by side, the rows start level with the feature list below its hint. -->
	<div class="xl:flex-1 xl:pt-6">
		<SettingsSection label={ts.get.settings.calendar_life_marks}>
			<div class="flex w-full flex-col gap-2">
				<div class="flex w-full justify-between">
					<span>{ts.get.settings.journal_enabled}</span>
					<Toggle
						checked={auth.user?.settings?.journal_enabled ?? false}
						onchange={onJournalEnabled}
					/>
				</div>
				<div class="flex w-full justify-between">
					<span>{ts.get.settings.journal_calendar_mark}</span>
					<Toggle
						checked={auth.user?.settings?.journal_calendar_mark ?? false}
						onchange={onJournalCalendarMark}
					/>
				</div>
				<div class="flex w-full justify-between">
					<span>{ts.get.settings.check_in_calendar_mark}</span>
					<Toggle
						checked={auth.user?.settings?.check_in_calendar_mark ?? false}
						onchange={onCheckInCalendarMark}
					/>
				</div>
			</div>
		</SettingsSection>
	</div>
</div>
