<script lang="ts">
	let {
		title,
		onclick = () => {},
		href = null,
		type = 'btn',
		align = 'center',
		disabled = false,
		class: customClass = ''
	}: {
		title: string;
		onclick?: () => void;
		href?: string | null;
		type?: 'btn' | 'action' | 'danger' | 'success' | 'primary' | 'warning' | 'plain' | 'slight';
		align?: 'left' | 'center' | 'right';
		disabled?: boolean;
		class?: string;
	} = $props();

	let brightensOnHover = $derived(type === 'success' || type === 'primary' || type === 'warning');
	let hasButtonText = $derived(type === 'btn' || type === 'danger' || type === 'success');
	let linkHasButtonText = $derived(hasButtonText || type === 'action');
</script>

{#if href === null}
	<button
		class="rounded-sm p-1 font-bold transition-all pointer-events-all {customClass}"
		class:cursor-pointer={!disabled}
		class:cursor-not-allowed={disabled}
		class:opacity-40={disabled}
		class:hover:shadow-xs={!disabled}
		class:bg-c-btn={type === 'btn'}
		class:hover:bg-c-btn-hover={type === 'btn' && !disabled}
		class:bg-c-action={type === 'action'}
		class:hover:bg-c-action-hover={type === 'action' && !disabled}
		class:bg-c-danger={type === 'danger'}
		class:hover:bg-c-danger-hover={type === 'danger' && !disabled}
		class:bg-c-success={type === 'success'}
		class:bg-c-primary={type === 'primary'}
		class:bg-c-warning={type === 'warning'}
		class:hover:brightness-90={brightensOnHover && !disabled}
		class:bg-c-neutral-1={type === 'slight'}
		class:hover:bg-c-neutral-3={type === 'slight' && !disabled}
		class:dark:bg-s-dark-3={type === 'slight'}
		class:dark:hover:bg-s-dark-2={type === 'slight' && !disabled}
		class:dark:text-white={type === 'slight'}
		class:text-c-neutral-7={type === 'slight'}
		class:text-c-action-text={type === 'warning' || type === 'action'}
		class:text-c-btn-text={hasButtonText}
		class:text-c-primary-text={type === 'primary'}
		class:hover:text-white={hasButtonText && !disabled}
		class:hover:text-c-primary-text-hover={type === 'primary' && !disabled}
		class:text-left={align === 'left'}
		class:text-right={align === 'right'}
		class:px-4={type !== 'plain'}
		class:py-2={type !== 'plain'}
		{disabled}
		{onclick}
	>
		{title}
	</button>
{:else}
	<a
		{href}
		class="cursor-pointer rounded-sm p-1 font-bold transition-all hover:shadow-xs {customClass}"
		class:bg-c-btn={type === 'btn'}
		class:hover:bg-c-btn-hover={type === 'btn'}
		class:bg-c-action={type === 'action'}
		class:hover:bg-c-action-hover={type === 'action'}
		class:bg-c-danger={type === 'danger'}
		class:hover:bg-c-danger-hover={type === 'danger'}
		class:bg-c-success={type === 'success'}
		class:bg-c-primary={type === 'primary'}
		class:bg-c-warning={type === 'warning'}
		class:hover:brightness-90={brightensOnHover}
		class:bg-c-neutral-1={type === 'slight'}
		class:hover:bg-c-neutral-3={type === 'slight'}
		class:dark:bg-s-dark-3={type === 'slight'}
		class:dark:hover:bg-s-dark-2={type === 'slight'}
		class:dark:text-white={type === 'slight'}
		class:text-c-neutral-7={type === 'slight'}
		class:text-c-action-text={type === 'warning'}
		class:text-c-btn-text={linkHasButtonText}
		class:text-c-primary-text={type === 'primary'}
		class:hover:text-white={linkHasButtonText}
		class:hover:text-c-primary-text-hover={type === 'primary'}
		class:text-left={align === 'left'}
		class:text-right={align === 'right'}
		class:px-4={type !== 'plain'}
		class:py-2={type !== 'plain'}
	>
		{title}
	</a>
{/if}

<!-- bg-c-btn bg-c-action bg-c-danger bg-c-success bg-c-primary bg-c-warning bg-c-neutral-1 -->
