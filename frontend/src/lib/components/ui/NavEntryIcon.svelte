<script lang="ts">
	import IconHouse from '@lucide/svelte/icons/house';
	import IconCheckCheck from '@lucide/svelte/icons/check-check';
	import IconSettings from '@lucide/svelte/icons/settings';
	import IconGoal from '@lucide/svelte/icons/goal';
	import IconNotebook from '@lucide/svelte/icons/notebook';
	import IconBug from '@lucide/svelte/icons/bug';
	import IconLibraryBig from '@lucide/svelte/icons/library-big';
	import IconEuro from '@lucide/svelte/icons/euro';
	import IconTimer from '@lucide/svelte/icons/timer';
	import IconNewspaper from '@lucide/svelte/icons/newspaper';
	import IconCalendar from '@lucide/svelte/icons/calendar';
	import IconClipboardCopy from '@lucide/svelte/icons/clipboard-copy';
	import IconContactRound from '@lucide/svelte/icons/contact-round';

	let { type } = $props<{ type: string }>();
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
{:else if type === 'dev_requests'}
	<IconBug />
{/if}
