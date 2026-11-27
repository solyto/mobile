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
		name: 'image-plus',
		size: 24,
		node: [
			['path', { d: 'M16 5h6' }],
			['path', { d: 'M19 2v6' }],
			['path', { d: 'M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5' }],
			['path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' }],
			['circle', { cx: '9', cy: '9', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
