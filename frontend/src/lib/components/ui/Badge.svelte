<script lang="ts">
	let {
		i,
		color,
		top,
		right,
		light = false
	} = $props<{
		i: number;
		color: string;
		top?: string;
		right?: string;
		light?: boolean;
	}>();
</script>

<div
	class="absolute z-20 flex size-7 items-center justify-center rounded-full shadow-sm"
	class:text-white={!light}
	class:text-c-neutral-5={light}
	class:text-sm={i < 100}
	class:text-xs={i >= 100}
	style="top: {top ?? '-10px'}; right: {right ?? '-10px'}; background-color: {color};"
>
	{i}
</div>
