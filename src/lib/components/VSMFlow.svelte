<script lang="ts">
	import { writable } from 'svelte/store';
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		MiniMap,
		type Node,
		type Edge
	} from '@xyflow/svelte';
	import { vsmStore } from '$lib/stores/vsmStore';
	import VSMNode from './VSMNode.svelte';
	import ActivityEditModal from './ActivityEditModal.svelte';
	import type { VSMActivity } from '$lib/types/vsm';
	import '@xyflow/svelte/dist/style.css';

	const nodeTypes = {
		vsmActivity: VSMNode
	};

	let nodes = writable<Node[]>([]);
	let edges = writable<Edge[]>([]);
	let editingActivity: VSMActivity | null = null;

	// Subscribe to VSM store and update flow nodes
	$: {
		if ($vsmStore.stream) {
			updateFlowFromActivities($vsmStore.stream.activities);
		}
	}

	function updateFlowFromActivities(activities: any[]) {
		const spacing = 300;
		const startX = 100;
		const startY = 200;

		// Reverse activities array for visual display (start to end, left to right)
		// Activities are stored in reverse order [end, ..., start]
		const visualOrder = [...activities].reverse();

		// Create nodes with position indicators
		const newNodes: Node[] = visualOrder.map((activity, index) => ({
			id: activity.id,
			type: 'vsmActivity',
			position: { x: startX + index * spacing, y: startY },
			data: {
				...activity,
				isStart: index === 0, // Leftmost = start (💡)
				isEnd: index === visualOrder.length - 1 // Rightmost = end (😀)
			}
		}));

		// Create edges connecting activities (left to right flow, start to end)
		const newEdges: Edge[] = [];
		for (let i = 0; i < visualOrder.length - 1; i++) {
			newEdges.push({
				id: `e${visualOrder[i].id}-${visualOrder[i + 1].id}`,
				source: visualOrder[i].id, // Current activity
				target: visualOrder[i + 1].id, // Next activity
				animated: true,
				style: 'stroke: #4a90e2; stroke-width: 2;'
			});
		}

		nodes.set(newNodes);
		edges.set(newEdges);
	}

	function handleNodeClick(event: CustomEvent) {
		const { node } = event.detail;
		editingActivity = node.data;
	}

	function closeModal() {
		editingActivity = null;
	}
</script>

<div class="flow-container">
	<SvelteFlow
		{nodes}
		{edges}
		{nodeTypes}
		fitView
		on:nodeclick={handleNodeClick}
	>
		<Controls />
		<Background variant={BackgroundVariant.Dots} />
		<MiniMap />
	</SvelteFlow>

	{#if !$vsmStore.stream || $vsmStore.stream.activities.length === 0}
		<div class="empty-state">
			<h2>No activities yet</h2>
			<p>Click "+ Add Activity" above or use the chat below to start building your value stream map</p>
		</div>
	{/if}
</div>

{#if editingActivity}
	<ActivityEditModal activity={editingActivity} onClose={closeModal} />
{/if}

<style>
	/* Mobile-first flow design */
	.flow-container {
		width: 100%;
		height: 100%;
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

	:global(.svelte-flow__edge-path) {
		stroke-width: 2;
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

	:global(.svelte-flow__minimap) {
		bottom: 10px;
		right: 10px;
		width: 100px;
		height: 70px;
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

		:global(.svelte-flow__minimap) {
			bottom: 20px;
			right: 20px;
			width: 150px;
			height: 100px;
		}
	}
</style>
