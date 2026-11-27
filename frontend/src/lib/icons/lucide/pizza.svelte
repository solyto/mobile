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
		name: 'pizza',
		size: 24,
		node: [
			['path', { d: 'm12 14-1 1' }],
			['path', { d: 'm13.75 18.25-1.25 1.42' }],
			['path', { d: 'M17.775 5.654a15.68 15.68 0 0 0-12.121 12.12' }],
			['path', { d: 'M18.8 9.3a1 1 0 0 0 2.1 7.7' }],
			['path', { d: 'M21.964 20.732a1 1 0 0 1-1.232 1.232l-18-5a1 1 0 0 1-.695-1.232A19.68 19.68 0 0 1 15.732 2.037a1 1 0 0 1 1.232.695z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
