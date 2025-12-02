<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import type { VSMActivity } from '$lib/types/vsm';
	import { vsmStore } from '$lib/stores/vsmStore';
	import { uiStore } from '$lib/stores/uiStore';

	export let data: VSMActivity;

	$: hasTimingData = data.processTime !== undefined || data.leadTime !== undefined;
	$: hasDimensionsData = data.dimensions && Object.keys(data.dimensions).length > 0;
	$: hasKaizenBursts = data.kaizenBursts && data.kaizenBursts.length > 0;
	$: editModeEnabled = $uiStore.editModeEnabled;

	function handleMoveLeft(e: MouseEvent) {
		e.stopPropagation();
		vsmStore.moveActivityLeft(data.id);
	}

	function handleMoveRight(e: MouseEvent) {
		e.stopPropagation();
		vsmStore.moveActivityRight(data.id);
	}

	function handleInsertAfter(e: MouseEvent) {
		e.stopPropagation();
		uiStore.requestInsertAfter(data.id);
	}
</script>

<div class="vsm-node" class:constraint={data.isConstraint}>
	<Handle type="target" position={Position.Left} />

	<div class="node-header">
		<h3>{data.name}</h3>
		{#if data.isConstraint}
			<span class="constraint-badge">⚠️ Constraint</span>
		{/if}
	</div>

	{#if data.swimlane}
		<div class="swimlane-badge">{data.swimlane}</div>
	{/if}

	{#if hasTimingData}
		<div class="node-timing">
			{#if data.processTime !== undefined}
				<div class="timing-item">
					<span class="label">Process Time:</span>
					<span class="value">{data.processTime}{data.processTimeUnit || 'mins'}</span>
				</div>
			{/if}
			{#if data.leadTime !== undefined}
				<div class="timing-item">
					<span class="label">Lead Time:</span>
					<span class="value">{data.leadTime}{data.leadTimeUnit || 'hours'}</span>
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
				<div class="dim-item">Changeover: {data.dimensions.changeoverTime}{data.dimensions.changeoverTimeUnit || 'mins'}</div>
			{/if}
		</div>
	{/if}

	{#if hasKaizenBursts}
		<div class="kaizen-bursts">
			{#each data.kaizenBursts || [] as burst}
				<div class="kaizen-burst" class:high={burst.priority === 'high'} class:medium={burst.priority === 'medium'}>
					<span class="burst-icon"></span>
					<span class="burst-text">{burst.description}</span>
				</div>
			{/each}
		</div>
	{/if}

	{#if editModeEnabled}
		<div class="node-controls">
			<button class="control-btn" on:click={handleMoveLeft} title="Move left">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
			</button>
			<button class="control-btn insert-btn" on:click={handleInsertAfter} title="Insert activity after">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="12" y1="5" x2="12" y2="19"></line>
					<line x1="5" y1="12" x2="19" y2="12"></line>
				</svg>
			</button>
			<button class="control-btn" on:click={handleMoveRight} title="Move right">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</button>
		</div>
	{/if}

	<Handle type="source" position={Position.Right} />
</div>

<style>
	/* Mobile-first node design */
	.vsm-node {
		background: transparent;
		border: none;
		border-radius: 0;
		padding: 0;
		min-width: 200px;
		max-width: 260px;
		box-shadow: none;
		transition: all 0.2s;
		touch-action: none;
		position: relative;
	}

	.vsm-node:hover,
	.vsm-node:active {
		transform: translateY(-2px);
	}

	.vsm-node.constraint {
		animation: pulse-constraint 2s infinite;
	}

	@keyframes pulse-constraint {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.9;
		}
	}

	.node-header {
		background: var(--color-british-blue);
		color: white;
		padding: 12px 16px;
		border-left: 6px solid var(--color-british-gold);
		margin-bottom: 2px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.node-header h3 {
		font-size: 14px;
		font-weight: 700;
		margin: 0;
		line-height: 1.2;
		letter-spacing: 1px;
		text-transform: uppercase;
	}

	.constraint-badge {
		font-size: 10px;
		padding: 3px 6px;
		background: var(--color-british-red);
		color: white;
		border-radius: 0;
		white-space: nowrap;
		letter-spacing: 0.5px;
	}

	.node-timing {
		background: white;
		border: 2px solid var(--color-british-blue);
		padding: 16px;
	}

	.timing-item {
		display: flex;
		justify-content: space-between;
		font-size: 11px;
		margin-bottom: 8px;
		padding-bottom: 8px;
		border-bottom: 1px solid #E0E0E0;
		gap: 8px;
	}

	.timing-item:last-child {
		margin-bottom: 0;
		padding-bottom: 0;
		border-bottom: none;
	}

	.label {
		color: var(--color-british-grey);
		font-weight: 600;
		letter-spacing: 0.5px;
		text-transform: uppercase;
		font-size: 10px;
		flex-shrink: 0;
	}

	.value {
		font-weight: 700;
		color: var(--color-british-blue);
		font-size: 14px;
	}

	.node-dimensions {
		background: white;
		border: 2px solid var(--color-british-blue);
		border-top: none;
		padding: 12px 16px;
		font-size: 10px;
	}

	.dim-item {
		margin-bottom: 6px;
		color: var(--color-british-grey);
		line-height: 1.4;
		font-weight: 600;
		letter-spacing: 0.3px;
	}

	.dim-item:last-child {
		margin-bottom: 0;
	}

	.swimlane-badge {
		background: var(--color-british-grey);
		color: white;
		font-size: 11px;
		padding: 8px 12px;
		border-radius: 0;
		font-weight: 600;
		text-align: center;
		letter-spacing: 0.5px;
		text-transform: uppercase;
	}

	.kaizen-bursts {
		background: white;
		border: 2px solid var(--color-british-blue);
		border-top: none;
		padding: 12px 16px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.kaizen-burst {
		background: transparent;
		border: none;
		border-radius: 0;
		padding: 0;
		font-size: 11px;
		display: flex;
		align-items: center;
		gap: 8px;
		color: #333;
	}

	.kaizen-burst.high .burst-icon,
	.kaizen-burst.medium .burst-icon {
		font-size: 10px;
	}

	.burst-icon {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--color-british-gold);
		flex-shrink: 0;
	}

	.kaizen-burst.high .burst-icon {
		background: var(--color-british-red);
	}

	.kaizen-burst.medium .burst-icon {
		background: var(--color-british-gold);
	}

	.burst-text {
		flex: 1;
		line-height: 1.3;
		font-size: 10px;
	}

	.node-controls {
		display: flex;
		gap: 0;
		background: white;
		border: 2px solid var(--color-british-blue);
		border-top: none;
		justify-content: stretch;
	}

	.control-btn {
		background: var(--color-british-grey);
		border: none;
		border-radius: 0;
		padding: 8px 10px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		color: white;
		flex: 1;
		border-right: 1px solid rgba(255, 255, 255, 0.2);
	}

	.control-btn:last-child {
		border-right: none;
	}

	.control-btn:hover {
		background: #555;
	}

	.control-btn:active {
		transform: scale(0.98);
	}

	.control-btn.insert-btn {
		background: var(--color-british-blue);
	}

	.control-btn.insert-btn:hover {
		background: #0052A3;
	}

	/* Tablet and desktop */
	@media (min-width: 768px) {
		.vsm-node {
			min-width: 240px;
			max-width: 300px;
		}

		.node-header {
			padding: 14px 18px;
		}

		.node-header h3 {
			font-size: 16px;
			letter-spacing: 1.2px;
		}

		.constraint-badge {
			font-size: 11px;
			padding: 3px 8px;
		}

		.node-timing {
			padding: 18px;
		}

		.timing-item {
			font-size: 12px;
			margin-bottom: 10px;
			padding-bottom: 10px;
		}

		.label {
			font-size: 11px;
		}

		.value {
			font-size: 16px;
		}

		.node-dimensions {
			padding: 14px 18px;
			font-size: 11px;
		}

		.dim-item {
			margin-bottom: 8px;
		}

		.swimlane-badge {
			font-size: 12px;
			padding: 10px 14px;
		}

		.kaizen-bursts {
			padding: 14px 18px;
		}

		.kaizen-burst {
			font-size: 12px;
		}

		.burst-icon {
			width: 12px;
			height: 12px;
		}

		.burst-text {
			font-size: 11px;
		}

		.control-btn {
			padding: 10px 12px;
		}
	}
</style>
