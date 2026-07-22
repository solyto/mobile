<script lang="ts">
	interface Item {
		label: string;
	}

	let {
		input = $bindable(),
		value = $bindable(),
		open = $bindable(false),
		placeholder,
		onblur,
		onselect,
		items
	} = $props<{
		input?: HTMLInputElement | null;
		value: string;
		open?: boolean;
		placeholder?: string;
		onblur?: () => void;
		onselect?: (label: string) => void;
		items: Item[];
	}>();

	let suggestions = $state<Item[]>([]);
	let selectedIndex = $state<number>(0);
	let dropdownRef = $state<HTMLUListElement | null>(null);

	function filterSuggestions(): void {
		const query = value.trim().toLowerCase();
		if (query === '') {
			dismiss();
			return;
		}

		const matches = items.filter((item: Item) => item.label.toLowerCase().includes(query));
		if (matches.length > 0) {
			suggestions = matches;
			selectedIndex = 0;
			open = true;
		} else {
			dismiss();
		}
	}

	function accept(item: Item): void {
		value = item.label;
		dismiss();
		requestAnimationFrame(() => input?.focus());
		onselect?.(item.label);
	}

	function dismiss(): void {
		suggestions = [];
		selectedIndex = 0;
		open = false;
	}

	function scrollToSelected(): void {
		const el = dropdownRef?.children[selectedIndex] as HTMLElement | undefined;
		el?.scrollIntoView({ block: 'nearest' });
	}

	function onkeydown(event: KeyboardEvent): void {
		if (!open) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			event.stopPropagation();
			selectedIndex = (selectedIndex + 1) % suggestions.length;
			requestAnimationFrame(scrollToSelected);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			event.stopPropagation();
			selectedIndex = (selectedIndex - 1 + suggestions.length) % suggestions.length;
			requestAnimationFrame(scrollToSelected);
		} else if (event.key === 'Tab' || event.key === 'Enter') {
			event.preventDefault();
			event.stopPropagation();
			accept(suggestions[selectedIndex]);
		} else if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			dismiss();
		}
	}

	function oninput(): void {
		filterSuggestions();
	}

	function handleBlur(event: FocusEvent): void {
		const relatedTarget = event.relatedTarget as Node | null;
		if (dropdownRef && relatedTarget && dropdownRef.contains(relatedTarget)) return;

		dismiss();
		onblur?.();
	}

	function handleSuggestionMousedown(event: MouseEvent, item: Item): void {
		event.preventDefault();
		accept(item);
	}
</script>

<div class="relative w-full">
	<input
		bind:this={input}
		bind:value
		onblur={handleBlur}
		{oninput}
		{onkeydown}
		type="text"
		class="w-full rounded-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-3 dark:bg-inherit dark:text-white dark:focus:ring-c-primary"
		{placeholder}
	/>

	{#if open && suggestions.length > 0}
		<ul
			bind:this={dropdownRef}
			class="absolute top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-c-neutral-2 bg-c-bg-surface text-sm shadow-sm dark:border-s-dark-3"
		>
			{#each suggestions as item, i (i)}
				<li>
					<button
						type="button"
						class="w-full cursor-pointer px-3 py-2 text-left transition-colors first:rounded-t-lg last:rounded-b-lg
						{i === selectedIndex ? 'bg-c-neutral-1 dark:bg-s-dark-3' : 'hover:bg-c-neutral dark:hover:bg-s-dark-3'} dark:text-white"
						onmousedown={(e) => handleSuggestionMousedown(e, item)}
						tabindex={-1}
					>
						{item.label}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
