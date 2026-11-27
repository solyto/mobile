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
		name: 'triangle-alert',
		size: 24,
		node: [
			['path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3' }],
			['path', { d: 'M12 9v4' }],
			['path', { d: 'M12 17h.01' }]
		],
		aliases: ['alert-triangle']
	};
</script>

<Icon {...props} icon={iconData} />
