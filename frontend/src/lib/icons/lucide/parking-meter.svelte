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
		name: 'parking-meter',
		size: 24,
		node: [
			['path', { d: 'M11 15h2' }],
			['path', { d: 'M12 12v3' }],
			['path', { d: 'M12 19v3' }],
			['path', { d: 'M15.282 19a1 1 0 0 0 .948-.68l2.37-6.988a7 7 0 1 0-13.2 0l2.37 6.988a1 1 0 0 0 .948.68z' }],
			['path', { d: 'M9 9a3 3 0 1 1 6 0' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
