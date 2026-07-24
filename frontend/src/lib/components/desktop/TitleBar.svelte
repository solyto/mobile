<script lang="ts">
	import { getTranslation } from "$lib/state/Translation.svelte";
	import IconRotateCw from '@lucide/svelte/icons/rotate-cw';

	const isElectron = typeof window !== 'undefined' && 'electronAPI' in window;
    const ts = getTranslation();

	function minimize() {
		(window as any).electronAPI?.minimize();
	}

	function maximize() {
		(window as any).electronAPI?.maximize();
	}

	function close() {
		(window as any).electronAPI?.close();
	}

    function reload() {
        (window as any).location.reload(true);
    }
</script>

{#if isElectron}
	<div class="flex h-6 w-full shrink-0 items-center justify-center bg-c-neutral absolute top-0" style="-webkit-app-region: drag">
        <div class="absolute left-0"></div>
        <div class="place-self-auto text-xs uppercase tracking-widest text-c-neutral-5">solyto</div>
		<div class="flex items-center absolute right-0" style="-webkit-app-region: no-drag">
            <button
				onclick={reload}
				class="flex h-6 w-10 items-center justify-center text-c-neutral-5 hover:bg-c-neutral-2 hover:text-c-neutral-8 dark:hover:bg-c-neutral-8 dark:hover:text-c-neutral-2"
                aria-label="Minimize"
			>
				<svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8.5 2.5v2h-2" />
                    <path d="M8.5 4.5A3.5 3.5 0 1 0 8 6.8" />
                </svg>
			</button>
			<button
				onclick={minimize}
				class="flex h-6 w-10 items-center justify-center text-c-neutral-5 hover:bg-c-neutral-2 hover:text-c-neutral-8 dark:hover:bg-c-neutral-8 dark:hover:text-c-neutral-2"
                aria-label="Minimize"
			>
				<svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
					<rect width="10" height="1" />
				</svg>
			</button>
			<button
				onclick={maximize}
				class="flex h-6 w-10 items-center justify-center text-c-neutral-5 hover:bg-c-neutral-2 hover:text-c-neutral-8 dark:hover:bg-c-neutral-8 dark:hover:text-c-neutral-2"
                aria-label="Maximize"
			>
				<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5">
					<rect x="1" y="1" width="8" height="8" />
				</svg>
			</button>
			<button
				onclick={close}
				class="flex h-6 w-10 items-center justify-center text-c-neutral-5 hover:bg-red-500 hover:text-white"
                aria-label="Close"
			>
				<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
					<path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			</button>
		</div>
	</div>
{/if}