<script lang="ts">
	import { legalUrls, hasLegalUrls } from '$lib/config/urls';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import IconScale from '@lucide/svelte/icons/scale';

	const ts = getTranslation();

	let { mobile = false } = $props<{ mobile?: boolean }>();

	let legalOpen = $state<boolean>(false);
	let legalClosedByOutside = false;
	let legalX = $state<number>(0);
	let legalY = $state<number>(0);
</script>

{#if hasLegalUrls}
	<div class="relative w-full">
		<button
			class="flex {mobile ? 'h-12' : 'h-14 hover:bg-c-nav-hover md:max-h-[5vh]'} w-full cursor-pointer items-center justify-center rounded-sm transition-all"
			title={ts.get.layout.legal_notice}
			onclick={(e) => {
				if (legalClosedByOutside) {
					legalClosedByOutside = false;
					return;
				}
				if (mobile) {
					legalX = window.innerWidth - e.clientX;
					legalY = window.innerHeight - e.clientY + 20;
				} else {
					legalX = e.clientX + 20;
					legalY = window.innerHeight - e.clientY;
				}
				legalOpen = !legalOpen;
			}}
		>
			<IconScale />
		</button>
		{#if legalOpen}
			<div
				class="fixed z-[9999] flex min-w-48 flex-col gap-2 rounded-lg bg-c-bg-elevated px-4 py-3 {mobile ? 'shadow-lg' : 'shadow-sm'}"
				style={mobile ? `bottom: ${legalY}px; right: ${legalX}px;` : `bottom: ${legalY}px; left: ${legalX}px;`}
				use:clickOutside={() => {
					legalOpen = false;
					legalClosedByOutside = true;
				}}
			>
				{#if legalUrls.legalNotice}
					<a href={legalUrls.legalNotice} target="_blank" class="text-sm hover:text-c-primary"
						>{ts.get.layout.legal_notice}</a
					>
				{/if}
				{#if legalUrls.privacy}
					<a href={legalUrls.privacy} target="_blank" class="text-sm hover:text-c-primary"
						>{ts.get.layout.privacy_policy}</a
					>
				{/if}
				{#if legalUrls.terms}
					<a href={legalUrls.terms} target="_blank" class="text-sm hover:text-c-primary"
						>{ts.get.layout.terms_of_service}</a
					>
				{/if}
			</div>
		{/if}
	</div>
{/if}
