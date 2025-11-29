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
	import '@xyflow/svelte/dist/style.css';

	const nodeTypes = {
		vsmActivity: VSMNode
	};

	let nodes = writable<Node[]>([]);
	let edges = writable<Edge[]>([]);

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

		// Create nodes - activities are already in reverse order (end to start)
		const newNodes: Node[] = activities.map((activity, index) => ({
			id: activity.id,
			type: 'vsmActivity',
			position: { x: startX + index * spacing, y: startY },
			data: activity
		}));

		// Create edges connecting activities (right to left flow, end to start)
		const newEdges: Edge[] = [];
		for (let i = 0; i < activities.length - 1; i++) {
			newEdges.push({
				id: `e${activities[i].id}-${activities[i + 1].id}`,
				source: activities[i + 1].id, // Previous activity (towards start)
				target: activities[i].id, // Next activity (towards end)
				animated: true,
				style: 'stroke: #4a90e2; stroke-width: 2;'
			});
		}

		nodes.set(newNodes);
		edges.set(newEdges);
	}

	function handleNodeClick(event: CustomEvent) {
		const { node } = event.detail;
		console.log('Node clicked:', node);
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
			<p>Use the chat interface to start building your value stream map</p>
		</div>
	{/if}
</div>

<style>
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
	}

	.empty-state h2 {
		font-size: 24px;
		margin-bottom: 8px;
	}

	.empty-state p {
		font-size: 14px;
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

	:global(.svelte-flow__controls) {
		bottom: 20px;
		left: 20px;
	}

	:global(.svelte-flow__minimap) {
		bottom: 20px;
		right: 20px;
	}
</style>
