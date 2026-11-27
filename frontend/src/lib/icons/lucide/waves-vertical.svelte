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
		name: 'waves-vertical',
		size: 24,
		node: [
			['path', { d: 'M12 2q2 2.5 0 5t0 5 0 5 0 5' }],
			['path', { d: 'M19 2q2 2.5 0 5t0 5 0 5 0 5' }],
			['path', { d: 'M5 2q2 2.5 0 5t0 5 0 5 0 5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
