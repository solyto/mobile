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
		name: 'mouse-pointer-ban',
		size: 24,
		node: [
			['path', { d: 'M2.034 2.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.944L8.204 7.545a1 1 0 0 0-.66.66l-1.066 3.443a.5.5 0 0 1-.944.033z' }],
			['circle', { cx: '16', cy: '16', r: '6' }],
			['path', { d: 'm11.8 11.8 8.4 8.4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
