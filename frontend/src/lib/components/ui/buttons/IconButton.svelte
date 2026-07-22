<script lang="ts">
	let {
		onclick = () => {},
		type = 'btn',
		disabled = false,
		pulse = false,
		class: customClass = '',
		children
	} = $props<{
		onclick?: () => void;
		type?: 'btn' | 'action' | 'danger' | 'success' | 'primary' | 'warning' | 'plain' | 'slight';
		disabled?: boolean;
		pulse?: boolean;
		class?: string;
		children: any;
	}>();
</script>

<button
	class="flex cursor-pointer items-center justify-center gap-2 rounded-sm p-1 font-bold transition-all {customClass}"
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
	class:hover:brightness-90={(type === 'success' || type === 'primary' || type === 'warning') && !disabled}
	class:bg-c-neutral-1={type === 'slight'}
	class:hover:bg-c-neutral-3={type === 'slight' && !disabled}
	class:dark:bg-s-dark-3={type === 'slight'}
	class:dark:hover:bg-s-dark-2={type === 'slight' && !disabled}
	class:dark:text-white={type === 'slight'}
	class:text-c-neutral-7={type === 'slight'}
	class:text-c-heading={type === 'warning' || type === 'action'}
	class:text-c-btn-text={type !== 'plain' && type !== 'slight' && type !== 'warning' && type !== 'action'}
	class:hover:text-white={type !== 'plain' && type !== 'slight' && type !== 'warning' && type !== 'action' && !disabled}
	class:px-4={type !== 'plain'}
	class:py-2={type !== 'plain'}
	class:animate-pulse={pulse}
	{disabled}
	{onclick}
>
	{@render children()}
</button>

<!-- bg-c-btn bg-c-action bg-c-danger bg-c-success bg-c-primary bg-c-warning bg-c-neutral-1 -->
