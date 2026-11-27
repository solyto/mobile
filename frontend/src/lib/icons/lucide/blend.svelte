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
		name: 'blend',
		size: 24,
		node: [
			['circle', { cx: '15', cy: '9', r: '7' }],
			['circle', { cx: '9', cy: '15', r: '7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
