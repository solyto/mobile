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
		name: 'file-scan',
		size: 24,
		node: [
			['path', { d: 'M20 10V8a2.4 2.4 0 0 0-.706-1.704l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h4.35' }],
			['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
			['path', { d: 'M16 14a2 2 0 0 0-2 2' }],
			['path', { d: 'M16 22a2 2 0 0 1-2-2' }],
			['path', { d: 'M20 14a2 2 0 0 1 2 2' }],
			['path', { d: 'M20 22a2 2 0 0 0 2-2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
