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
		name: 'cloud-moon',
		size: 24,
		node: [
			['path', { d: 'M13 16a3 3 0 0 1 0 6H7a5 5 0 1 1 4.9-6z' }],
			['path', { d: 'M18.376 14.512a6 6 0 0 0 3.461-4.127c.148-.625-.659-.97-1.248-.714a4 4 0 0 1-5.259-5.26c.255-.589-.09-1.395-.716-1.248a6 6 0 0 0-4.594 5.36' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
