<script lang="ts">
	import logo from '$lib/assets/logo_cut.png';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { IS_DESKTOP, IS_MOBILE, IS_WEB } from '$lib/config/platform';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { minVersion, clientVersion }: { minVersion: string | null; clientVersion: string } = $props();

	const ts = getTranslation();

	function instruction(): string {
		if (IS_DESKTOP) return ts.get.update_required.instruction_desktop;
		if (IS_MOBILE) return ts.get.update_required.instruction_mobile;
		return ts.get.update_required.instruction_web;
	}

	// The service worker serves cached pages first, so a plain reload can bring
	// back the old build; fetching the new worker first replaces its cache.
	// The update fails when offline, which must not stop the reload.
	async function reloadLatestVersion(): Promise<void> {
		try {
			const registration = await navigator.serviceWorker?.getRegistration();
			await registration?.update();
		} finally {
			window.location.reload();
		}
	}
</script>

<div class="flex h-full w-full items-center justify-center p-4">
	<div class="flex w-full max-w-md flex-col items-center gap-4 rounded-lg border-2 border-white/5 bg-c-bg-surface px-8 py-6 text-center shadow-sm">
		<img src={logo} alt="" class="size-16" />
		<div class="text-2xl font-bold">{ts.get.update_required.title}</div>
		<p>{ts.get.update_required.explanation}</p>
		<p>{instruction()}</p>
		<div class="text-sm text-c-neutral-5 dark:text-c-neutral-4">
			{#if minVersion}
				<div>{ts.get.update_required.required_version.replace('%s', minVersion)}</div>
			{/if}
			{#if clientVersion}
				<div>{ts.get.update_required.your_version.replace('%s', clientVersion)}</div>
			{/if}
		</div>
		{#if IS_WEB}
			<TextButton title={ts.get.update_required.reload} onclick={reloadLatestVersion} class="w-full" />
		{/if}
	</div>
</div>
