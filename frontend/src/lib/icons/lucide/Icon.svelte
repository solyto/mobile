<!--
@lucide/svelte v1.59.0 - ISC

This source code is licensed under the ISC license.
See the LICENSE file in this directory.
-->
<script lang="ts">
	import buildLucideIconNode from './utils/buildLucideIconNode';
	import { hasA11yProp } from './utils/hasA11yProp';
	import { getLucideContext } from './context';
	import { mergeClasses } from './utils/mergeClasses';
	import type { IconProps } from './types';

	const globalProps = getLucideContext() ?? {};

	const {
		color = globalProps.color ?? 'currentColor',
		size = globalProps.size ?? 24,
		width = size,
		height = size,
		strokeWidth = globalProps.strokeWidth ?? 2,
		absoluteStrokeWidth = globalProps.absoluteStrokeWidth ?? false,
		nonScalingStroke = globalProps.nonScalingStroke ?? false,
		iconNode = [],
		icon = {
			node: iconNode,
			aliases: [],
			size: 24
		},
		class: propsClass,
		children,
		...props
	}: IconProps = $props();

	const hasAccessibleProp = $derived(Boolean(children) || hasA11yProp(props));

	const [, svgAttributes, builtIconNode = []] = $derived(buildLucideIconNode(icon, {
		color,
		width,
		height,
		strokeWidth,
		absoluteStrokeWidth,
		nonScalingStroke,
		className: mergeClasses('lucide-icon', globalProps.class),
		hasA11yProp: hasAccessibleProp,
		attributes: props
	}));

	const iconAttributes = $derived({
		...svgAttributes,
		class: [...(svgAttributes.class as string).split(' '), propsClass]
	});
</script>

<svg {...iconAttributes}>
	{#each builtIconNode as [tag, attrs], index (index)}
		<svelte:element this={tag} {...attrs} />
	{/each}
	{@render children?.()}
</svg>
