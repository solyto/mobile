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
		name: 'kazakh-tenge',
		size: 24,
		node: [
			['path', { d: 'M12 8v12' }],
			['path', { d: 'M6 4h12' }],
			['path', { d: 'M6 8h12' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
