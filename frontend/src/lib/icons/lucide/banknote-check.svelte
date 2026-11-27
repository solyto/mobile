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
		name: 'banknote-check',
		size: 24,
		node: [
			['path', { d: 'M11.748 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4.875' }],
			['path', { d: 'm16 19 2 2 4-4' }],
			['path', { d: 'M18 12h.01' }],
			['path', { d: 'M6 12h.01' }],
			['circle', { cx: '12', cy: '12', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
