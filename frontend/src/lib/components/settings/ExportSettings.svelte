<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import ApiService from '$lib/services/ApiService';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import { onMount } from 'svelte';
	import { apiRoutes } from '$lib/config/apiRoutes';

	const ts = getTranslation();
	const auth = getAuth();
	const uiNotifications = getUiNotifications();
	const apiService = new ApiService(auth.getToken());

	const FEATURES = [
		{ key: 'todos', label: 'Todos' },
		{ key: 'notes', label: 'Notes' },
		{ key: 'calendars', label: 'Calendar' },
		{ key: 'contacts', label: 'Contacts' },
		{ key: 'feeds', label: 'Feeds' },
		{ key: 'links', label: 'Links' },
		{ key: 'music', label: 'Music' },
		{ key: 'books', label: 'Books' },
		{ key: 'games', label: 'Games' },
		{ key: 'recipes', label: 'Recipes' },
		{ key: 'quotes', label: 'Quotes' },
		{ key: 'checkIn', label: 'Check-in' },
		{ key: 'timeTracking', label: 'Time Tracking' },
		{ key: 'financesIncome', label: 'Budget' },
		{ key: 'financesWealth', label: 'Wealth' }
	] as const;

	let selected = $state<Record<string, boolean>>(
		Object.fromEntries(FEATURES.map((f) => [f.key, true]))
	);
	let loading = $state(false);
	let exportStatus = $state<any>(null);

	onMount(async () => {
		await loadStatus();
	});

	async function loadStatus() {
		const res: any = await apiService.list(apiRoutes.export.status);
		if (res?.success) {
			exportStatus = res.data;
		}
	}

	function selectAll() {
		selected = Object.fromEntries(FEATURES.map((f) => [f.key, true]));
	}

	function deselectAll() {
		selected = Object.fromEntries(FEATURES.map((f) => [f.key, false]));
	}

	async function startExport() {
		const features = FEATURES.filter((f) => selected[f.key]).map((f) => f.key);
		if (features.length === 0) {
			uiNotifications.error('Please select at least one feature.');
			return;
		}

		loading = true;
		const res = await apiService.postRaw<{ success: boolean; message?: string }>(apiRoutes.export.start, { features });

		if (res.success) {
			uiNotifications.success(res.message ?? '');
			await loadStatus();
		} else if (res.message) {
			uiNotifications.error(res.message);
		} else {
			uiNotifications.error('Export failed.');
		}
		loading = false;
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
		const url = apiRoutes.export.download.replace('%s', String(exportStatus.id));
		const res = await fetch(url, {
			headers: { Authorization: 'Bearer ' + auth.getToken(), Accept: 'application/zip' }
		});
		if (!res.ok) {
			uiNotifications.error('Download failed.');
			return;
		}
		const blob = await res.blob();
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = 'export_' + exportStatus.id + '.zip';
		a.click();
		URL.revokeObjectURL(a.href);
	}
</script>

<div class="flex flex-col gap-6 md:p-4 md:pt-6">
	<p class="text-c-neutral-5">{ts.get.settings.export_select_features}</p>

	<div class="flex w-full flex-col gap-2">
		{#each FEATURES as feature (feature.key)}
			<div class="flex w-full justify-between">
				<span>{feature.label}</span>
				<Toggle bind:checked={selected[feature.key]} onchange={() => {}} />
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

	{#if exportStatus}
		<div class="flex flex-col gap-2 rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow dark:md:dark:bg-s-dark-2">
			<p class="text-lg font-semibold text-c-heading dark:text-c-primary">{getStatusText(exportStatus.status)}</p>
			<p class="text-c-neutral-4 text-sm">
				{new Date(exportStatus.created_at).toLocaleString()}
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
					{ts.get.settings.export_expires_at}: {new Date(exportStatus.expires_at).toLocaleString()}
				</p>
			{/if}
		</div>
	{:else}
		<p class="text-c-neutral-4">{ts.get.settings.export_no_exports}</p>
	{/if}
</div>
