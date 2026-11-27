<script lang="ts">
	import { resolve } from '$app/paths';
	import { legalUrls, urls } from '$lib/config/urls';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import IconScale from '$lib/icons/lucide/scale.svelte';

	const ts = getTranslation();

	let {
		mobile = false,
		onSelect = () => {}
	}: {
		mobile?: boolean;
		onSelect?: () => void;
	} = $props();

	const MOBILE_LIFT = 20;
	const DESKTOP_GAP = 20;
	const LINK = 'text-sm hover:text-c-primary';

	let legalOpen = $state<boolean>(false);
	let legalClosedByOutside = false;
	let legalX = $state<number>(0);
	let legalY = $state<number>(0);

	function toggleLegal(e: MouseEvent): void {
		if (legalClosedByOutside) {
			legalClosedByOutside = false;
			return;
		}
		anchorAt(e);
		legalOpen = !legalOpen;
	}

	function anchorAt(e: MouseEvent): void {
		if (mobile) {
			legalX = window.innerWidth - e.clientX;
			legalY = window.innerHeight - e.clientY + MOBILE_LIFT;
		} else {
			legalX = e.clientX + DESKTOP_GAP;
			legalY = window.innerHeight - e.clientY;
		}
	}

	function popupPosition(): string {
		return mobile ? `bottom: ${legalY}px; right: ${legalX}px;` : `bottom: ${legalY}px; left: ${legalX}px;`;
	}

	function closeFromOutside(): void {
		legalOpen = false;
		legalClosedByOutside = true;
	}

	function openAttributions(): void {
		legalOpen = false;
		onSelect();
	}
</script>

<div class="relative w-full">
	<button
		class="flex {mobile ? 'h-12' : 'h-14 hover:bg-c-nav-hover md:max-h-[5vh]'} w-full cursor-pointer items-center justify-center rounded-sm transition-all"
		title={ts.get.layout.legal}
		onclick={toggleLegal}
	>
		<IconScale />
	</button>
	{#if legalOpen}
		<div
			class="fixed z-[9999] flex min-w-48 flex-col gap-2 rounded-lg bg-c-bg-elevated px-4 py-3 {mobile ? 'shadow-lg' : 'shadow-sm'}"
			style={popupPosition()}
			use:clickOutside={closeFromOutside}
		>
			{#if legalUrls.legalNotice}
				<a href={legalUrls.legalNotice} target="_blank" class={LINK}>{ts.get.layout.legal_notice}</a>
			{/if}
			{#if legalUrls.privacy}
				<a href={legalUrls.privacy} target="_blank" class={LINK}>{ts.get.layout.privacy_policy}</a>
			{/if}
			{#if legalUrls.terms}
				<a href={legalUrls.terms} target="_blank" class={LINK}>{ts.get.layout.terms_of_service}</a>
			{/if}
			<a href={resolve(urls.attributions)} class={LINK} onclick={openAttributions}>{ts.get.layout.open_source_licenses}</a>
		</div>
	{/if}
</div>
