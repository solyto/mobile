/**
 * @file
 * @license @lucide/svelte v1.59.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in this directory.
 */
export type SVGProps = Record<string, unknown>;

export type LucideIconNode<TName extends string = string, TProps extends Record<string, unknown> = SVGProps> =
	| [name: TName, attributes: TProps]
	| [name: TName, attributes: TProps, children: LucideIconNode<TName, TProps>[]];

export type LucideIconData<TName extends string = string, TProps extends Record<string, unknown> = SVGProps> = {
	name?: string;
	node: LucideIconNode<TName, TProps>[];
	aliases?: string[];
} & ({
	size?: number;
	width?: never;
	height?: never;
} | {
	size?: never;
	width?: number;
	height?: number;
});

export type LucideBuildParams<TProps extends Record<string, unknown> = SVGProps> = {
	color?: string;
	strokeWidth?: string | number;
	absoluteStrokeWidth?: boolean;
	nonScalingStroke?: boolean;
	className?: string;
	includeDefaultClasses?: boolean;
	hasA11yProp?: boolean;
	attributes?: TProps;
	attributeNames?: Record<string, string>;
} & ({
	size?: string | number | null;
	width?: never;
	height?: never;
} | {
	size?: never;
	width?: string | number | null;
	height?: string | number | null;
});
