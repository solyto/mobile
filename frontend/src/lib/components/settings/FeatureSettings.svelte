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
		loadingIndicator.start();
		await auth.updateJournalEnabled(value);
		loadingIndicator.stop();
	}

	async function onJournalCalendarMark(value: boolean): Promise<void> {
		loadingIndicator.start();
		await auth.updateJournalCalendarMark(value);
		loadingIndicator.stop();
	}

	async function onCheckInCalendarMark(value: boolean): Promise<void> {
		loadingIndicator.start();
		await auth.updateCheckInCalendarMark(value);
		loadingIndicator.stop();
	}
</script>

<div>
	<NavigationOrder />

	<div class="mt-8">
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
