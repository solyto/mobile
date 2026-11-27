<script lang="ts">
	import IconHouse from '$lib/icons/lucide/house.svelte';
	import IconCheckCheck from '$lib/icons/lucide/check-check.svelte';
	import IconSettings from '$lib/icons/lucide/settings.svelte';
	import IconGoal from '$lib/icons/lucide/goal.svelte';
	import IconNotebook from '$lib/icons/lucide/notebook.svelte';
	import IconBug from '$lib/icons/lucide/bug.svelte';
	import IconLibraryBig from '$lib/icons/lucide/library-big.svelte';
	import IconEuro from '$lib/icons/lucide/euro.svelte';
	import IconTimer from '$lib/icons/lucide/timer.svelte';
	import IconNewspaper from '$lib/icons/lucide/newspaper.svelte';
	import IconCalendar from '$lib/icons/lucide/calendar.svelte';
	import IconClipboardCopy from '$lib/icons/lucide/clipboard-copy.svelte';
	import IconContactRound from '$lib/icons/lucide/contact-round.svelte';
	import IconBell from '$lib/icons/lucide/bell.svelte';

	let { type }: { type: string } = $props();
</script>

{#if type === 'home'}
	<IconHouse />
{:else if type === 'calendar'}
	<IconCalendar />
{:else if type === 'todos'}
	<IconCheckCheck />
{:else if type === 'notes'}
	<IconNotebook />
{:else if type === 'libraries'}
	<IconLibraryBig />
{:else if type === 'contacts'}
	<IconContactRound />
{:else if type === 'checkIn'}
	<IconGoal />
{:else if type === 'finances'}
	<IconEuro />
{:else if type === 'feeds'}
	<IconNewspaper />
{:else if type === 'clipboard'}
	<IconClipboardCopy />
{:else if type === 'timer'}
	<IconTimer />
{:else if type === 'settings'}
	<IconSettings />
{:else if type === 'notifications'}
	<IconBell />
{:else if type === 'dev_requests'}
	<IconBug />
{/if}
