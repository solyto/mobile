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
		name: 'non-binary',
		size: 24,
		node: [
			['path', { d: 'M12 2v10' }],
			['path', { d: 'm8.5 4 7 4' }],
			['path', { d: 'm8.5 8 7-4' }],
			['circle', { cx: '12', cy: '17', r: '5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
