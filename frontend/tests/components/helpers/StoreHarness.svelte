<script lang="ts" generics="T">
	import type { AnyComponent } from './context';

	let {
		component: ComponentToRender,
		props = {},
		provide,
		onReady = () => {}
	}: {
		component: AnyComponent;
		props?: Record<string, unknown>;
		provide: () => T;
		onReady?: (store: T) => void;
	} = $props();

	// svelte-ignore state_referenced_locally
	onReady(provide());
</script>

<ComponentToRender {...props} />
