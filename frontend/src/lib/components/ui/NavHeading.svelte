<script lang="ts">
	let { title, class: customClass = '' }: { title: string; class?: string } = $props();
</script>

<div class="text-base font-bold 2xl:text-2xl 2xl:font-normal {customClass}">
	{title}
</div>
