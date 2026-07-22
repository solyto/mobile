<script lang="ts">
	let {
		checked = $bindable(),
		label = null,
		onchange
	} = $props<{
		checked: boolean;
		label?: string;
		onchange: (value: boolean) => void;
	}>();
</script>

<label
	class="flex items-center text-sm font-medium text-c-neutral-7 rtl:text-right dark:text-c-neutral-2"
>
	<input
		type="checkbox"
		class="peer sr-only h-4 w-4 rounded-sm border-c-neutral-3 bg-c-neutral-1 focus:ring-2 dark:border-c-neutral-6 dark:bg-c-neutral-7 dark:ring-offset-gray-800"
		bind:checked
		onchange={(event: Event) => {
			onchange((event.currentTarget as HTMLInputElement).checked);
		}}
	/>
	<span
		class="peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 peer-checked:bg-primary-600 relative h-6 w-11 shrink-0 rounded-full after:absolute after:start-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-c-neutral-3 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:rtl:after:-translate-x-full dark:border-c-neutral0 dark:bg-c-neutral-6"
		class:mr-2={label}
		class:bg-c-neutral-2={!checked}
		class:bg-c-success={checked}
		class:dark:bg-c-success={checked}
	>
	</span>
	{label}
</label>
