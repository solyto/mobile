<script lang="ts">
	let {
		value = $bindable(),
		min,
		max,
		step = 1,
		disabled = false,
		label,
		valueLabel,
		id,
		onchange,
		oninput
	} = $props<{
		value: number;
		min: number;
		max: number;
		step?: number;
		disabled?: boolean;
		label?: string;
		valueLabel?: string;
		id?: string;
		onchange?: (value: number) => void;
		oninput?: (value: number) => void;
	}>();

	let percent = $derived(max > min ? ((value - min) / (max - min)) * 100 : 0);

	function handleInput(event: Event) {
		value = Number((event.currentTarget as HTMLInputElement).value);
		oninput?.(value);
	}

	function handleChange(event: Event) {
		value = Number((event.currentTarget as HTMLInputElement).value);
		onchange?.(value);
	}
</script>

<div class="w-full">
	{#if label || valueLabel !== undefined}
		<div
			class="mb-1.5 flex items-center justify-between text-sm font-medium text-c-neutral-7 dark:text-c-neutral-2"
		>
			{#if label}
				<label for={id}>{label}</label>
			{/if}
			{#if valueLabel !== undefined}
				<span class="text-c-neutral-5 dark:text-c-neutral-4">{valueLabel}</span>
			{/if}
		</div>
	{/if}
	<input
		{id}
		type="range"
		{min}
		{max}
		{step}
		{disabled}
		bind:value
		oninput={handleInput}
		onchange={handleChange}
		style:--slider-percent="{percent}%"
		class="slider-range w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
	/>
</div>

<style>
	.slider-range {
		-webkit-appearance: none;
		appearance: none;
		background: transparent;
		height: 18px;
		--slider-track-bg: var(--color-c-neutral-2);
		--slider-fill-bg: var(--color-c-primary);
	}

	:global(html.dark) .slider-range {
		--slider-track-bg: var(--color-s-dark-3);
	}

	.slider-range:focus-visible {
		outline: none;
	}

	/* Track */
	.slider-range::-webkit-slider-runnable-track {
		height: 6px;
		border-radius: 9999px;
		background-image: linear-gradient(
			to right,
			var(--slider-fill-bg) var(--slider-percent),
			var(--slider-track-bg) var(--slider-percent)
		);
		transition: background-image 0.05s linear;
	}

	.slider-range::-moz-range-track {
		height: 6px;
		border-radius: 9999px;
		background: var(--slider-track-bg);
	}

	.slider-range::-moz-range-progress {
		height: 6px;
		border-radius: 9999px;
		background: var(--slider-fill-bg);
	}

	/* Thumb */
	.slider-range::-webkit-slider-thumb {
		-webkit-appearance: none;
		margin-top: -6px;
		width: 18px;
		height: 18px;
		border-radius: 9999px;
		background: var(--color-c-bg-elevated, white);
		border: 2px solid var(--slider-fill-bg);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
		cursor: pointer;
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.slider-range::-moz-range-thumb {
		width: 18px;
		height: 18px;
		border: 2px solid var(--slider-fill-bg);
		border-radius: 9999px;
		background: var(--color-c-bg-elevated, white);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
		cursor: pointer;
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.slider-range:hover::-webkit-slider-thumb,
	.slider-range:hover::-moz-range-thumb {
		transform: scale(1.15);
	}

	.slider-range:active::-webkit-slider-thumb,
	.slider-range:active::-moz-range-thumb {
		transform: scale(1.05);
	}

	.slider-range:focus-visible::-webkit-slider-thumb,
	.slider-range:focus-visible::-moz-range-thumb {
		box-shadow: 0 0 0 4px color-mix(in srgb, var(--slider-fill-bg) 30%, transparent);
	}

	.slider-range:disabled::-webkit-slider-thumb,
	.slider-range:disabled::-moz-range-thumb {
		cursor: not-allowed;
		transform: none;
	}
</style>
