<script lang="ts">
	import NavEntry from '$lib/components/ui/NavEntry.svelte';
	import logo from '$lib/assets/logo_cut.png';
	import IconHouse from '$lib/icons/lucide/house.svelte';
	import IconArrowBigLeft from '$lib/icons/lucide/arrow-big-left.svelte';
	import IconUsers from '$lib/icons/lucide/users.svelte';
	import { slide } from 'svelte/transition';

	import { page } from '$app/state';
	import { urls } from '$lib/config/urls';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();

	let active = $derived(page.url.pathname);
</script>

<div class="nav-desktop-container h-full bg-c-bg p-1" out:slide>
	<div
		class="nav-desktop gradient-down flex h-full w-16 flex-col rounded-md p-1 text-c-neutral-8 drop-shadow-xl dark:text-c-neutral-2"
	>
		<div class="mb-auto flex flex-col items-center">
			<img src={logo} class="logo" alt="solyto" />
		</div>

		<div class="flex flex-1 flex-col items-center justify-center">
			<NavEntry slug="admin.home" href={urls.admin.home} title={ts.get.admin.dashboard} active={active === urls.admin.home}>
				<IconHouse />
			</NavEntry>
			<NavEntry slug="admin.users" href={urls.admin.users} title={ts.get.admin.users} active={active === urls.admin.users}>
				<IconUsers />
			</NavEntry>
		</div>

		<div class="mt-auto flex flex-col items-center">
			<NavEntry slug="home" href={urls.home} title={ts.get.admin.back_to_app} active={false}>
				<IconArrowBigLeft />
			</NavEntry>
		</div>
	</div>
</div>
