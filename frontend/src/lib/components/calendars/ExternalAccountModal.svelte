<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import ExternalAccountForm from '$lib/components/calendars/ExternalAccountForm.svelte';
	import ExternalCalendarPicker from '$lib/components/calendars/ExternalCalendarPicker.svelte';
	import { getExternalCalendars } from '$lib/state/ExternalCalendars.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { ExternalAccountDialog, ExternalCalendarAccount } from '$lib/types/calendar';

	const externalCalendars = getExternalCalendars();
	const notifications = getUiNotifications();
	const ts = getTranslation();

	function title(dialog: ExternalAccountDialog): string {
		if (dialog.step === 'credentials') return ts.get.calendar.account_change_password;
		if (dialog.step === 'calendars') return externalCalendars.service.host(dialog.account.server_url);
		return ts.get.calendar.connect_calendar;
	}

	function chooseCalendars(account: ExternalCalendarAccount): void {
		externalCalendars.openDialog({ step: 'calendars', account });
	}

	function passwordUpdated(): void {
		notifications.success(ts.get.calendar.account_password_updated);
		const dialog = externalCalendars.dialog;
		if (dialog?.step === 'credentials' && dialog.returnToCalendars) {
			externalCalendars.openDialog({ step: 'calendars', account: dialog.account });
		} else {
			externalCalendars.closeDialog();
		}
	}

	function close(): void {
		externalCalendars.closeDialog();
	}
</script>

{#if externalCalendars.dialog}
	<ContentModal title={title(externalCalendars.dialog)} onClose={close} rounded="2xl" showTitleOnMobile={true}>
		{#if externalCalendars.dialog.step === 'connect'}
			<ExternalAccountForm onSaved={chooseCalendars} />
		{:else if externalCalendars.dialog.step === 'credentials'}
			<ExternalAccountForm account={externalCalendars.dialog.account} onSaved={passwordUpdated} />
		{:else}
			<ExternalCalendarPicker account={externalCalendars.dialog.account} onDone={close} />
		{/if}
	</ContentModal>
{/if}
