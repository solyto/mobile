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
		name: 'mars',
		size: 24,
		node: [
			['path', { d: 'M16 3h5v5' }],
			['path', { d: 'm21 3-6.75 6.75' }],
			['circle', { cx: '10', cy: '14', r: '6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
