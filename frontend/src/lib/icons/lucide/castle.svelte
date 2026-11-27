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
		name: 'castle',
		size: 24,
		node: [
			['path', { d: 'M10 5V3' }],
			['path', { d: 'M14 5V3' }],
			['path', { d: 'M15 21v-3a3 3 0 0 0-6 0v3' }],
			['path', { d: 'M18 3v8' }],
			['path', { d: 'M18 5H6' }],
			['path', { d: 'M22 11H2' }],
			['path', { d: 'M22 9v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9' }],
			['path', { d: 'M6 3v8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
