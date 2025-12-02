<script lang="ts">
	import { writable } from 'svelte/store';
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
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
		</SvelteFlow>

		{#if !$vsmStore.stream}
			<div class="empty-state">
				<h2>Which stream would you like to map?</h2>
				{#if $vsmStore.streams.length === 0}
					<p>Click "+ Add Stream" in the toolbar above to get started</p>
				{:else}
					<p>Select a stream from the dropdown above or create a new one</p>
				{/if}
			</div>
		{:else if $vsmStore.stream.activities.length === 0}
			<div class="empty-state">
				<h2>Add activities between START and END</h2>
				<p>Click "+ Add Activity" to map your process from end to start 🔙</p>
			</div>
		{/if}
	</div>

	<VSMTimeline />
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
		background: #fafafa;
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
		background: #fafafa;
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

	/* Tablet and desktop */
	@media (min-width: 768px) {
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
