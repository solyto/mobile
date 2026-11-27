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
		name: 'megaphone-off',
		size: 24,
		node: [
			['path', { d: 'M11.636 6A13 13 0 0 0 19.4 3.2 1 1 0 0 1 21 4v11.344' }],
			['path', { d: 'M14.378 14.357A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14' }],
			['path', { d: 'M8 8v6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
