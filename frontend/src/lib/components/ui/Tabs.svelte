<script lang="ts">
	interface Tab {
		id: number;
		title: string;
		component: any;
	}

	let { tabs } = $props<{
		tabs: Tab[];
		defaultTab?: string;
	}>();

	let selected = $state<number>(tabs[0].id);

	function select(id: number) {
		selected = id;
	}
</script>

<div class="w-full">
	<div class="flex w-full flex-wrap items-center gap-2 rounded-lg p-2 md:gap-4">
		{#each tabs as tab (tab.id)}
			<button
				class="cursor-pointer rounded-lg px-4 py-2 drop-shadow-sm transition-all"
				class:bg-c-bg-elevated={selected !== tab.id}
				class:bg-c-btn={selected === tab.id}
				class:text-white={selected === tab.id}
				onclick={() => select(tab.id)}
			>
				{tab.title}
			</button>
		{/each}
	</div>
	<div class="min-h-72 rounded-b-lg py-4">
		{@render tabs.find((tab: Tab) => tab.id === selected)?.component?.()}
	</div>
</div>
