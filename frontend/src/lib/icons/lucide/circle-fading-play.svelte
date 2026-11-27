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
		name: 'circle-fading-play',
		size: 24,
		node: [
			['path', { d: 'M12 2a10 10 0 0 1 7.38 16.75' }],
			['path', { d: 'M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z' }],
			['path', { d: 'M2.5 8.875a10 10 0 0 0-.5 3' }],
			['path', { d: 'M2.83 16a10 10 0 0 0 2.43 3.4' }],
			['path', { d: 'M4.636 5.235a10 10 0 0 1 .891-.857' }],
			['path', { d: 'M8.644 21.42a10 10 0 0 0 7.631-.38' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
