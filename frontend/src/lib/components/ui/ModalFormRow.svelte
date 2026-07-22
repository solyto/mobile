<script lang="ts">
	let { label, children } = $props<{
		label: string;
		children: any;
	}>();
</script>

<div class="flex w-full flex-row items-start gap-2">
	<span class="w-1/3 text-sm font-bold pt-[9px]">{label}</span>
	<div class="w-2/3 self-center">
		{@render children?.()}
	</div>
</div>
