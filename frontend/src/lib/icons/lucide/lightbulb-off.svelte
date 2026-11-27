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
		name: 'lightbulb-off',
		size: 24,
		node: [
			['path', { d: 'M16.8 11.2c.8-.9 1.2-2 1.2-3.2a6 6 0 0 0-9.3-5' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M6.3 6.3a4.67 4.67 0 0 0 1.2 5.2c.7.7 1.3 1.5 1.5 2.5' }],
			['path', { d: 'M9 18h6' }],
			['path', { d: 'M10 22h4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
