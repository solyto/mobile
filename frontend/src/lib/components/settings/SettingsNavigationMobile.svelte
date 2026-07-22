<script lang="ts">
	import { fade } from 'svelte/transition';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import HamburgerButton from '$lib/components/ui/buttons/HamburgerButton.svelte';

	let {
		sections,
		selected,
		onselect
	} = $props<{
		sections: { id: number; title: string }[];
		selected: number;
		onselect: (id: number) => void;
	}>();

	let open = $state(false);

	function select(id: number): void {
		onselect(id);
		open = false;
	}
</script>

<HamburgerButton onclick={() => (open = true)} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex flex-col bg-c-bg lg:hidden dark:bg-s-dark-1"
		transition:fade={{ duration: 150 }}
	>
		<div
			class="flex shrink-0 items-center justify-between border-b border-c-neutral-2 p-4 dark:border-s-dark-3"
		>
			<span class="text-2xl font-bold">Settings</span>
			<CloseButton onClick={() => { open = false; }} inModal={false} />
		</div>
		<div class="flex-1 overflow-y-auto">
			{#each sections as section (section.id)}
				<button
					class="flex w-full cursor-pointer items-center border-b border-c-neutral-1 px-4 py-4 text-left hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3
						{selected === section.id ? 'bg-c-neutral-1 dark:bg-s-dark-3' : ''}"
					onclick={() => select(section.id)}
				>
					<span class="text-base">{section.title}</span>
				</button>
			{/each}
		</div>
	</div>
{/if}
