<script lang="ts">
	import IconPizza from '@lucide/svelte/icons/pizza';

	let { fill } = $props<{ fill: 0 | 25 | 50 | 75 | 100 }>();
</script>

<div
	class="relative flex size-16 scale-80 items-end rounded-full text-yellow-500 max-sm:scale-70"
>
	{#if fill === 0}
		<IconPizza class="absolute top-[-1px] left-[-1px] size-8" />
	{:else if fill === 25}
		<IconPizza class="absolute top-[0px] left-[1px] size-8" />
		<IconPizza class="absolute top-[-5px] left-[20px] size-8 rotate-[60deg]" />
		<IconPizza class="absolute top-[8px] right-[-2px] size-8 rotate-[120deg]" />
	{:else if fill === 50}
		<IconPizza class="absolute top-[0px] left-[1px] size-8" />
		<IconPizza class="absolute top-[-5px] left-[20px] size-8 rotate-[60deg]" />
		<IconPizza class="absolute top-[8px] right-[-2px] size-8 rotate-[120deg]" />
		<IconPizza class="absolute right-[3px] bottom-[5px] size-8 rotate-[180deg]" />
	{:else if fill === 75}
		<IconPizza class="absolute top-[0px] left-[1px] size-8" />
		<IconPizza class="absolute top-[-5px] left-[20px] size-8 rotate-[60deg]" />
		<IconPizza class="absolute top-[8px] right-[-2px] size-8 rotate-[120deg]" />
		<IconPizza class="absolute right-[3px] bottom-[5px] size-8 rotate-[180deg]" />
		<IconPizza class="absolute bottom-[0px] left-[10px] size-8 rotate-[240deg]" />
		<IconPizza class="absolute bottom-[13px] left-[-4px] size-8 rotate-[300deg]" />
	{:else if fill === 100}
		<div class="absolute top-[-11px] left-[-10px] h-full w-full scale-50 rounded-full bg-white">
			<IconPizza class="absolute top-[0px] left-[1px] size-8" />
			<IconPizza class="absolute top-[-5px] left-[20px] size-8 rotate-[60deg]" />
			<IconPizza class="absolute top-[8px] right-[-2px] size-8 rotate-[120deg]" />
			<IconPizza class="absolute right-[3px] bottom-[5px] size-8 rotate-[180deg]" />
			<IconPizza class="absolute bottom-[0px] left-[10px] size-8 rotate-[240deg]" />
			<IconPizza class="absolute bottom-[13px] left-[-4px] size-8 rotate-[300deg]" />
		</div>
		<div class="absolute top-[12px] left-[-8px] h-full w-full scale-50 rounded-full bg-white">
			<IconPizza class="absolute top-[0px] left-[1px] size-8" />
			<IconPizza class="absolute top-[-5px] left-[20px] size-8 rotate-[60deg]" />
			<IconPizza class="absolute top-[8px] right-[-2px] size-8 rotate-[120deg]" />
			<IconPizza class="absolute right-[3px] bottom-[5px] size-8 rotate-[180deg]" />
			<IconPizza class="absolute bottom-[0px] left-[10px] size-8 rotate-[240deg]" />
			<IconPizza class="absolute bottom-[13px] left-[-4px] size-8 rotate-[300deg]" />
		</div>
		<div class="absolute top-[3px] right-[-14px] h-full w-full scale-50 rounded-full bg-white">
			<IconPizza class="absolute top-[0px] left-[1px] size-8" />
			<IconPizza class="absolute top-[-5px] left-[20px] size-8 rotate-[60deg]" />
			<IconPizza class="absolute top-[8px] right-[-2px] size-8 rotate-[120deg]" />
			<IconPizza class="absolute right-[3px] bottom-[5px] size-8 rotate-[180deg]" />
			<IconPizza class="absolute bottom-[0px] left-[10px] size-8 rotate-[240deg]" />
			<IconPizza class="absolute bottom-[13px] left-[-4px] size-8 rotate-[300deg]" />
		</div>
	{/if}
</div>
