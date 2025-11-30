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
		background: #e0e7ff;
		color: #4f46e5;
		border: 1px solid #c7d2fe;
		font-size: 12px;
		font-weight: 700;
		cursor: help;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		padding: 0;
		line-height: 1;
	}

	.help-icon:hover {
		background: #c7d2fe;
		border-color: #a5b4fc;
	}

	.tooltip {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		bottom: calc(100% + 8px);
		background: #1f2937;
		color: white;
		padding: 10px 14px;
		border-radius: 8px;
		font-size: 13px;
		line-height: 1.5;
		white-space: normal;
		width: 280px;
		max-width: 90vw;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
		z-index: 1000;
		pointer-events: none;
	}

	.tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 6px solid transparent;
		border-top-color: #1f2937;
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
