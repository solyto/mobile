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
		name: 'mic-audio-lines',
		size: 24,
		node: [
			['path', { d: 'M10 3v2.341' }],
			['path', { d: 'M12 17v4' }],
			['path', { d: 'M14 5v.341' }],
			['path', { d: 'M18 5v13' }],
			['path', { d: 'M2 10v3' }],
			['path', { d: 'M22 10v3' }],
			['path', { d: 'M6 6v11' }],
			['path', { d: 'M9 21h6' }],
			['rect', { width: '4', height: '8', x: '10', y: '9', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
