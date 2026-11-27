/**
 * @file
 * @license @lucide/svelte v1.59.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in this directory.
 */
export const hasA11yProp = (props: object): boolean => {
	for (const prop in props) {
		if (prop.startsWith('aria-') || prop === 'role' || prop === 'title') {
			return true;
		}
	}
	return false;
};
