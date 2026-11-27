/**
 * @file
 * @license @lucide/svelte v1.59.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in this directory.
 */
import { getContext, setContext } from 'svelte';

export interface LucideGlobalContext {
	color?: string;
	size?: number;
	strokeWidth?: number;
	absoluteStrokeWidth?: boolean;
	nonScalingStroke?: boolean;
	class?: string;
}

const LucideContext = Symbol('lucide-context');

export const setLucideProps = (globalProps: LucideGlobalContext) => setContext(LucideContext, globalProps);

export const getLucideContext = () => getContext<LucideGlobalContext | undefined>(LucideContext);
