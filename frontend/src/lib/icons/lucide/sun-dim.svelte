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
		name: 'sun-dim',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '4' }],
			['path', { d: 'M12 4h.01' }],
			['path', { d: 'M20 12h.01' }],
			['path', { d: 'M12 20h.01' }],
			['path', { d: 'M4 12h.01' }],
			['path', { d: 'M17.657 6.343h.01' }],
			['path', { d: 'M17.657 17.657h.01' }],
			['path', { d: 'M6.343 17.657h.01' }],
			['path', { d: 'M6.343 6.343h.01' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
