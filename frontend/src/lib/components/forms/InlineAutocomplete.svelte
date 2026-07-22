<script lang="ts">
	interface TriggerItem {
		label: string;
		value?: string;
	}

	interface Trigger {
		prefix: string;
		items: TriggerItem[];
	}

	let {
		input = $bindable(),
		value = $bindable(),
		open = $bindable(false),
		placeholder,
		onblur,
		triggers
	} = $props<{
		input?: HTMLInputElement | null;
		value: string;
		open?: boolean;
		placeholder?: string;
		onblur?: () => void;
		triggers: Trigger[];
	}>();

	let suggestions = $state<TriggerItem[]>([]);
	let selectedIndex = $state<number>(0);
	let tokenStart = $state<number>(-1);
	let activeTriggerPrefix = $state<string>('');
	let dropdownRef = $state<HTMLUListElement | null>(null);

	function detectTrigger(): void {
		if (!input) return;

		const cursorPos = input.selectionStart ?? 0;
		const text = value.slice(0, cursorPos);

		let wordStart = cursorPos - 1;
		while (wordStart >= 0 && text[wordStart] !== ' ') {
			wordStart--;
		}
		wordStart++;

		const word = text.slice(wordStart, cursorPos);

		for (const trigger of triggers) {
			if (!word.startsWith(trigger.prefix)) continue;

			const partial = word.slice(trigger.prefix.length).toLowerCase();
			const matches = trigger.items.filter((item: TriggerItem) =>
				item.label.toLowerCase().startsWith(partial)
			);

			if (matches.length > 0) {
				suggestions = matches;
				selectedIndex = 0;
				tokenStart = wordStart;
				activeTriggerPrefix = trigger.prefix;
				open = true;
				return;
			}
		}

		dismiss();
	}

	function accept(item: TriggerItem): void {
		if (!input) return;

		const cursorPos = input.selectionStart ?? 0;
		const before = value.slice(0, tokenStart);
		const after = value.slice(cursorPos);
		const inserted = activeTriggerPrefix + (item.value ?? item.label);
		value = before + inserted + after;
		dismiss();

		const newCursor = before.length + inserted.length;
		requestAnimationFrame(() => {
			input?.setSelectionRange(newCursor, newCursor);
			input?.focus();
		});
	}

	function dismiss(): void {
		suggestions = [];
		selectedIndex = 0;
		open = false;
		tokenStart = -1;
		activeTriggerPrefix = '';
	}

	function scrollToSelected(): void {
		const item = dropdownRef?.children[selectedIndex] as HTMLElement | undefined;
		item?.scrollIntoView({ block: 'nearest' });
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
		detectTrigger();
	}

	function handleBlur(event: FocusEvent): void {
		const relatedTarget = event.relatedTarget as Node | null;
		if (dropdownRef && relatedTarget && dropdownRef.contains(relatedTarget)) return;

		dismiss();
		onblur?.();
	}

	function handleSuggestionMousedown(event: MouseEvent, item: TriggerItem): void {
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
						{i === selectedIndex ? 'bg-c-neutral-1 dark:bg-s-dark-3': 'hover:bg-c-neutral dark:hover:bg-s-dark-3'} dark:text-white"
						onmousedown={(e) => handleSuggestionMousedown(e, item)}
						tabindex={-1}
					>
						<span class="text-c-neutral-4 dark:text-c-neutral-5">{activeTriggerPrefix}</span>{item.label}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
