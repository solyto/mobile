<script lang="ts">
	import { blur, fade } from 'svelte/transition';
	import { resolve } from '$app/paths';
	import StaggeredLogo from '$lib/components/ui/StaggeredLogo.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { setCustomApiUrl, dropCustomApiUrl } from '$lib/config/platform';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { urls } from '$lib/config/urls';
	import IconChevronLeft from '@lucide/svelte/icons/chevron-left';

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

	function backToChoice(): void {
		urlError = false;
		step = 0;
	}

	async function saveSelfhosted(): Promise<void> {
		urlError = false;
		checking = true;

		const baseUrl = customApiUrl.replace(/\/+$/, '');

		try {
			// No X-Client-Version here: servers up to 1.0.15 reject it in their CORS
			// preflight. An outdated server is announced once the app has loaded.
			const res = await fetch(`${baseUrl}/api/v1/health`);
			if (!res.ok) throw new Error();
			const data = await res.json();
			const health = data?.data ?? data;
			if (health?.app !== 'solyto' || !health?.version) throw new Error();
			setCustomApiUrl(baseUrl);
			window.location.href = resolve(urls.login);
		} catch {
			urlError = true;
		} finally {
			checking = false;
		}
	}
</script>

{#if step === 1}
	<button
		class="fixed top-5 right-5 flex cursor-pointer items-center gap-1 rounded-full border-2 border-white/5 bg-c-bg-surface py-1.5 pr-4 pl-3 text-sm font-medium text-c-neutral-7 shadow-sm transition-colors hover:bg-c-neutral-1 dark:text-c-neutral-2 dark:hover:bg-s-dark"
		onclick={backToChoice}
		disabled={checking}
	>
		<IconChevronLeft size={16} />
		<span class="leading-none">{ts.get.setup.back}</span>
	</button>
{/if}

<div class="flex w-full max-w-md flex-col items-center gap-12">
	<div style="width: 56px; height: 71px;">
		<StaggeredLogo path="../" />
	</div>

	{#if step === 0}
		<div class="flex w-full flex-col-reverse gap-3 md:flex-row" in:blur>
			<button
				class="flex flex-1 max-md:mx-4 cursor-pointer flex-col gap-2 rounded-lg border-2 border-white/5 bg-c-bg-surface px-8 py-6 text-left shadow-sm transition-colors hover:bg-c-neutral-1 dark:hover:bg-s-dark"
				onclick={chooseSelfhosted}
			>
				<span class="font-semibold">{ts.get.setup.selfhosted_title}</span>
				<span class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.setup.selfhosted_description}</span>
			</button>
			<button
				class="flex flex-1 max-md:mx-4 cursor-pointer flex-col gap-2 rounded-lg border-2 border-white/5 bg-c-bg-surface px-8 py-6 text-left shadow-sm transition-colors hover:bg-c-neutral-1 dark:hover:bg-s-dark"
				onclick={chooseHosted}
			>
				<span class="font-semibold">{ts.get.setup.hosted_title}</span>
				<span class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.setup.hosted_description}</span>
			</button>
		</div>
	{:else if step === 1}
		<div
			class="flex flex-col gap-4 self-stretch rounded-lg border-2 border-white/5 bg-c-bg-surface px-8 pt-6 pb-8 shadow-sm max-md:mx-4"
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
