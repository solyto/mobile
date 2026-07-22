<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import IconSave from '@lucide/svelte/icons/save';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';

	const auth = getAuth();
	const loadingIndicator = getLoadingIndicator();

	let openaiApiKey = $derived<string | null>(auth?.user?.settings?.openai_api_key ?? null);
	let openaiApiKeyInput = $state<HTMLInputElement | null>(null);
	let openaiApiKeyValue = $state<string>('');

	async function updateToken(): Promise<void> {
		loadingIndicator.start();
		await auth.setOpenaiApiKey(openaiApiKeyValue != '' ? openaiApiKeyValue : null);
		await auth.loadAdditionalData();
		auth.save();
		loadingIndicator.stop();
	}
</script>

<div class="flex flex-col gap-2" in:fade>
	<div class="flex flex-row items-start gap-2">
		{#if openaiApiKey}
			<div class="text-sm wrap-anywhere">{openaiApiKey}</div>
			<div class="w-8">
				<DeleteButton
					onClick={() => {
						openaiApiKeyValue = '';
						updateToken();
					}}
					inModal={false}
				/>
			</div>
		{:else}
			<div class="w-80">
				<TextInput
					bind:input={openaiApiKeyInput}
					bind:value={openaiApiKeyValue}
					placeholder=""
				/>
			</div>
			<IconSave class="ml-4 text-c-btn-hover" onclick={updateToken} />
		{/if}
	</div>
</div>
