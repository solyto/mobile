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
		name: 'venus',
		size: 24,
		node: [
			['path', { d: 'M12 15v7' }],
			['path', { d: 'M9 19h6' }],
			['circle', { cx: '12', cy: '9', r: '6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
