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
		name: 'flask-round',
		size: 24,
		node: [
			['path', { d: 'M10 2v6.292a7 7 0 1 0 4 0V2' }],
			['path', { d: 'M5 15h14' }],
			['path', { d: 'M8.5 2h7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
