<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getAuth } from '$lib/state/Auth.svelte';
	import ApiService from '$lib/services/ApiService';
	import { onMount } from 'svelte';
	import { apiRoutes } from '$lib/config/apiRoutes';
	import type { Connection } from '$lib/types/telegram_bot_connection';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const auth = getAuth();
	const ts = getTranslation();
	const apiService = new ApiService(auth.getToken());

	let request = $state<Connection | null>(null);
	let loaded = $state<boolean>(false);

	onMount(async () => {
		const res = await apiService.get(apiRoutes.telegram.getRequest, null);
		if (res) request = res.data as Connection;
		loaded = true;
	});

	async function getConnection(): Promise<void> {
		const res = await apiService.get(apiRoutes.telegram.getToken, null);
		if (res) request = res.data as Connection;
	}
</script>

{#if loaded}
	<div in:fade>
		{#if request}
			{#if request.is_confirmed}
				<div class="text-sm break-all">
					{ts.get.settings.telegram_bot_integration_success.replace(
						'%s',
						request.chat_id ?? ''
					)}
				</div>
			{:else}
				<div class="text-sm wrap-anywhere" in:fade>
					{ts.get.settings.telegram_bot_token_created}
					<br />
					{ts.get.settings.telegram_bot_register.replace(
						'%s',
						'<a target="_blank" href="https://t.me/SolytoBot">bot</a>'
					)}:
					<br />
					<div class="mt-2 rounded-md bg-c-neutral px-2 py-1 text-xs break-all">
						/connect {request.token}
					</div>
				</div>
			{/if}
		{:else}
			<TextButton title={ts.get.settings.telegram_bot_create} onclick={() => getConnection()} />
		{/if}
	</div>
{/if}
