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
		name: 'calendar-heart',
		size: 24,
		node: [
			['path', { d: 'M12.127 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v5.125' }],
			['path', { d: 'M14.62 17.8A2.25 2.25 0 1118 14.836a2.25 2.25 0 113.38 2.966l-2.626 2.856a.998.998 0 01-1.507 0z' }],
			['path', { d: 'M16 2v3' }],
			['path', { d: 'M3 9h18' }],
			['path', { d: 'M8 2v3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
