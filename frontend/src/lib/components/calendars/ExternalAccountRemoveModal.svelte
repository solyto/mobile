<script lang="ts">
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import { getExternalCalendars } from '$lib/state/ExternalCalendars.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const externalCalendars = getExternalCalendars();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const ts = getTranslation();

	async function remove(): Promise<void> {
		const account = externalCalendars.removal;
		if (!account) return;

		externalCalendars.removal = null;
		loadingIndicator.start();
		const ok = await externalCalendars.deleteAccount(account);
		loadingIndicator.stop();

		if (ok) {
			notifications.success(ts.get.calendar.account_remove_success);
		} else {
			notifications.error(ts.get.calendar.account_remove_error);
		}
	}
</script>

{#if externalCalendars.removal}
	<ConfirmationModal
		title={ts.get.calendar.account_remove_title}
		description={ts.get.calendar.account_remove_description}
		type="confirm-delete"
		onConfirm={remove}
		onCancel={() => (externalCalendars.removal = null)}
	/>
{/if}
