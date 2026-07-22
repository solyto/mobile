<script lang="ts">
	import type { CheckInType } from '$lib/types/check_in';

	let { type, value } = $props<{
		type: CheckInType | 'total';
		value: number;
	}>();
</script>

{#if type !== 'food_amount'}
	<div class="relative flex items-center gap-2 px-2 py-1">
		{#if isNaN(value)}
			-
		{:else}
			<div
				class="size-4 rounded-full"
				class:bg-c-success={value >= 4}
				class:bg-c-btn={value >= 3 && value < 4}
				class:bg-c-warning={value >= 2 && value < 3}
				class:bg-c-action={value >= 1.5 && value < 2}
				class:bg-c-danger={value <= 1.5}
			></div>
			{value.toFixed(2)}
		{/if}
	</div>
{:else}
	<div class="relative flex items-center gap-2 px-2 py-1">
		{#if isNaN(value)}
			-
		{:else}
			<div
				class="size-4 rounded-full"
				class:bg-c-success={value >= 3.5 && value < 4.5}
				class:bg-c-btn={value >= 3 && value < 3.5}
				class:bg-c-warning={value >= 2 && value < 3}
				class:bg-c-action={value >= 1.5 && value < 2}
				class:bg-c-danger={value <= 1.5 || value >= 4.5}
			></div>
			{value.toFixed(2)}
		{/if}
	</div>
{/if}
