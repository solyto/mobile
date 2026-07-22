<script lang="ts">
	import { blur, fade } from 'svelte/transition';
	import { resolve } from '$app/paths';
	import StaggeredLogo from '$lib/components/ui/StaggeredLogo.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { setCustomApiUrl, dropCustomApiUrl } from '$lib/config/platform';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { urls } from '$lib/config/urls';

	const ts = getTranslation();

	let step = $state<number>(0);
	let customApiUrl = $state<string>('');
	let checking = $state<boolean>(false);
	let urlError = $state<boolean>(false);

	function chooseHosted(): void {
		dropCustomApiUrl();
		window.location.href = resolve(urls.login);
	}

	function chooseSelfhosted(): void {
		step = 1;
	}

	async function saveSelfhosted(): Promise<void> {
		urlError = false;
		checking = true;

		const baseUrl = customApiUrl.replace(/\/+$/, '');

		try {
			const res = await fetch(`${baseUrl}/api/v1/health`);
			if (!res.ok) throw new Error();
			const data = await res.json();
			if (data?.app !== 'solyto' || !data?.version) throw new Error();
			setCustomApiUrl(baseUrl);
			window.location.href = resolve(urls.login);
		} catch {
			urlError = true;
		} finally {
			checking = false;
		}
	}
</script>

<div class="flex w-full max-w-md flex-col items-center gap-12">
	<div style="width: 56px; height: 71px;">
		<StaggeredLogo path="../" />
	</div>

	{#if step === 0}
		<div class="flex w-full flex-col-reverse gap-3 md:flex-row" in:blur>
			<button
				class="flex flex-1 max-md:mx-4 cursor-pointer flex-col gap-2 rounded-lg border-2 border-white/5 bg-white px-8 py-6 text-left shadow-sm transition-colors hover:bg-c-neutral-1 dark:bg-s-dark-2 dark:hover:bg-s-dark"
				onclick={chooseSelfhosted}
			>
				<span class="font-semibold">{ts.get.setup.selfhosted_title}</span>
				<span class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.setup.selfhosted_description}</span>
			</button>
			<button
				class="flex flex-1 max-md:mx-4 cursor-pointer flex-col gap-2 rounded-lg border-2 border-white/5 bg-white px-8 py-6 text-left shadow-sm transition-colors hover:bg-c-neutral-1 dark:bg-s-dark-2 dark:hover:bg-s-dark"
				onclick={chooseHosted}
			>
				<span class="font-semibold">{ts.get.setup.hosted_title}</span>
				<span class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.setup.hosted_description}</span>
			</button>
		</div>
	{:else if step === 1}
		<div
			class="flex w-full flex-col gap-4 rounded-lg border-2 border-white/5 bg-white px-8 pt-6 pb-8 shadow-sm dark:bg-s-dark-2"
			in:blur
		>
			<label class="label">
				<div class="label-text mb-2 text-sm font-bold dark:text-white">{ts.get.setup.api_url_label}</div>
				<TextInput
					placeholder={ts.get.setup.api_url_placeholder}
					bind:value={customApiUrl}
				/>
				{#if urlError}
					<p class="mt-2 pl-2 text-xs text-red-500" in:fade>{ts.get.setup.url_error}</p>
				{/if}
			</label>
			<div class="mt-2 flex items-center justify-end">
				<TextButton
					title={checking ? ts.get.setup.checking : ts.get.setup.continue}
					onclick={saveSelfhosted}
					disabled={checking || !customApiUrl.trim()}
					class="w-full"
				/>
			</div>
		</div>
	{/if}
</div>
