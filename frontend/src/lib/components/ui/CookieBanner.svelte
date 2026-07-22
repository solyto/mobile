<script lang="ts">
	import { slide } from 'svelte/transition';
	import { getCookieConsent } from '$lib/state/CookieConsent.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { urls } from '$lib/config/urls';

	const consent = getCookieConsent();
	const ts = getTranslation();
</script>

{#if !consent.acknowledged}
	<div
		transition:slide={{ duration: 250 }}
		class="fixed inset-x-0 bottom-0 z-[110] border-c-neutral-2 bg-c-bg-modal/60 border-t-1 shadow-xl backdrop-blur-md dark:border-s-dark/60 dark:bg-s-dark-2/70"
	>
		<div class="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
			<div class="grow text-sm text-c-neutral-7 dark:text-c-neutral-3">
				<span class="mr-1 font-semibold text-c-neutral-9 dark:text-white">
					{ts.get.cookie_consent.title}
				</span>
				{ts.get.cookie_consent.body}
				<a
					href="{urls.landingPage}/#privacy"
					target="_blank"
					rel="noopener noreferrer"
					class="ml-1 text-c-primary underline hover:text-c-primary/80"
				>
					{ts.get.cookie_consent.privacy_policy}
				</a>
			</div>
			<button
				onclick={() => consent.acknowledge()}
				class="shrink-0 cursor-pointer rounded-lg bg-c-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-c-primary/80"
			>
				{ts.get.cookie_consent.accept}
			</button>
		</div>
	</div>
{/if}
