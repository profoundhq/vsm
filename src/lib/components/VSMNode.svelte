<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import type { VSMActivity } from '$lib/types/vsm';

	export let data: VSMActivity;
	export let isStart = false;
	export let isEnd = false;

	$: hasTimingData = data.processTime !== undefined || data.leadTime !== undefined;
	$: hasDimensionsData = data.dimensions && Object.keys(data.dimensions).length > 0;
</script>

<div class="vsm-node" class:constraint={data.isConstraint} class:start={isStart} class:end={isEnd}>
	<Handle type="target" position={Position.Left} />

	{#if isStart || isEnd}
		<div class="position-indicator">
			{#if isStart}
				<span class="emoji" title="Start">💡</span>
			{:else if isEnd}
				<span class="emoji" title="End">😀</span>
			{/if}
		</div>
	{/if}

	<div class="node-header">
		<h3>{data.name}</h3>
		{#if data.isConstraint}
			<span class="constraint-badge">⚠️ Constraint</span>
		{/if}
	</div>

	{#if hasTimingData}
		<div class="node-timing">
			{#if data.processTime !== undefined}
				<div class="timing-item">
					<span class="label">Process Time:</span>
					<span class="value">{data.processTime}min</span>
				</div>
			{/if}
			{#if data.leadTime !== undefined}
				<div class="timing-item">
					<span class="label">Lead Time:</span>
					<span class="value">{data.leadTime}min</span>
				</div>
			{/if}
		</div>
	{/if}

	{#if hasDimensionsData && data.dimensions}
		<div class="node-dimensions">
			{#if data.dimensions.value !== undefined}
				<div class="dim-item">Value: {data.dimensions.value}%</div>
			{/if}
			{#if data.dimensions.defectRate !== undefined}
				<div class="dim-item">Defect Rate: {data.dimensions.defectRate}%</div>
			{/if}
			{#if data.dimensions.changeoverTime !== undefined}
				<div class="dim-item">Changeover: {data.dimensions.changeoverTime}min</div>
			{/if}
		</div>
	{/if}

	<Handle type="source" position={Position.Right} />
</div>

<style>
	/* Mobile-first node design */
	.vsm-node {
		background: white;
		border: 2px solid var(--color-border);
		border-radius: 8px;
		padding: 10px;
		min-width: 160px;
		max-width: 220px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: all 0.2s;
		touch-action: none;
		position: relative;
	}

	.vsm-node:hover,
	.vsm-node:active {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.vsm-node.constraint {
		border-color: var(--color-constraint);
		background: #fff5f5;
	}

	.vsm-node.start {
		border-color: #fbbf24;
		background: #fffbeb;
	}

	.vsm-node.end {
		border-color: #22c55e;
		background: #f0fdf4;
	}

	.position-indicator {
		position: absolute;
		top: -12px;
		right: -12px;
		background: white;
		border-radius: 50%;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		z-index: 10;
	}

	.emoji {
		font-size: 20px;
		line-height: 1;
	}

	.node-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 6px;
		margin-bottom: 8px;
	}

	.node-header h3 {
		font-size: 13px;
		font-weight: 600;
		margin: 0;
		line-height: 1.3;
		flex: 1;
	}

	.constraint-badge {
		font-size: 10px;
		padding: 2px 5px;
		background: var(--color-constraint);
		color: white;
		border-radius: 3px;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.node-timing {
		background: #f8f9fa;
		padding: 6px 8px;
		border-radius: 4px;
		margin-top: 6px;
	}

	.timing-item {
		display: flex;
		justify-content: space-between;
		font-size: 11px;
		margin-bottom: 3px;
		gap: 8px;
	}

	.timing-item:last-child {
		margin-bottom: 0;
	}

	.label {
		color: #666;
		flex-shrink: 0;
	}

	.value {
		font-weight: 600;
		color: var(--color-primary);
	}

	.node-dimensions {
		background: #f0f7ff;
		padding: 6px 8px;
		border-radius: 4px;
		margin-top: 6px;
		font-size: 10px;
	}

	.dim-item {
		margin-bottom: 2px;
		color: #555;
		line-height: 1.4;
	}

	.dim-item:last-child {
		margin-bottom: 0;
	}

	/* Tablet and desktop */
	@media (min-width: 768px) {
		.vsm-node {
			padding: 12px;
			min-width: 200px;
			max-width: 280px;
		}

		.position-indicator {
			width: 36px;
			height: 36px;
		}

		.emoji {
			font-size: 22px;
		}

		.node-header h3 {
			font-size: 14px;
		}

		.constraint-badge {
			font-size: 12px;
			padding: 2px 6px;
		}

		.node-timing {
			padding: 8px;
			margin-top: 8px;
		}

		.timing-item {
			font-size: 12px;
			margin-bottom: 4px;
		}

		.node-dimensions {
			padding: 8px;
			margin-top: 8px;
			font-size: 11px;
		}

		.dim-item {
			margin-bottom: 3px;
		}
	}
</style>
