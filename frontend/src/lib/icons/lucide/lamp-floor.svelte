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
		name: 'lamp-floor',
		size: 24,
		node: [
			['path', { d: 'M12 10v12' }],
			['path', { d: 'M17.929 7.629A1 1 0 0 1 17 9H7a1 1 0 0 1-.928-1.371l2-5A1 1 0 0 1 9 2h6a1 1 0 0 1 .928.629z' }],
			['path', { d: 'M9 22h6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
