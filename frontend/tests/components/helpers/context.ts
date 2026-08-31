import { render } from '@testing-library/svelte';
import type { Component } from 'svelte';
import ContextHarness from './ContextHarness.svelte';

/**
 * A Svelte 5 component type that accepts any component. `any` is required
 * here: the props type must accept the harness's props spread AND be
 * assignable from any concrete component's props (contravariance), which
 * only `any` satisfies.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyComponent = Component<any, any, any>;

/**
 * Seeds the six most common stores (Translation, KeyManager, Todos, Auth,
 * LoadingIndicator, UiNotifications, ViewPoint) into Svelte context and then
 * renders the given component with the given props — unlocking context-coupled
 * components for jsdom tests (see TESTING.md §4.3).
 *
 * The store instances are real; per-test overrides can be applied through the
 * `stores` argument (e.g. `{ todos: { todos: [...], filteredTodos: [...] } }`)
 * and the created instances are exposed through `onReady`.
 */
export function renderWithContext(
	component: AnyComponent,
	props: Record<string, unknown> = {},
	options: {
		stores?: Record<string, Record<string, unknown>>;
		onReady?: (stores: Record<string, unknown>) => void;
		prepare?: (stores: Record<string, unknown>) => Record<string, unknown>;
	} = {}
) {
	const { stores, onReady, prepare } = options;
	return render(ContextHarness, {
		props: { component, props, stores: stores ?? {}, onReady, prepare }
	});
}
