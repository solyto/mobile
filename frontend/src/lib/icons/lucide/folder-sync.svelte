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
		name: 'folder-sync',
		size: 24,
		node: [
			['path', { d: 'M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v.5' }],
			['path', { d: 'M12 10v4h4' }],
			['path', { d: 'm12 14 1.535-1.605a5 5 0 0 1 8 1.5' }],
			['path', { d: 'M22 22v-4h-4' }],
			['path', { d: 'm22 18-1.535 1.605a5 5 0 0 1-8-1.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
