<script lang="ts">
	import NavEntry from '$lib/components/ui/NavEntry.svelte';
	import NavProfileEntry from '$lib/components/ui/NavProfileEntry.svelte';
	import NavLegalEntry from '$lib/components/ui/NavLegalEntry.svelte';
	import logo from '$lib/assets/logo_cut.png';

	import { urls } from '$lib/config/urls';
	import { slide } from 'svelte/transition';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import UserNotifications from '$lib/components/ui/user-notifications/UserNotifications.svelte';
	import NavEntryIcon from '$lib/components/ui/NavEntryIcon.svelte';
	import { getPageSlug } from '$lib/helpers/NavHelper';
	import { getNavigation } from '$lib/state/Navigation.svelte';

	const ts = getTranslation();
	const nav = getNavigation();

	let active = $derived(getPageSlug());
</script>

<div class="nav-desktop-container h-full bg-c-bg p-1 flat-nav:p-0 bottom-nav:h-auto" transition:slide={{ axis: 'x' }}>
	<div
		class="nav-desktop gradient-down flex h-full w-16 flex-col rounded-md p-1 flat-nav:rounded-none bottom-nav:h-16 bottom-nav:w-full bottom-nav:flex-row text-c-neutral-8 drop-shadow-xl dark:text-c-neutral-2"
	>
		<div class="relative mb-auto flex flex-col items-center bottom-nav:mb-0 bottom-nav:h-full">
			<img src={logo} class="logo bottom-nav:h-full bottom-nav:w-auto" alt="logo" />
		</div>

		<div class="flex flex-1 flex-col items-center justify-center bottom-nav:flex-row bottom-nav:[&>*]:w-14">
			{#each nav.enabledItems(nav.desktopOrder) as item (item.slug)}
				<div data-tour={item.dataTour} class="w-full">
					<NavEntry slug={item.slug} href={item.href} title={ts.get.nav[item.translationKey]} active={active === item.slug}>
						<NavEntryIcon type={item.iconType} />
					</NavEntry>
				</div>
			{/each}
		</div>

		<div class="mt-auto flex flex-col items-center bottom-nav:mt-0 bottom-nav:flex-row bottom-nav:[&>*]:w-14">
			<div data-tour="profile" class="w-full">
				<NavProfileEntry active={active === 'profile'} />
			</div>
			<UserNotifications />
			<div data-tour="settings" class="w-full">
				<NavEntry
					slug="settings"
					href={urls.settings}
					title={ts.get.nav.settings}
					active={active === 'settings'}
				>
					<NavEntryIcon type="settings" />
				</NavEntry>
			</div>
			{#if nav.features.dev_requests}
				<div data-tour="dev_requests" class="w-full">
					<NavEntry
						slug="dev-requests"
						href={urls.devRequests}
						title={ts.get.nav.dev_requests}
						active={active === 'dev-requests'}
					>
						<NavEntryIcon type="dev_requests" />
					</NavEntry>
				</div>
			{/if}
			<NavLegalEntry />
		</div>
	</div>
</div>
