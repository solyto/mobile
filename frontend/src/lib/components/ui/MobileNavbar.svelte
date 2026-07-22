<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import IconEllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import NavEntry from '$lib/components/ui/NavEntry.svelte';
	import NavProfileEntry from '$lib/components/ui/NavProfileEntry.svelte';
	import NavLegalEntry from '$lib/components/ui/NavLegalEntry.svelte';
	import { urls } from '$lib/config/urls';
	import { navItems, mobileVisibleCount } from '$lib/config/navigation';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import NavEntryIcon from '$lib/components/ui/NavEntryIcon.svelte';
	import { getPageSlug } from '$lib/helpers/NavHelper';
	import { getNavigation } from '$lib/state/Navigation.svelte';

	const ts = getTranslation();
	const nav = getNavigation();

	let submenuVisible = $state<boolean>(false);

	function select(): void {
		submenuVisible = false;
	}

	let active = $derived(getPageSlug());
	const overflowOnlyItems: Record<string, { iconType: string }> = {
		settings: { iconType: 'settings' },
		profile: { iconType: 'profile' },
	};
	let activeInOverflow = $derived(
		nav.mobileOrder.slice(mobileVisibleCount).some((slug) => slug === active) || active in overflowOnlyItems
	);
	let activeOverflowItem = $derived(activeInOverflow ? (navItems[active] ?? overflowOnlyItems[active] ?? null) : null);
</script>

<div class="nav-mobile-container h-full p-1 bg-c-bg">
	<div
		class="nav-mobile gradient-right flex h-full w-full flex-row items-center justify-center rounded-md p-1 text-c-neutral-8 drop-shadow-xl dark:text-c-neutral-2"
	>
		{#each nav.mobileOrder.slice(0, mobileVisibleCount) as slug}
			{@const item = navItems[slug]}
			{#if item.featureFlag === null || nav.features[item.featureFlag]}
				<NavEntry slug={item.slug} href={item.href} title={ts.get.nav[item.translationKey]} active={active === item.slug} mobile={true} dataTour={item.dataTour} onSelect={select}>
					<NavEntryIcon type={item.iconType} />
				</NavEntry>
			{/if}
		{/each}
		<div
			class="relative flex h-full items-center justify-center rounded-sm"
			class:bg-c-btn={submenuVisible}
			class:text-white={submenuVisible}
			class:bg-c-nav-active={activeInOverflow && !submenuVisible}
			class:text-c-nav-active-text={activeInOverflow && !submenuVisible}
		>
			<button
				class="cursor-pointer p-4"
				onclick={() => {
					submenuVisible = !submenuVisible;
				}}
			>
				<div class="relative">
					<IconEllipsisVertical />
					{#if activeOverflowItem}
						<div
							class="absolute right-[-22px] top-[-20px] [&>svg]:size-5 rounded-full p-1 bg-c-nav-active shadow-xl shadow-c-neutral-5 border-c-neutral text-c-neutral"
							transition:scale
						>
							<NavEntryIcon type={activeOverflowItem.iconType} />
						</div>
					{/if}
				</div>
			</button>
			{#if submenuVisible}
				<div
					class="gradient-down absolute z-50 flex w-16 flex-col gap-2 rounded-lg p-1 text-c-neutral-8 shadow-lg dark:text-c-neutral-2"
					style="bottom:80px; right:15px;"
					transition:fly={{ x: 50, duration: 200 }}
				>
					{#each nav.mobileOrder.slice(mobileVisibleCount) as slug}
						{@const item = navItems[slug]}
						{#if item.featureFlag === null || nav.features[item.featureFlag]}
							<NavEntry slug={item.slug} href={item.href} title={ts.get.nav[item.translationKey]} active={active === item.slug} mobile={true} onSelect={select}>
								<NavEntryIcon type={item.iconType} />
							</NavEntry>
						{/if}
					{/each}
					<NavEntry
						slug="settings"
						href={urls.settings}
						title={ts.get.nav.settings}
						active={active === 'settings'}
						mobile={true}
						onSelect={select}
					>
						<NavEntryIcon type="settings" />
					</NavEntry>
					<NavProfileEntry active={active === 'profile'} mobile={true} onSelect={select} />
					<NavLegalEntry mobile={true} />
				</div>
			{/if}
		</div>
	</div>
</div>
