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
		name: 'certificate',
		size: 24,
		node: [
			['path', { d: 'M12 10H6' }],
			['path', { d: 'm20.69 15.479 1.29 4.88a.5.5 0 01-.698.591l-1.843-.849a1 1 0 00-.879.001l-1.846.85a.5.5 0 01-.692-.593l1.29-4.88' }],
			['path', { d: 'M22 6.675V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2h8' }],
			['path', { d: 'M6 14h4' }],
			['circle', { cx: '19', cy: '13', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
