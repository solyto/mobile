<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { getTelegramBot } from '$lib/state/TelegramBot.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const BOT_URL = 'https://t.me/SolytoBot';
	const BOT_HANDLE = '@SolytoBot';

	const telegramBot = getTelegramBot();
	const ts = getTranslation();

	let loaded = $state<boolean>(false);

	onMount(async () => {
		await telegramBot.load();
		loaded = true;
	});

	// The sentence names the bot where its %s is; the bot's handle is the link.
	function registerBefore(): string {
		return ts.get.settings.telegram_bot_register.split('%s')[0];
	}

	function registerAfter(): string {
		return ts.get.settings.telegram_bot_register.split('%s')[1] ?? '';
	}
</script>

{#if loaded}
	<div in:fade>
		{#if telegramBot.connection}
			{@const request = telegramBot.connection}
			{#if request.is_confirmed}
				<div class="text-sm break-all">
					{ts.get.settings.telegram_bot_integration_success.replace('%s', request.chat_id ?? '')}
				</div>
			{:else}
				<div class="text-sm wrap-anywhere" in:fade>
					{ts.get.settings.telegram_bot_token_created}
					<br />
					{registerBefore()}<a target="_blank" rel="noopener noreferrer" href={BOT_URL} class="underline">{BOT_HANDLE}</a>{registerAfter()}:
					<br />
					<div class="mt-2 rounded-md bg-c-neutral px-2 py-1 text-xs break-all">
						/connect {request.token}
					</div>
				</div>
			{/if}
		{:else}
			<TextButton title={ts.get.settings.telegram_bot_create} onclick={() => telegramBot.requestToken()} />
		{/if}
	</div>
{/if}
