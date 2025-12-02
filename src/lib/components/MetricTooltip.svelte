<script lang="ts">
	export let tip: string;

	let showTooltip = false;
</script>

<div class="tooltip-container">
	<button
		class="help-icon"
		on:mouseenter={() => showTooltip = true}
		on:mouseleave={() => showTooltip = false}
		on:click|preventDefault={() => showTooltip = !showTooltip}
		type="button"
		aria-label="Help"
	>
		?
	</button>
	{#if showTooltip}
		<div class="tooltip">
			{tip}
		</div>
	{/if}
</div>

<style>
	.tooltip-container {
		position: relative;
		display: inline-block;
		margin-left: 6px;
	}

	.help-icon {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: white;
		color: var(--color-british-blue);
		border: 2px solid var(--color-british-blue);
		font-size: 12px;
		font-weight: 700;
		cursor: help;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		padding: 0;
		line-height: 1;
		font-family: 'IBM Plex Sans', sans-serif;
	}

	.help-icon:hover {
		background: var(--color-british-blue);
		color: white;
	}

	.tooltip {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		top: calc(100% + 8px);
		background: var(--color-british-blue);
		color: white;
		padding: 10px 14px;
		border-radius: 0;
		border: 2px solid var(--color-british-gold);
		font-size: 13px;
		line-height: 1.5;
		white-space: normal;
		width: 280px;
		max-width: 90vw;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
		z-index: 10000;
		pointer-events: none;
		font-family: 'IBM Plex Sans', sans-serif;
	}

	.tooltip::after {
		content: '';
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 6px solid transparent;
		border-bottom-color: var(--color-british-gold);
	}

	/* Mobile adjustments */
	@media (max-width: 640px) {
		.tooltip {
			width: 240px;
			font-size: 12px;
			padding: 8px 12px;
		}
	}
</style>
