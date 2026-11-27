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
		name: 'heading-5',
		size: 24,
		node: [
			['path', { d: 'M4 12h8' }],
			['path', { d: 'M4 18V6' }],
			['path', { d: 'M12 18V6' }],
			['path', { d: 'M17 13v-3h4' }],
			['path', { d: 'M17 17.7c.4.2.8.3 1.3.3 1.5 0 2.7-1.1 2.7-2.5S19.8 13 18.3 13H17' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
