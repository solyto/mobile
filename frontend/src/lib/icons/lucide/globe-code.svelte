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
		name: 'globe-code',
		size: 24,
		node: [
			['path', { d: 'M15.5 10 13 7.5 15.5 5' }],
			['path', { d: 'M15.861 14A14.5 14.5 0 0112 22a14.48 14.48 0 010-20 10 10 0 109.888 11.5' }],
			['path', { d: 'M19.5 5 22 7.5 19.5 10' }],
			['path', { d: 'M2 12h8.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
