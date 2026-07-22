<script lang="ts">
	import { scale } from 'svelte/transition';
	import { humanReadableNumber } from '$lib/helpers/NumberHelper.js';

	let {
		label,
		number,
		loadDelay,
		icon,
		color = 'teal'
	} = $props<{
		label: string;
		number: number;
		loadDelay?: number;
		icon?: any;
		color?: 'teal' | 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
	}>();

	const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
		teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-400' },
		blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-400' },
		green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-400' },
		purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-400' },
		orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-400' },
		red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-400' },
		yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-400' }
	};

	const colors = colorClasses[color];
</script>

<div
	class="flex items-center gap-4 rounded-xl border border-c-neutral-1 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-s-dark-3 dark:bg-s-dark-2"
	in:scale={{ delay: loadDelay ?? 0, duration: 200 }}
>
	<div class="rounded-lg p-3 {colors.bg} dark:bg-opacity-20">
		<span class={colors.text}>{@render icon?.({ class: 'w-6 h-6' })}</span>
	</div>
	<div class="flex flex-col">
		<span class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{label}</span>
		<span class="text-2xl font-semibold text-c-neutral-9 dark:text-white"
			>{humanReadableNumber(number)}</span
		>
	</div>
</div>
