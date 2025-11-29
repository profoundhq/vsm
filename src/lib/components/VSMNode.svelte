<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import type { VSMActivity } from '$lib/types/vsm';

	export let data: VSMActivity;

	$: hasTimingData = data.processTime !== undefined || data.leadTime !== undefined;
	$: hasDimensionsData = data.dimensions && Object.keys(data.dimensions).length > 0;
</script>

<div class="vsm-node" class:constraint={data.isConstraint}>
	<Handle type="target" position={Position.Left} />

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
	.vsm-node {
		background: white;
		border: 2px solid var(--color-border);
		border-radius: 8px;
		padding: 12px;
		min-width: 200px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: all 0.2s;
	}

	.vsm-node:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.vsm-node.constraint {
		border-color: var(--color-constraint);
		background: #fff5f5;
	}

	.node-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.node-header h3 {
		font-size: 14px;
		font-weight: 600;
		margin: 0;
	}

	.constraint-badge {
		font-size: 12px;
		padding: 2px 6px;
		background: var(--color-constraint);
		color: white;
		border-radius: 4px;
	}

	.node-timing {
		background: #f8f9fa;
		padding: 8px;
		border-radius: 4px;
		margin-top: 8px;
	}

	.timing-item {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		margin-bottom: 4px;
	}

	.timing-item:last-child {
		margin-bottom: 0;
	}

	.label {
		color: #666;
	}

	.value {
		font-weight: 600;
		color: var(--color-primary);
	}

	.node-dimensions {
		background: #f0f7ff;
		padding: 8px;
		border-radius: 4px;
		margin-top: 8px;
		font-size: 11px;
	}

	.dim-item {
		margin-bottom: 3px;
		color: #555;
	}

	.dim-item:last-child {
		margin-bottom: 0;
	}
</style>
