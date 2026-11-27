/**
 * @file
 * @license @lucide/svelte v1.59.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in this directory.
 */
export const mergeClasses = <ClassType = string | undefined | null>(...classes: ClassType[]): string => classes
	.filter((className, index, array) => {
		return Boolean(className) && (className as string).trim() !== '' && array.indexOf(className) === index;
	})
	.join(' ')
	.trim();
