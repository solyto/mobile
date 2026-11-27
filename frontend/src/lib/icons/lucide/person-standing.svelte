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
		name: 'person-standing',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '5', r: '1' }],
			['path', { d: 'm9 20 3-6 3 6' }],
			['path', { d: 'm6 8 6 2 6-2' }],
			['path', { d: 'M12 10v4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
