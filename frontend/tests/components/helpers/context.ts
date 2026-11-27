import { render } from '@testing-library/svelte';
import type { Component } from 'svelte';
import ContextHarness from './ContextHarness.svelte';

// Only `any` is both assignable from every component's props and accepts the harness's props spread.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyComponent = Component<any, any, any>;

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
