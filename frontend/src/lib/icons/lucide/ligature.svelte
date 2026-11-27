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
		name: 'ligature',
		size: 24,
		node: [
			['path', { d: 'M14 12h2v8' }],
			['path', { d: 'M14 20h4' }],
			['path', { d: 'M6 12h4' }],
			['path', { d: 'M6 20h4' }],
			['path', { d: 'M8 20V8a4 4 0 0 1 7.464-2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
