<script lang="ts">
	let { title } = $props<{ title: string }>();
</script>

<div
	class="absolute top-[2px] right-[-15px] z-30 rotate-45 bg-c-primary text-xs text-white shadow-md"
	style="padding: 2px 6px;"
>
	{title}
</div>
