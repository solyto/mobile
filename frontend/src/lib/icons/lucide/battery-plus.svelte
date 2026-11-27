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
		name: 'battery-plus',
		size: 24,
		node: [
			['path', { d: 'M10 9v6' }],
			['path', { d: 'M12.543 6H16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.605' }],
			['path', { d: 'M22 14v-4' }],
			['path', { d: 'M7 12h6' }],
			['path', { d: 'M7.606 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.606' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
