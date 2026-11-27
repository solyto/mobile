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
		name: 'loader',
		size: 24,
		node: [
			['path', { d: 'M12 2v4' }],
			['path', { d: 'm16.2 7.8 2.9-2.9' }],
			['path', { d: 'M18 12h4' }],
			['path', { d: 'm16.2 16.2 2.9 2.9' }],
			['path', { d: 'M12 18v4' }],
			['path', { d: 'm4.9 19.1 2.9-2.9' }],
			['path', { d: 'M2 12h4' }],
			['path', { d: 'm4.9 4.9 2.9 2.9' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
