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
		name: 'kayak',
		size: 24,
		node: [
			['path', { d: 'M18 17a1 1 0 0 0-1 1v1a2 2 0 1 0 2-2z' }],
			['path', { d: 'M20.97 3.61a.45.45 0 0 0-.58-.58C10.2 6.6 6.6 10.2 3.03 20.39a.45.45 0 0 0 .58.58C13.8 17.4 17.4 13.8 20.97 3.61' }],
			['path', { d: 'm6.707 6.707 10.586 10.586' }],
			['path', { d: 'M7 5a2 2 0 1 0-2 2h1a1 1 0 0 0 1-1z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
