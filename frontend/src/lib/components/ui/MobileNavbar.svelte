<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { backOut, cubicIn } from 'svelte/easing';
	import { onMount, onDestroy } from 'svelte';
	import IconEllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import NavEntry from '$lib/components/ui/NavEntry.svelte';
	import NavProfileEntry from '$lib/components/ui/NavProfileEntry.svelte';
	import NavLegalEntry from '$lib/components/ui/NavLegalEntry.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { urls, hasLegalUrls } from '$lib/config/urls';
	import { navItems } from '$lib/config/navigation';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import NavEntryIcon from '$lib/components/ui/NavEntryIcon.svelte';
	import { getPageSlug } from '$lib/helpers/NavHelper';
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import { getNavigation } from '$lib/state/Navigation.svelte';
	import { getUserNotifications } from '$lib/state/UserNotifications.svelte';

	const ts = getTranslation();
	const nav = getNavigation();
	const userNotifications = getUserNotifications();

	let submenuVisible = $state<boolean>(false);
	let unreadNotificationCount = $derived(userNotifications.getUnread().length);

	onMount(() => {
		userNotifications.load();
	});

	onDestroy(() => {
		userNotifications.destroy();
	});

	function select(): void {
		submenuVisible = false;
	}

	function itemIn(index: number): { y: number; duration: number; delay: number } {
		const count = nav.mobileOverflowItems().length + (hasLegalUrls ? 4 : 3);
		return { y: 20, duration: 200, delay: (count - 1 - index) * 26 };
	}

	let active = $derived(getPageSlug());
	const overflowOnlyItems: Record<string, { iconType: string }> = {
		settings: { iconType: 'settings' },
		profile: { iconType: 'profile' },
		notifications: { iconType: 'notifications' }
	};
	let activeInOverflow = $derived(
		nav.mobileOverflowItems().some((item) => item.slug === active) || active in overflowOnlyItems
	);
	let activeOverflowItem = $derived(activeInOverflow ? (navItems[active] ?? overflowOnlyItems[active] ?? null) : null);
</script>

<div class="nav-mobile-container h-full p-1 bg-c-bg flat-nav:p-0">
	<div
		class="nav-mobile gradient-right flex h-full w-full flex-row items-center justify-center rounded-md p-1 flat-nav:rounded-none text-c-neutral-8 drop-shadow-xl dark:text-c-neutral-2"
	>
		{#each nav.mobileBarItems() as item (item.slug)}
			<NavEntry slug={item.slug} href={item.href} title={ts.get.nav[item.translationKey]} active={active === item.slug} mobile={true} dataTour={item.dataTour} onSelect={select}>
				<NavEntryIcon type={item.iconType} />
			</NavEntry>
		{/each}
		<div
			class="relative flex h-full items-center justify-center rounded-sm"
			class:bg-c-btn={submenuVisible}
			class:text-white={submenuVisible}
			class:bg-c-nav-active={activeInOverflow && !submenuVisible}
			class:text-c-nav-active-text={activeInOverflow && !submenuVisible}
			use:clickOutside={select}
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
							class="nav-overflow-active absolute right-[-22px] top-[-20px] [&>svg]:size-5 rounded-full p-1 bg-c-nav-active shadow-xl shadow-c-neutral-5 border-c-neutral text-c-neutral"
							transition:scale
						>
							<NavEntryIcon type={activeOverflowItem.iconType} />
						</div>
					{/if}
					{#if unreadNotificationCount > 0}
						<div class="absolute right-[-3px] top-[-3px] size-2 rounded-full bg-c-btn-hover shadow-sm"></div>
					{/if}
				</div>
			</button>
			{#if submenuVisible}
				<div
					class="gradient-down absolute z-50 flex origin-bottom w-16 max-h-[calc(100dvh-8rem)] flex-col gap-2 overflow-y-auto rounded-lg p-1 text-c-neutral-8 shadow-lg dark:text-c-neutral-2"
					style="bottom:80px; right:15px;"
					in:scale={{ start: 0.6, duration: 260, easing: backOut }}
					out:scale={{ start: 0.8, duration: 150, easing: cubicIn }}
				>
					{#each nav.mobileOverflowItems() as item, index (item.slug)}
						<div in:fly|global={itemIn(index)}>
							<NavEntry slug={item.slug} href={item.href} title={ts.get.nav[item.translationKey]} active={active === item.slug} mobile={true} onSelect={select}>
								<NavEntryIcon type={item.iconType} />
							</NavEntry>
						</div>
					{/each}
					<div in:fly|global={itemIn(nav.mobileOverflowItems().length)}>
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
					</div>
					<div class="relative" in:fly|global={itemIn(nav.mobileOverflowItems().length + 1)}>
						<NavEntry
							slug="notifications"
							href={urls.notifications}
							title={ts.get.nav.notifications}
							active={active === 'notifications'}
							mobile={true}
							onSelect={select}
						>
							<NavEntryIcon type="notifications" />
						</NavEntry>
						{#if unreadNotificationCount > 0}
							<Badge
								i={unreadNotificationCount}
								color="var(--color-c-btn-hover)"
								top="-2px"
								right="-2px"
							/>
						{/if}
					</div>
					<div in:fly|global={itemIn(nav.mobileOverflowItems().length + 2)}>
						<NavProfileEntry active={active === 'profile'} mobile={true} onSelect={select} />
					</div>
					{#if hasLegalUrls}
						<div in:fly|global={itemIn(nav.mobileOverflowItems().length + 3)}>
							<NavLegalEntry mobile={true} />
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
