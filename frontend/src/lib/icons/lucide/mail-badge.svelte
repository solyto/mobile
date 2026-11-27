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
		name: 'mail-badge',
		size: 24,
		node: [
			['path', { d: 'M22 7.7V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8.25' }],
			['path', { d: 'M12 12.996a1.94 1.94 0 0 1-1.03-.296L2 7' }],
			['path', { d: 'm20.69 16.479 1.29 4.88a.5.5 0 0 1-.698.591l-1.843-.849a1 1 0 0 0-.879.001l-1.846.85a.5.5 0 0 1-.692-.593l1.29-4.88' }],
			['circle', { cx: '19', cy: '14', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
