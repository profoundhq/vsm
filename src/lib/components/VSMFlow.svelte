<script lang="ts">
	import { writable } from 'svelte/store';
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		Panel,
		type Node,
		type Edge
	} from '@xyflow/svelte';
	import { vsmStore } from '$lib/stores/vsmStore';
	import { uiStore } from '$lib/stores/uiStore';
	import VSMNode from './VSMNode.svelte';
	import StartNode from './StartNode.svelte';
	import EndNode from './EndNode.svelte';
	import ActivityEditModal from './ActivityEditModal.svelte';
	import VSMTimeline from './VSMTimeline.svelte';
	import type { VSMActivity } from '$lib/types/vsm';
	import '@xyflow/svelte/dist/style.css';

	const nodeTypes = {
		vsmActivity: VSMNode,
		startNode: StartNode,
		endNode: EndNode
	};

	let nodes = writable<Node[]>([]);
	let edges = writable<Edge[]>([]);
	let editingActivity: VSMActivity | null = null;
	let insertingAfterActivityId: string | null = null;
	let newStreamName = '';

	function handleCreateStream() {
		if (newStreamName.trim()) {
			vsmStore.createNewStream(newStreamName.trim());
			newStreamName = '';
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleCreateStream();
		}
	}

	// Handle insert requests from nodes
	$: if ($uiStore.insertingAfterActivityId) {
		insertingAfterActivityId = $uiStore.insertingAfterActivityId;
		editingActivity = {
			id: Date.now().toString(),
			name: ''
		};
		uiStore.clearInsertRequest();
	}

	// Subscribe to VSM store and update flow nodes
	$: {
		if ($vsmStore.stream) {
			updateFlowFromActivities($vsmStore.stream.activities);
		} else {
			// Show empty flow with just start and end
			updateFlowFromActivities([]);
		}
	}

	function updateFlowFromActivities(activities: any[]) {
		const spacing = 300;
		const startX = 100;
		const startY = 200;

		// Reverse activities array for visual display (start to end, left to right)
		// Activities are stored in reverse order [end, ..., start]
		const visualOrder = [...activities].reverse();

		// Always create START node (leftmost)
		const newNodes: Node[] = [
			{
				id: 'start-node',
				type: 'startNode',
				position: { x: startX, y: startY },
				data: {},
				draggable: false
			}
		];

		// Add activity nodes in the middle
		visualOrder.forEach((activity, index) => {
			newNodes.push({
				id: activity.id,
				type: 'vsmActivity',
				position: { x: startX + (index + 1) * spacing, y: startY },
				data: activity
			});
		});

		// Always create END node (rightmost)
		newNodes.push({
			id: 'end-node',
			type: 'endNode',
			position: { x: startX + (visualOrder.length + 1) * spacing, y: startY },
			data: {},
			draggable: false
		});

		// Create edges: START → activities → END
		const newEdges: Edge[] = [];

		// Connect START to first activity or END
		if (visualOrder.length > 0) {
			newEdges.push({
				id: 'e-start-first',
				source: 'start-node',
				target: visualOrder[0].id,
				animated: true,
				style: 'stroke: #4a90e2; stroke-width: 2;'
			});

			// Connect activities to each other
			for (let i = 0; i < visualOrder.length - 1; i++) {
				newEdges.push({
					id: `e${visualOrder[i].id}-${visualOrder[i + 1].id}`,
					source: visualOrder[i].id,
					target: visualOrder[i + 1].id,
					animated: true,
					style: 'stroke: #4a90e2; stroke-width: 2;'
				});
			}

			// Connect last activity to END
			newEdges.push({
				id: 'e-last-end',
				source: visualOrder[visualOrder.length - 1].id,
				target: 'end-node',
				animated: true,
				style: 'stroke: #4a90e2; stroke-width: 2;'
			});
		} else {
			// No activities, connect START directly to END with dashed line
			newEdges.push({
				id: 'e-start-end',
				source: 'start-node',
				target: 'end-node',
				animated: true,
				style: 'stroke: #cbd5e1; stroke-width: 2; stroke-dasharray: 5;'
			});
		}

		nodes.set(newNodes);
		edges.set(newEdges);
	}

	function handleNodeClick(event: CustomEvent) {
		const { node } = event.detail;
		// Only allow editing activity nodes, not start/end nodes
		if (node.type === 'vsmActivity') {
			editingActivity = node.data;
			insertingAfterActivityId = null;
		}
	}

	function closeModal() {
		editingActivity = null;
		insertingAfterActivityId = null;
	}
</script>

