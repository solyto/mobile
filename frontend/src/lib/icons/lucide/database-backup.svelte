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
		name: 'database-backup',
		size: 24,
		node: [
			['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }],
			['path', { d: 'M3 12a9 3 0 0 0 5 2.69' }],
			['path', { d: 'M21 9.3V5' }],
			['path', { d: 'M3 5v14a9 3 0 0 0 6.47 2.88' }],
			['path', { d: 'M12 12v4h4' }],
			['path', { d: 'M13 20a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L12 16' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
