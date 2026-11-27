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
		name: 'file-output',
		size: 24,
		node: [
			['path', { d: 'M4.226 20.925A2 2 0 0 0 6 22h12a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.127' }],
			['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
			['path', { d: 'm5 11-3 3' }],
			['path', { d: 'm5 17-3-3h10' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
