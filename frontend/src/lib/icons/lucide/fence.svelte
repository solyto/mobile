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
		name: 'fence',
		size: 24,
		node: [
			['path', { d: 'M4 3 2 5v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z' }],
			['path', { d: 'M6 8h4' }],
			['path', { d: 'M6 18h4' }],
			['path', { d: 'm12 3-2 2v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z' }],
			['path', { d: 'M14 8h4' }],
			['path', { d: 'M14 18h4' }],
			['path', { d: 'm20 3-2 2v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