<div class="flow-wrapper">
	{#if !$vsmStore.stream}
		<div class="stream-prompt">
			<div class="prompt-content">
				<h2>Which stream would you like to map?</h2>
				{#if $vsmStore.streams.length === 0}
					<p>Enter a name for your first value stream</p>
				{:else}
					<p>Create a new stream or select one from the dropdown above</p>
				{/if}
				<div class="input-group">
					<input
						type="text"
						bind:value={newStreamName}
						on:keydown={handleKeydown}
						placeholder="e.g., Customer Order Fulfillment"
						class="stream-input"
						autofocus
					/>
					<button on:click={handleCreateStream} class="create-btn">
						Create Stream
					</button>
				</div>
			</div>
		</div>
	{:else}
		<div class="flow-container">
			<SvelteFlow
				{nodes}
				{edges}
				{nodeTypes}
				fitView
				on:nodeclick={handleNodeClick}
			>
				<Controls showInteractive={false}>
					<button
						class="edit-mode-btn"
						class:active={$uiStore.editModeEnabled}
						on:click={() => uiStore.toggleEditMode()}
						title={$uiStore.editModeEnabled ? 'Disable edit mode' : 'Enable edit mode'}
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
							<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
						</svg>
					</button>
				</Controls>
				<Background variant={BackgroundVariant.Dots} />

				<Panel position="bottom">
					<VSMTimeline />
				</Panel>
			</SvelteFlow>

			{#if $vsmStore.stream.activities.length === 0}
				<div class="empty-state">
					<h2>Add activities between START and END</h2>
					<p>Click "+ Add Activity" to map your process from end to start 🔙</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if editingActivity}
	<ActivityEditModal
		activity={editingActivity}
		onClose={closeModal}
		insertingAfterActivityId={insertingAfterActivityId}
	/>
{/if}

<style>
	/* Mobile-first flow design */
	.flow-wrapper {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.flow-container {
		flex: 1;
		min-height: 0;
		position: relative;
		background: var(--color-british-cream);
	}

	.stream-prompt {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-british-cream);
		padding: 20px;
	}

	.prompt-content {
		max-width: 600px;
		width: 100%;
		text-align: center;
		background: white;
		padding: 30px 20px;
		border: 3px solid var(--color-british-blue);
		border-left: 8px solid var(--color-british-gold);
	}

	.prompt-content h2 {
		font-size: 20px;
		color: var(--color-british-blue);
		margin-bottom: 12px;
		font-weight: 700;
		letter-spacing: 1px;
		text-transform: uppercase;
	}

	.prompt-content p {
		font-size: 13px;
		color: #6B6B6B;
		margin-bottom: 24px;
		letter-spacing: 0.5px;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.stream-input {
		width: 100%;
		padding: 12px 16px;
		border: 2px solid var(--color-british-blue);
		border-radius: 0;
		font-size: 16px;
		font-family: 'IBM Plex Sans', sans-serif;
		transition: border-color 0.2s;
		background: white;
	}

	.stream-input:focus {
		outline: none;
		border-color: var(--color-british-blue);
		box-shadow: 0 0 0 3px rgba(0, 61, 122, 0.1);
	}

	.create-btn {
		padding: 14px 28px;
		background: var(--color-british-blue);
		color: white;
		border: none;
		border-radius: 0;
		font-size: 14px;
		font-weight: 600;
		letter-spacing: 1px;
		text-transform: uppercase;
		cursor: pointer;
		font-family: 'IBM Plex Sans', sans-serif;
		transition: all 0.2s;
	}

	.create-btn:hover {
		background: #0052A3;
		box-shadow: 0 4px 12px rgba(0, 61, 122, 0.3);
	}

	.create-btn:active {
		transform: translateY(1px);
	}

	.empty-state {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		color: #999;
		pointer-events: none;
		padding: 20px;
		max-width: 90%;
	}

	.empty-state h2 {
		font-size: 18px;
		margin-bottom: 8px;
	}

	.empty-state p {
		font-size: 13px;
	}

	:global(.svelte-flow) {
		background: var(--color-british-cream);
	}

	:global(.svelte-flow__node) {
		cursor: pointer;
	}

	:global(.svelte-flow__node.startNode),
	:global(.svelte-flow__node.endNode) {
		cursor: default;
	}

	:global(.svelte-flow__edge-path) {
		stroke-width: 2;
	}

	/* Hide Svelte Flow attribution */
	:global(.svelte-flow__attribution) {
		display: none !important;
	}

	/* Mobile-optimized controls */
	:global(.svelte-flow__controls) {
		bottom: 10px;
		left: 10px;
	}

	:global(.svelte-flow__controls button) {
		width: 32px;
		height: 32px;
	}

	/* Edit mode button integrated into controls */
	:global(.svelte-flow__controls) .edit-mode-btn {
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 2px;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		color: #6b7280;
		padding: 0;
		margin: 0;
	}

	:global(.svelte-flow__controls) .edit-mode-btn:hover {
		background: #f3f4f6;
		color: #374151;
	}

	:global(.svelte-flow__controls) .edit-mode-btn.active {
		background: #3b82f6;
		border-color: #3b82f6;
		color: white;
	}

	:global(.svelte-flow__controls) .edit-mode-btn.active:hover {
		background: #2563eb;
		border-color: #2563eb;
	}

	/* Timeline Panel Styling */
	:global(.svelte-flow__panel.bottom) {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		padding: 0 12px 12px 12px;
		pointer-events: none;
	}

	:global(.svelte-flow__panel.bottom > *) {
		pointer-events: auto;
		max-width: 1400px;
		width: 100%;
	}

	/* Tablet and desktop */
	@media (min-width: 768px) {
		.prompt-content {
			padding: 40px 30px;
		}

		.prompt-content h2 {
			font-size: 28px;
			letter-spacing: 1.5px;
		}

		.prompt-content p {
			font-size: 15px;
			letter-spacing: 0.75px;
		}

		.input-group {
			flex-direction: row;
		}

		.stream-input {
			flex: 1;
			font-size: 18px;
		}

		.create-btn {
			flex-shrink: 0;
			padding: 14px 32px;
			font-size: 16px;
		}
	}

	@media (min-width: 1024px) {
		.prompt-content h2 {
			font-size: 32px;
			letter-spacing: 2px;
		}

		.prompt-content p {
			font-size: 16px;
			letter-spacing: 1px;
		}

		.empty-state h2 {
			font-size: 24px;
		}

		.empty-state p {
			font-size: 14px;
		}

		:global(.svelte-flow__controls) {
			bottom: 20px;
			left: 20px;
		}

		:global(.svelte-flow__controls button) {
			width: 40px;
			height: 40px;
		}

		:global(.svelte-flow__controls) .edit-mode-btn svg {
			width: 22px;
			height: 22px;
		}
	}
</style>
