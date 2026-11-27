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
		name: 'bike',
		size: 24,
		node: [
			['circle', { cx: '18.5', cy: '17.5', r: '3.5' }],
			['circle', { cx: '5.5', cy: '17.5', r: '3.5' }],
			['circle', { cx: '15', cy: '5', r: '1' }],
			['path', { d: 'M12 17.5V14l-3-3 4-3 2 3h2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
