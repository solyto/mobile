<script lang="ts">
	import { scale } from 'svelte/transition';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';
	import { onDestroy } from 'svelte';
	import { getHoursOfDay } from '$lib/helpers/DateHelper';
	import { clickOutside } from '$lib/helpers/ClickHelper';

	const keyManager = getKeyManager();
	const ts = getTranslation();
	const viewPoint = getViewPoint();

	let {
		hours = $bindable(),
		minutes = $bindable(),
		oninput
	}: {
		hours: number;
		minutes: number;
		oninput?: () => void;
	} = $props();

	const hourOptions = getHoursOfDay();
	const minuteOptions = Array.from({ length: 12 }, (_, i) => i).map((i) =>
		(i * 5).toString().padStart(2, '0')
	);

	let menu = $state<boolean>(false);
	let keyHandlers: { [key: string]: string | null } = { Enter: null };

	function onOpen(): void {
		if (menu) return;
		menu = true;
		keyHandlers.Enter = keyManager.registerKeyDown('Enter', onFinish, { priority: 3 });
	}

	function onFinish(): void {
		menu = false;
		keyManager.unregisterAll(keyHandlers);
		if (oninput) oninput();
	}

	function onClickOutside(): void {
		if (menu) onFinish();
	}

	function onNativeChange(value: string): void {
		if (!value) return;
		const [h, m] = value.split(':').map(Number);
		hours = h;
		minutes = m;
		if (oninput) oninput();
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));
</script>

{#if viewPoint.isMobile || viewPoint.isTablet}
	<input
		type="time"
		value={`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`}
		onchange={(e) => onNativeChange(e.currentTarget.value)}
		class="w-full rounded-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-2 dark:focus:ring-c-primary"
	/>
{:else}
	<div
		class="relative flex w-full items-center justify-center gap-1 rounded-lg text-sm transition-all"
		use:clickOutside={onClickOutside}
	>
		<input
			type="number"
			inputmode="none"
			class="w-full rounded-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-3 dark:bg-inherit dark:text-white dark:focus:ring-c-primary"
			bind:value={hours}
			onclick={onOpen}
		/>
		<span>:</span>
		<input
			type="number"
			inputmode="none"
			class="w-full rounded-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-3 dark:bg-inherit dark:text-white dark:focus:ring-c-primary"
			bind:value={minutes}
			onclick={onOpen}
		/>
		{#if menu}
			<div
				class="absolute top-10 right-0 z-40 w-60 flex items-start gap-8 overflow-y-auto rounded-lg bg-c-bg-modal p-4 text-md shadow-lg"
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
							title={ts.get.layout.apply}
							onclick={onFinish}
						/>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
