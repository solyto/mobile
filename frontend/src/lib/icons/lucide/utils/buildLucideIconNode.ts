/**
 * @file
 * @license @lucide/svelte v1.59.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in this directory.
 */
import defaultAttributes from './defaultAttributes';
import { mergeClasses } from './mergeClasses';
import type { LucideBuildParams, LucideIconData, LucideIconNode, SVGProps } from './types';

function isDefined<T>(value: T | null | undefined): value is T {
	return value !== null && value !== undefined;
}

function buildLucideIconNode(icon: LucideIconData, params: LucideBuildParams = {}): LucideIconNode {
	const attributeNames = params.attributeNames ?? {};
	const getAttributeName = (attributeName: string) => attributeNames[attributeName] ?? attributeName;
	const viewBoxWidth = icon.size ?? icon.width ?? defaultAttributes['width'];
	const viewBoxHeight = icon.size ?? icon.height ?? defaultAttributes['height'];
	const aliasClassNames = icon.aliases
		?.filter((alias) => typeof alias === 'string' && alias.trim() !== '')
		.map((alias) => `lucide-${alias}`) ?? [];
	const iconClassNames = [...(icon.name ? [`lucide-${icon.name}`] : []), ...aliasClassNames];
	const classNamesFromClassName = params.className?.split(' ').filter(Boolean) ?? [];
	const className = params.includeDefaultClasses === false
		? mergeClasses(...classNamesFromClassName)
		: mergeClasses('lucide', ...iconClassNames, ...classNamesFromClassName);
	const calculatedStrokeWidth = params.absoluteStrokeWidth
		? (Number(params.strokeWidth ?? defaultAttributes['stroke-width']) *
			Number(icon.size ?? icon.width ?? defaultAttributes['width'])) /
			Number(params.size ?? params.width ?? defaultAttributes['width'])
		: (params.strokeWidth ?? defaultAttributes['stroke-width']);
	const attributes: SVGProps = {
		...Object.entries(defaultAttributes).reduce<SVGProps>((attrs, [attrName, value]) => {
			attrs[getAttributeName(attrName)] = value;
			return attrs;
		}, {}),
		...('color' in params &&
			params.color && {
			[getAttributeName('stroke')]: params.color
		}),
		...('size' in params &&
			isDefined(params.size) && {
			[getAttributeName('width')]: params.size,
			[getAttributeName('height')]: params.size
		}),
		...('width' in params &&
			isDefined(params.width) && {
			[getAttributeName('width')]: params.width
		}),
		...('height' in params &&
			isDefined(params.height) && {
			[getAttributeName('height')]: params.height
		}),
		[getAttributeName('stroke-width')]: calculatedStrokeWidth,
		...(className && {
			[getAttributeName('class')]: className
		}),
		[getAttributeName('viewBox')]: `0 0 ${viewBoxWidth} ${viewBoxHeight}`,
		...(params.hasA11yProp === false
			? {
				[getAttributeName('aria-hidden')]: 'true'
			}
			: {}),
		...('attributes' in params && params.attributes)
	};

	return [
		'svg',
		attributes,
		icon.node.map((child): LucideIconNode => {
			const [name, attrs, children] = child;
			const nextAttrs = params.nonScalingStroke
				? { [getAttributeName('vector-effect')]: 'non-scaling-stroke', ...attrs }
				: attrs;
			return children ? [name, nextAttrs, children] : [name, nextAttrs];
		})
	];
}

export default buildLucideIconNode;
