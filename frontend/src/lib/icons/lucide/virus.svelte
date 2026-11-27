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
		name: 'virus',
		size: 24,
		node: [
			['path', { d: 'M12 14.991h.01' }],
			['path', { d: 'M12 22v-3' }],
			['path', { d: 'M12 2v3' }],
			['path', { d: 'M13 22h-2' }],
			['path', { d: 'M13 2h-2' }],
			['path', { d: 'M13.99 10H14' }],
			['path', { d: 'm16.5 19.794-1-1.733' }],
			['path', { d: 'm16.5 4.205-1 1.732' }],
			['path', { d: 'm19.794 16.5-1.732-1' }],
			['path', { d: 'm19.794 7.5-1.732 1' }],
			['path', { d: 'M2 12h3' }],
			['path', { d: 'M2 13v-2' }],
			['path', { d: 'M22 12h-3' }],
			['path', { d: 'M22 13v-2' }],
			['path', { d: 'm4.206 16.5 1.732-1' }],
			['path', { d: 'm4.206 7.5 1.732 1' }],
			['path', { d: 'm7.5 19.794 1-1.733' }],
			['path', { d: 'm7.5 4.205 1 1.732' }],
			['path', { d: 'M9 12h.01' }],
			['circle', { cx: '12', cy: '12', r: '7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
