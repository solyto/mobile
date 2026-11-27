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
		name: 'lamp-ceiling',
		size: 24,
		node: [
			['path', { d: 'M12 2v5' }],
			['path', { d: 'M14.829 15.998a3 3 0 1 1-5.658 0' }],
			['path', { d: 'M20.92 14.606A1 1 0 0 1 20 16H4a1 1 0 0 1-.92-1.394l3-7A1 1 0 0 1 7 7h10a1 1 0 0 1 .92.606z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
