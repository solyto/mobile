<script lang="ts">
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import IconGripVertical from '@lucide/svelte/icons/grip-vertical';
	import IconLock from '@lucide/svelte/icons/lock';
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import SegmentedControl from '$lib/components/forms/SegmentedControl.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getNavigation } from '$lib/state/Navigation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';
	import { mobileVisibleCount, navItems, pinnedNavItem, type NavItem } from '$lib/config/navigation';
	import type { NavigationLayout } from '$lib/types/navigation';

	type OrderItem = { id: string; item: NavItem };

	const ts = getTranslation();
	const nav = getNavigation();
	const loadingIndicator = getLoadingIndicator();
	const viewPoint = getViewPoint();

	const flipDurationMs = 200;

	let layout = $state<NavigationLayout>(viewPoint.isDesktop ? 'desktop' : 'mobile');
	let items = $derived<OrderItem[]>(sortableItems(nav.orderFor(layout)));
	let dragDisabled = $state(true);

	function layoutOptions(): { label: string; value: NavigationLayout }[] {
		return [
			{ label: ts.get.settings.navigation_order_desktop, value: 'desktop' },
			{ label: ts.get.settings.navigation_order_mobile, value: 'mobile' }
		];
	}

	function sortableItems(order: string[]): OrderItem[] {
		return order.filter((slug) => slug !== pinnedNavItem).map((slug) => ({ id: slug, item: navItems[slug] }));
	}

	function unorderedItems(): NavItem[] {
		const order = nav.orderFor(layout);
		return Object.values(navItems).filter((item) => item.slug !== pinnedNavItem && !order.includes(item.slug));
	}

	function isEnabled(item: NavItem): boolean {
		return item.featureFlag === null || nav.features[item.featureFlag];
	}

	function isFirstInMoreMenu(index: number): boolean {
		if (layout !== 'mobile' || !isEnabled(items[index].item)) return false;

		const enabledBefore = items.slice(0, index).filter((orderItem) => isEnabled(orderItem.item)).length;
		return enabledBefore + 1 === mobileVisibleCount;
	}

	function handleConsider(e: CustomEvent<DndEvent<OrderItem>>): void {
		items = e.detail.items;
	}

	async function handleFinalize(e: CustomEvent<DndEvent<OrderItem>>): Promise<void> {
		items = e.detail.items;
		dragDisabled = true;
		loadingIndicator.start();
		await nav.saveOrder(layout, [pinnedNavItem, ...items.map((orderItem) => orderItem.id)]);
		loadingIndicator.stop();
	}

	async function onToggle(): Promise<void> {
		loadingIndicator.start();
		await nav.save();
		loadingIndicator.stop();
	}

	async function resetOrder(): Promise<void> {
		loadingIndicator.start();
		await nav.resetOrder(layout);
		loadingIndicator.stop();
	}
</script>

{#snippet row(item: NavItem)}
	<span class="flex-1" class:opacity-50={!isEnabled(item)}>{ts.get.nav[item.translationKey]}</span>
	{#if item.featureFlag !== null}
		<Toggle bind:checked={nav.features[item.featureFlag]} onchange={onToggle} />
	{/if}
{/snippet}

<div class="flex w-full flex-col gap-2">
	<div class="flex items-center justify-between gap-2">
		<SegmentedControl bind:value={layout} options={layoutOptions()} />
		{#if nav.isOrderCustomised(layout)}
			<TextButton title={ts.get.settings.navigation_order_reset} type="slight" onclick={resetOrder} />
		{/if}
	</div>
	<p class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.settings.navigation_order_hint}</p>

	<div class="flex items-center gap-3">
		<IconLock size={16} class="shrink-0 text-c-neutral-3" />
		{@render row(navItems[pinnedNavItem])}
	</div>
	<div
		use:dndzone={{
			items,
			flipDurationMs,
			dragDisabled,
			dropTargetClasses: ['shadow-lg', 'ring-2', 'ring-d-lightblue']
		}}
		onconsider={handleConsider}
		onfinalize={handleFinalize}
		class="flex flex-col gap-2 rounded-lg !outline-0 transition-all"
	>
		{#each items as orderItem, index (orderItem.id)}
			<div animate:flip={{ duration: flipDurationMs }}>
				{#if isFirstInMoreMenu(index)}
					<p class="mb-2 border-t border-dashed border-c-neutral-3 pt-2 text-xs text-c-neutral-5 dark:text-c-neutral-4">
						{ts.get.settings.navigation_order_more_menu}
					</p>
				{/if}
				<div class="flex items-center gap-3">
					<IconGripVertical
						size={16}
						class="shrink-0 cursor-grab touch-none text-c-neutral-3"
						onpointerdown={() => (dragDisabled = false)}
						onpointerup={() => (dragDisabled = true)}
					/>
					{@render row(orderItem.item)}
				</div>
			</div>
		{/each}
	</div>
	{#each unorderedItems() as item (item.slug)}
		<div class="flex items-center gap-3 pl-7">
			{@render row(item)}
		</div>
	{/each}
</div>
