<script lang="ts">
	import { scale } from 'svelte/transition';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { onDestroy } from 'svelte';

	const keyManager = getKeyManager();

	let {
		hours = $bindable(),
		minutes = $bindable(),
		oninput
	}: {
		hours: number;
		minutes: number;
		oninput?: () => void;
	} = $props();

	const hourOptions = Array.from({ length: 24 }, (_, i) => i + 1).map((i) =>
		(i - 1).toString().padStart(2, '0')
	);
	const minuteOptions = Array.from({ length: 12 }, (_, i) => i).map((i) =>
		(i * 5).toString().padStart(2, '0')
	);

	let menu = $state<boolean>(false);
	let keyHandlers = $state<{ [key: string]: string | null }>({ Enter: null });

	function onOpen(): void {
		menu = true;
		keyHandlers.Enter = keyManager.registerKeyDown('Enter', onFinish, { priority: 3 });
	}

	function onFinish(): void {
		menu = false;
		keyManager.unregisterAll(keyHandlers);
		if (oninput) oninput();
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));
</script>

<div
	class="relative flex w-full items-center justify-center gap-1 rounded-lg text-sm transition-all"
>
	<input
		type="number"
		class="w-full rounded-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-3 dark:bg-inherit dark:text-white dark:focus:ring-c-primary"
		bind:value={hours}
		onclick={onOpen}
	/>
	<span>:</span>
	<input
		type="number"
		class="w-full rounded-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-3 dark:bg-inherit dark:text-white dark:focus:ring-c-primary"
		bind:value={minutes}
		onclick={onOpen}
	/>
	{#if menu}
		<div
			class="absolute top-10 right-0 z-40 w-60 flex items-start gap-8 overflow-y-auto rounded-lg bg-white p-4 text-md shadow-lg dark:bg-s-dark-3"
			transition:scale
		>
			<div class="grid w-1/2 grid-cols-3 flex-wrap gap-4">
				{#each hourOptions as option (option)}
					<button
						class="cursor-pointer transition-all hover:scale-105 hover:font-bold"
						class:font-bold={hours === parseInt(option)}
						class:scale-125={hours === parseInt(option)}
						onclick={() => (hours = parseInt(option))}
					>
						{option}
					</button>
				{/each}
			</div>
			<div class="grid w-1/2 grid-cols-3 flex-wrap gap-4">
				{#each minuteOptions as option (option)}
					<button
						class="cursor-pointer transition-all hover:scale-105 hover:font-bold"
						class:font-bold={minutes === parseInt(option)}
						class:scale-125={minutes === parseInt(option)}
						onclick={() => (minutes = parseInt(option))}
					>
						{option}
					</button>
				{/each}
				<div class="absolute right-4 bottom-4 cursor-pointer">
					<TextButton
						title="Set"
						onclick={onFinish}
					/>
				</div>
			</div>
		</div>
	{/if}
</div>
