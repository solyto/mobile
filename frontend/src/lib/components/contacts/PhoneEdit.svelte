<script lang="ts">
	import IconCardSim from '@lucide/svelte/icons/card-sim';
	import IconHouse from '@lucide/svelte/icons/house';
	import IconPhone from '@lucide/svelte/icons/phone';
	import IconBriefcaseBusiness from '@lucide/svelte/icons/briefcase-business';

	let { value = $bindable(), type = $bindable() } = $props<{
		value: string;
		type: string;
	}>();

	let menuOpen = $state<boolean>(false);
</script>

<div class="relative flex items-center">
	<input
		bind:value
		type="text"
		class="w-full rounded-l-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-2 dark:bg-s-dark-3 dark:text-white dark:focus:ring-c-primary"
		placeholder="Phone number"
	/>
	<button
		type="button"
		class="flex h-full cursor-pointer items-center rounded-r-lg border-1 border-l-0 border-c-neutral-2 p-2 shadow-xs hover:bg-c-neutral dark:border-s-dark-2 dark:hover:bg-s-dark-2"
		onclick={() => (menuOpen = !menuOpen)}
	>
		{#if type === 'cell'}
			<IconCardSim class="size-4 text-c-btn" />
		{:else if type === 'home'}
			<IconHouse class="size-4 text-c-btn" />
		{:else if type === 'work'}
			<IconBriefcaseBusiness class="size-4 text-c-btn" />
		{:else}
			<IconPhone class="size-4 text-c-btn" />
		{/if}
	</button>
	{#if menuOpen}
		<div
			class="absolute top-0 right-[-10px] z-60 flex flex-col rounded-lg bg-white p-2 shadow-lg dark:bg-s-dark-3"
		>
			<button
				class="cursor-pointer rounded-lg p-2 hover:bg-c-neutral dark:hover:bg-s-dark-2"
				onclick={() => {
					type = 'cell';
					menuOpen = false;
				}}
			>
				<IconCardSim class="size-4 text-c-btn" />
			</button>
			<button
				class="cursor-pointer rounded-lg p-2 hover:bg-c-neutral dark:hover:bg-s-dark-2"
				onclick={() => {
					type = 'home';
					menuOpen = false;
				}}
			>
				<IconHouse class="size-4 text-c-btn" />
			</button>
			<button
				class="cursor-pointer rounded-lg p-2 hover:bg-c-neutral dark:hover:bg-s-dark-2"
				onclick={() => {
					type = 'work';
					menuOpen = false;
				}}
			>
				<IconBriefcaseBusiness class="size-4 text-c-btn" />
			</button>
			<button
				class="cursor-pointer rounded-lg p-2 hover:bg-c-neutral dark:hover:bg-s-dark-2"
				onclick={() => {
					type = 'other';
					menuOpen = false;
				}}
			>
				<IconPhone class="size-4 text-c-btn" />
			</button>
		</div>
	{/if}
</div>
