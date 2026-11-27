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
		name: 'sun-medium',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '4' }],
			['path', { d: 'M12 3v1' }],
			['path', { d: 'M12 20v1' }],
			['path', { d: 'M3 12h1' }],
			['path', { d: 'M20 12h1' }],
			['path', { d: 'm18.364 5.636-.707.707' }],
			['path', { d: 'm6.343 17.657-.707.707' }],
			['path', { d: 'm5.636 5.636.707.707' }],
			['path', { d: 'm17.657 17.657.707.707' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
