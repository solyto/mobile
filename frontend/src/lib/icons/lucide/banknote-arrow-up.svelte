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
		name: 'banknote-arrow-up',
		size: 24,
		node: [
			['path', { d: 'M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5' }],
			['path', { d: 'M18 12h.01' }],
			['path', { d: 'M19 22v-6' }],
			['path', { d: 'm22 19-3-3-3 3' }],
			['path', { d: 'M6 12h.01' }],
			['circle', { cx: '12', cy: '12', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
