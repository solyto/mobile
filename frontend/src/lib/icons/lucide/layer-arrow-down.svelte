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
		name: 'layer-arrow-down',
		size: 24,
		node: [
			['path', { d: 'M12 10v10' }],
			['path', { d: 'M22 10a1 1 0 01-.59.92l-5.077 2.308' }],
			['path', { d: 'M22.017 10.005a1 1 0 00-.597-.916l-8.59-3.91a2 2 0 00-1.66.001L2.6 9.08a1 1 0 00-.02 1.831l5.093 2.316' }],
			['path', { d: 'm9 17 3 3 3-3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
