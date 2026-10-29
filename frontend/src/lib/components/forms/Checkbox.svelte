<script lang="ts">
	let {
		isChecked = $bindable(false),
		onchange,
		class: customClass = ''
	}: {
		isChecked?: boolean;
		onchange?: (event: Event) => void;
		class?: string;
	} = $props();
</script>

<div class="inline-flex items-center {customClass}">
	<label class="relative flex cursor-pointer items-center">
		<input
			type="checkbox"
			class="checkbox-box peer h-5 w-5 cursor-pointer appearance-none rounded border border-c-neutral-3 bg-c-bg-elevated shadow transition-all checked:border-c-success checked:bg-c-success hover:shadow-md dark:border-c-neutral-6 dark:checked:border-c-success"
			checked={isChecked}
			{onchange}
		/>
		<span
			class="checkbox-mark pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-white opacity-0 peer-checked:opacity-100"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-3.5 w-3.5"
				viewBox="0 0 20 20"
				fill="currentColor"
				stroke="currentColor"
				stroke-width="1"
			>
				<path
					fill-rule="evenodd"
					d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
					clip-rule="evenodd"
				></path>
			</svg>
		</span>
	</label>
</div>
