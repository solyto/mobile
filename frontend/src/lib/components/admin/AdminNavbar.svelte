<script lang="ts">
	import NavEntry from '$lib/components/ui/NavEntry.svelte';
	import logo from '$lib/assets/logo_cut.png';
	import IconHouse from '@lucide/svelte/icons/house';
	import IconArrowBigLeft from '@lucide/svelte/icons/arrow-big-left';
	import IconUsers from '@lucide/svelte/icons/users';
	import { slide } from 'svelte/transition';

	import { page } from '$app/state';
	import { urls } from '$lib/config/urls';

	let active = $derived(page.url.pathname);

	function select(slug: string): void {}
</script>

<div class="h-full bg-white p-1 dark:bg-s-dark" out:slide>
	<div
		class="flex h-full w-16 flex-col rounded-md p-1 text-c-neutral-8 drop-shadow-xl not-dark:bg-gradient-to-b not-dark:from-c-btn not-dark:to-c-success dark:bg-s-dark-3 dark:text-c-neutral-2"
	>
		<div class="mb-auto flex flex-col items-center">
			<img src={logo} alt="logo" />
		</div>

		<div class="flex flex-1 flex-col items-center justify-center">
			<NavEntry
				slug="admin.home"
				href={urls.admin.home}
				title="Dashboard"
				active={active === urls.admin.home}
				onSelect={select}><IconHouse /></NavEntry
			>
			<NavEntry
				slug="admin.users"
				href={urls.admin.users}
				title="Users"
				active={active === urls.admin.users}
				onSelect={select}><IconUsers /></NavEntry
			>
		</div>

		<div class="mt-auto flex flex-col items-center">
			<NavEntry
				slug="home"
				href={urls.home}
				title="Back to App"
				active={false}
				onSelect={select}><IconArrowBigLeft /></NavEntry
			>
		</div>
	</div>
</div>
