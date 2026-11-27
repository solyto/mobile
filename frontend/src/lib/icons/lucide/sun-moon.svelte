<!--
@lucide/svelte v1.59.0 - ISC

This source code is licensed under the ISC license.
See the LICENSE file in this directory.
-->
<script lang="ts">
	import Icon from './Icon.svelte';
	import type { LucideIconData, LucideProps } from './types';

	const props: LucideProps = $props();

	const iconData: LucideIconData = {
		name: 'sun-moon',
		size: 24,
		node: [
			['path', { d: 'M12 2v2' }],
			['path', { d: 'M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715' }],
			['path', { d: 'M16 12a4 4 0 0 0-4-4' }],
			['path', { d: 'm19 5-1.256 1.256' }],
			['path', { d: 'M20 12h2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
