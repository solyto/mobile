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
		name: 'japanese-yen',
		size: 24,
		node: [
			['path', { d: 'M12 9.5V21m0-11.5L6 3m6 6.5L18 3' }],
			['path', { d: 'M6 15h12' }],
			['path', { d: 'M6 11h12' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
