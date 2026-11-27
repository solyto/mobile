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
		name: 'git-commit-vertical',
		size: 24,
		node: [
			['path', { d: 'M12 3v6' }],
			['circle', { cx: '12', cy: '12', r: '3' }],
			['path', { d: 'M12 15v6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
