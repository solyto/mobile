/**
 * @file
 * @license @lucide/svelte v1.59.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in this directory.
 */
import type { SVGAttributes } from 'svelte/elements';
import type { Snippet, Component } from 'svelte';
import type { LucideIconData as SharedLucideIconData, LucideIconNode as SharedLucideIconNode } from './utils/types';

export type Attrs = Record<string, unknown> & SVGAttributes<SVGSVGElement>;

type IconNodeElements = 'circle' | 'ellipse' | 'g' | 'line' | 'path' | 'polygon' | 'polyline' | 'rect';

export type LucideIconNode = SharedLucideIconNode<IconNodeElements, Attrs>;

export type LucideIconData = SharedLucideIconData<IconNodeElements, Attrs>;

export type LucideProps = Attrs & {
	color?: string;
	size?: number | string;
	strokeWidth?: number | string;
	absoluteStrokeWidth?: boolean;
	nonScalingStroke?: boolean;
	children?: Snippet;
	title?: string;
};

export type IconProps = LucideProps & ({
	icon: LucideIconData;
	iconNode?: never;
} | {
	icon?: never;
	iconNode: LucideIconNode[];
});

export type LucideIcon = Component<LucideProps>;
