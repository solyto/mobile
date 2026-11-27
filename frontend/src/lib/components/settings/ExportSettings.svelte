<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getDataExport } from '$lib/state/DataExport.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import { onMount } from 'svelte';
	import { RateLimitedError } from '$lib/services/ApiService';
	import { exportRateLimitedMessage } from '$lib/helpers/NetworkErrorHelper';
	import { downloadBlob } from '$lib/helpers/DownloadHelper';

	const ts = getTranslation();
	const dataExport = getDataExport();
	const uiNotifications = getUiNotifications();

	const FEATURES = [
		'todos',
		'notes',
		'calendars',
		'contacts',
		'feeds',
		'links',
		'music',
		'books',
		'games',
		'recipes',
		'quotes',
		'checkIn',
		'timeTracking',
		'financesIncome',
		'financesWealth'
	] as const;

	type ExportFeature = (typeof FEATURES)[number];

	let featureLabels = $derived<Record<ExportFeature, string>>({
		todos: ts.get.nav.todos,
		notes: ts.get.nav.notes,
		calendars: ts.get.nav.calendar,
		contacts: ts.get.nav.contacts,
		feeds: ts.get.nav.feeds,
		links: ts.get.libraries.navigation.links,
		music: ts.get.libraries.navigation.music,
		books: ts.get.libraries.navigation.books,
		games: ts.get.libraries.navigation.games,
		recipes: ts.get.libraries.navigation.recipes,
		quotes: ts.get.libraries.navigation.quotes,
		checkIn: ts.get.nav.checkIn,
		timeTracking: ts.get.nav.timeTracking,
		financesIncome: ts.get.finances.budget,
		financesWealth: ts.get.finances.wealth
	});
	let selected = $state<Record<string, boolean>>(selection(true));
	let loading = $state(false);

	onMount(() => dataExport.loadStatus());

	function selection(value: boolean): Record<string, boolean> {
		return Object.fromEntries(FEATURES.map((feature) => [feature, value]));
	}

	function selectAll() {
		selected = selection(true);
	}

	function deselectAll() {
		selected = selection(false);
	}

	function formatDate(date: string): string {
		return new Date(date).toLocaleString(ts.locale);
	}

	async function startExport() {
		const features = FEATURES.filter((feature) => selected[feature]);
		if (features.length === 0) {
			uiNotifications.error(ts.get.settings.export_select_at_least_one);
			return;
		}

		loading = true;
		try {
			const res = await dataExport.start(features);

			if (res.success) {
				uiNotifications.success(res.message ?? '');
				await dataExport.loadStatus();
			} else if (res.message) {
				uiNotifications.error(res.message);
			} else {
				uiNotifications.error(ts.get.settings.export_status_failed);
			}
		} catch (e) {
			if (!(e instanceof RateLimitedError) || e.code !== 'export_rate_limited') throw e;
			uiNotifications.error(exportRateLimitedMessage(e.retryAfter, ts.get.settings));
		} finally {
			loading = false;
		}
	}

	function getStatusText(status: string): string {
		switch (status) {
			case 'pending':
				return ts.get.settings.export_status_pending;
			case 'in_progress':
				return ts.get.settings.export_status_in_progress;
			case 'completed':
				return ts.get.settings.export_status_completed;
			case 'failed':
				return ts.get.settings.export_status_failed;
			default:
				return status;
		}
	}

	async function downloadExport() {
		const status = dataExport.status;
		if (!status) return;
		const blob = await dataExport.download(status);
		if (!blob) {
			uiNotifications.error(ts.get.settings.export_download_failed);
			return;
		}
		downloadBlob(blob, 'export_' + status.id + '.zip');
	}
</script>

<div class="flex flex-col gap-6">
	<p class="text-c-neutral-5">{ts.get.settings.export_select_features}</p>

	<div class="flex w-full flex-col gap-2">
		{#each FEATURES as feature (feature)}
			<div class="flex w-full justify-between">
				<span>{featureLabels[feature]}</span>
				<Toggle bind:checked={selected[feature]} />
			</div>
		{/each}
	</div>

	<div class="flex gap-2">
		<TextButton title={ts.get.settings.export_select_all} onclick={selectAll} type="slight" />
		<TextButton title={ts.get.settings.export_deselect_all} onclick={deselectAll} type="slight" />
	</div>

	<TextButton
		title={ts.get.settings.export_start}
		onclick={startExport}
		type="btn"
		class={loading ? 'opacity-50 cursor-wait' : ''}
	/>

	{#if dataExport.status}
		{@const exportStatus = dataExport.status}
		<div class="flex flex-col gap-2 rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow dark:md:dark:bg-s-dark-2">
			<p class="text-lg font-semibold text-c-heading dark:text-c-primary">{getStatusText(exportStatus.status)}</p>
			<p class="text-c-neutral-4 text-sm">
				{formatDate(exportStatus.created_at)}
			</p>

			{#if exportStatus.status === 'completed' && !exportStatus.is_expired}
				<div class="mt-2">
					<TextButton title={ts.get.settings.export_download} type="action" onclick={downloadExport} />
				</div>
			{/if}

			{#if exportStatus.status === 'completed' && exportStatus.is_expired}
				<p class="text-c-danger text-sm">{ts.get.settings.export_expired}</p>
			{/if}

			{#if exportStatus.expires_at && !exportStatus.is_expired}
				<p class="text-c-neutral-4 text-xs">
					{ts.get.settings.export_expires_at}: {formatDate(exportStatus.expires_at)}
				</p>
			{/if}
		</div>
	{:else}
		<p class="text-c-neutral-4">{ts.get.settings.export_no_exports}</p>
	{/if}
</div>
