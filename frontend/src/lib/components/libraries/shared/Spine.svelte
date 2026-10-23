<script lang="ts">
	let {
		title,
		coverUrl,
		xOffset,
		spineWidth,
		spineHeight,
		coverWidth,
		coverHeight,
		gap,
		isSquare,
		hovered,
		onHover,
		onCoverLoad,
		onClick
	}: {
		title: string;
		coverUrl: string | null;
		xOffset: number;
		spineWidth: number;
		spineHeight: number;
		coverWidth: number;
		coverHeight: number;
		gap: number;
		isSquare: boolean;
		hovered: boolean;
		onHover: (hovered: boolean) => void;
		onCoverLoad: (e: Event) => void;
		onClick: () => void;
	} = $props();

	function titleHash(): number {
		let hash = 0;
		for (let i = 0; i < title.length; i++) {
			hash = (hash << 5) - hash + title.charCodeAt(i);
			hash |= 0;
		}
		return Math.abs(hash) % 360;
	}

	function spineColor(): string {
		return `hsl(${titleHash()}, 28%, 38%)`;
	}

	function spineTextColor(): string {
		return `hsl(${titleHash()}, 20%, 85%)`;
	}

	function coverSide(): 'left' | 'right' {
		return xOffset < coverWidth + 16 ? 'left' : 'right';
	}

	function coverTransform(): string {
		if (hovered) return 'translateZ(50px) translateY(-14px) rotateY(0deg)';
		return `translateZ(0) translateY(0) rotateY(${coverSide() === 'left' ? -35 : 35}deg)`;
	}
</script>

<button
	class="relative flex-shrink-0 cursor-pointer"
	style="
		width: {spineWidth}px;
		height: {spineHeight}px;
		margin-right: {gap}px;
		z-index: {hovered ? 20 : 1};
		overflow: visible;
		perspective: 700px;
		perspective-origin: {coverSide()} center;
	"
	onmouseenter={() => onHover(true)}
	onmouseleave={() => onHover(false)}
	onclick={onClick}
	aria-label={title}
>
	<div
		style="
			position: absolute;
			inset: 0;
			border-radius: 2px;
			overflow: hidden;
			background: {spineColor()};
			transform: {hovered ? 'translateZ(30px) translateY(-10px)' : 'translateZ(0) translateY(0)'};
			transition: transform 0.35s ease;
			box-shadow: {hovered ? '0 15px 35px rgba(0,0,0,0.35)' : '2px 0 4px rgba(0,0,0,0.2)'};
		"
	>
		{#if coverUrl}
			<img
				src={coverUrl}
				alt=""
				aria-hidden="true"
				class="pointer-events-none absolute inset-0 h-full w-full object-cover"
				style="filter: blur(2px) brightness(0.55); transform: scale(1.1);"
				loading="lazy"
				decoding="async"
			/>
		{/if}
		<span
			style="
				position: absolute;
				bottom: 8px;
				left: 0; right: 0;
				text-align: center;
				writing-mode: vertical-rl;
				transform: rotate(180deg);
				font-size: {isSquare ? 9 : 11}px;
				font-weight: 600;
				letter-spacing: 0.02em;
				color: rgba(255,255,255,0.92);
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
				max-height: 90%;
				pointer-events: none;
				text-shadow: 0 1px 4px rgba(0,0,0,0.6);
			"
		>
			{title}
		</span>
	</div>

	<div
		style="
			position: absolute;
			top: 0;
			{coverSide()}: 0;
			width: {coverWidth}px;
			height: {coverHeight}px;
			border-radius: 2px;
			overflow: hidden;
			background: {spineColor()};
			transform-origin: {coverSide()} center;
			opacity: {hovered ? 1 : 0};
			transform: {coverTransform()};
			transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
			box-shadow: 0 20px 50px rgba(0,0,0,0.45);
			pointer-events: none;
		"
	>
		{#if coverUrl}
			<img
				src={coverUrl}
				alt={title}
				class="h-full w-full object-cover"
				loading="lazy"
				decoding="async"
				onload={onCoverLoad}
			/>
		{:else}
			<div class="flex h-full w-full items-end p-2">
				<span class="text-xs font-semibold leading-tight" style="color: {spineTextColor()};">
					{title}
				</span>
			</div>
		{/if}
	</div>
</button>
