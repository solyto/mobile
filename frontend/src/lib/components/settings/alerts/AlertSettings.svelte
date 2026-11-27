<script lang="ts">
	import type { Alert, AlertSuggestion, AlertSuggestionKey } from '$lib/types/alert';
	import type { CheckInTracker } from '$lib/types/check_in';
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { getAlerts } from '$lib/state/Alerts.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';
	import { trackerLabel } from '$lib/helpers/CheckInHelper';
	import AlertService from '$lib/services/AlertService';
	import AlertEditor from '$lib/components/settings/alerts/AlertEditor.svelte';
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import SettingsSection from '$lib/components/settings/SettingsSection.svelte';
	import AddButton from '$lib/components/ui/buttons/AddButton.svelte';
	import EditButton from '$lib/components/ui/buttons/EditButton.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';

	const checkInData = getCheckInData();
	const alerts = getAlerts();
	const ts = getTranslation();
	const auth = getAuth();
	const saving = new SaveAction(() => ts.get.alerts.save_error);
	const addingSuggestion = new SaveAction(() => ts.get.alerts.save_error);
	const alertService = new AlertService();
	let editing = $state<Alert | 'new' | null>(null);

	const trackerAlerts = $derived(
		alerts.alerts.flatMap((alert) => {
			const tracker = findTracker(alert.check_in_tracker_id);
			return tracker ? [{ alert, tracker }] : [];
		})
	);

	function findTracker(id: number | null): CheckInTracker | null {
		return checkInData.trackers.find((t) => t.id === id) ?? null;
	}

	function details(alert: Alert): string {
		return [
			alert.state.active ? ts.get.alerts.active_now : null,
			alert.last_triggered_on ? ts.get.alerts.last_sent.replace('%s', auth.getDateWithoutYearInUserPreferredFormat(alert.last_triggered_on)) : null
		]
			.filter((part) => part !== null)
			.join(' · ');
	}

	function suggestionLabel(suggestion: AlertSuggestion): string {
		return ts.get.alerts[`suggestion_${suggestion.key}`];
	}


	function addSuggestion(key: AlertSuggestionKey): void {
		void addingSuggestion.runIfIdle(() => alerts.enableSuggestion(key));
	}
</script>

<div class="absolute top-0 right-0 flex h-8 items-center">
	<AddButton onClick={() => (editing = 'new')} title={ts.get.alerts.new_alert} />
</div>

<div class="flex w-full max-w-2xl flex-col gap-4">
	<p class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.alerts.description}</p>

	{#if alerts.loaded}
		{#if alerts.alerts.length === 0}
			<p class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.alerts.empty}</p>
		{:else}
			<div class="flex w-full flex-col gap-2">
				{#each trackerAlerts as { alert, tracker } (alert.id)}
					<div class="flex w-full items-center justify-between gap-3">
						<div class="flex min-w-0 flex-col" class:opacity-50={!alert.enabled}>
							<span>{trackerLabel(tracker, ts.get.checkIn)}: {alertService.describe(alert.rule, alert.threshold, alert.days, ts.get.alerts)}</span>
							{#if details(alert) !== ''}
								<span class="text-xs text-c-neutral-4 dark:text-c-neutral-5">{details(alert)}</span>
							{/if}
						</div>
						<div class="flex shrink-0 items-center gap-2">
							<!-- Goal alerts are changed on the Goals page; the hidden button keeps the columns aligned. -->
							<div class:invisible={alert.source === 'goal'}>
								<EditButton title={ts.get.alerts.edit_alert} onClick={() => (editing = alert)} inModal={false} buttonStyle="fill-on-hover" />
							</div>
							<Toggle checked={alert.enabled} onchange={() => saving.run(() => alerts.update(alert, { enabled: !alert.enabled }))} />
						</div>
					</div>
				{/each}
			</div>
		{/if}

		{#if alerts.suggestions.length > 0}
			<div class="mt-4">
				<SettingsSection label={ts.get.alerts.suggestions}>
					<div class="flex w-full flex-col gap-2">
						{#each alerts.suggestions as suggestion (suggestion.key)}
							<div class="flex w-full items-center justify-between gap-3">
								<span>{suggestionLabel(suggestion)}</span>
								<TextButton title={ts.get.alerts.suggestion_add} type="slight" disabled={addingSuggestion.busy} onclick={() => addSuggestion(suggestion.key)} />
							</div>
						{/each}
					</div>
				</SettingsSection>
			</div>
		{/if}
	{/if}
</div>

{#if editing !== null}
	<AlertEditor alert={editing === 'new' ? null : editing} onClose={() => (editing = null)} />
{/if}
