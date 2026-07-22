<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getAuth } from '$lib/state/Auth.svelte';
	import ApiService from '$lib/services/ApiService';
	import { onMount } from 'svelte';
	import { apiRoutes } from '$lib/config/apiRoutes';
	import type { Connection } from '$lib/types/telegram_bot_connection';
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const auth = getAuth();
	const apiService = new ApiService(auth.getToken());
	const loadingIndicator = getLoadingIndicator();
	const ts = getTranslation();

	let request = $state<Connection | null>(null);
	let loaded = $state<boolean>(false);
	let yourDayAlert = $state<boolean>(false);
	let checkInAlert = $state<boolean>(false);

	onMount(async () => {
		const res = await apiService.get(apiRoutes.telegram.getRequest, null);
		if (res) request = res.data as Connection;
		yourDayAlert = request?.your_day_alert ?? false;
		checkInAlert = request?.check_in_alert ?? false;
		loaded = true;
	});

	async function onToggleYourDayAlert(): Promise<void> {
		loadingIndicator.start();
		await apiService.put(apiRoutes.telegram.updateYourDayAlert, {
			your_day_alert: yourDayAlert
		});
		loadingIndicator.stop();
	}

	async function onToggleCheckInAlert(): Promise<void> {
		loadingIndicator.start();
		await apiService.put(apiRoutes.telegram.updateCheckInAlert, {
			check_in_alert: checkInAlert
		});
		loadingIndicator.stop();
	}
</script>

{#if loaded}
	<div in:fade>
		{#if request}
			{#if request.is_confirmed}
				<div class="mt-4 flex w-full flex-col gap-2">
					<div class="flex items-center justify-between">
						<Toggle
							label={ts.get.notifications.daily_day_reminder}
							bind:checked={yourDayAlert}
							onchange={onToggleYourDayAlert}
						/>
					</div>
					<div class="flex items-center justify-between">
						<Toggle
							label={ts.get.notifications.daily_check_in_reminder}
							bind:checked={checkInAlert}
							onchange={onToggleCheckInAlert}
						/>
					</div>
				</div>
			{/if}
		{:else}
			{ts.get.settings.telegram_bot_not_connected}
		{/if}
	</div>
{/if}
