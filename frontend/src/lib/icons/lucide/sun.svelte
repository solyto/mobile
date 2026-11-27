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
		name: 'sun',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '4' }],
			['path', { d: 'M12 2v2' }],
			['path', { d: 'M12 20v2' }],
			['path', { d: 'm4.93 4.93 1.41 1.41' }],
			['path', { d: 'm17.66 17.66 1.41 1.41' }],
			['path', { d: 'M2 12h2' }],
			['path', { d: 'M20 12h2' }],
			['path', { d: 'm6.34 17.66-1.41 1.41' }],
			['path', { d: 'm19.07 4.93-1.41 1.41' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
