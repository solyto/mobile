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
		name: 'split',
		size: 24,
		node: [
			['path', { d: 'M16 3h5v5' }],
			['path', { d: 'M8 3H3v5' }],
			['path', { d: 'M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3' }],
			['path', { d: 'm15 9 6-6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
