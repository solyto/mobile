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
		name: 'bomb',
		size: 24,
		node: [
			['circle', { cx: '11', cy: '13', r: '9' }],
			['path', { d: 'M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95' }],
			['path', { d: 'm22 2-1.5 1.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
