<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
</script>

<div class="end-node">
	<Handle type="target" position={Position.Left} />
	<div class="emoji">😀</div>
	<div class="label">END</div>
</div>

<style>
	.end-node {
		background: linear-gradient(135deg, #22c55e, #16a34a);
		border: 3px solid #15803d;
		border-radius: 12px;
		padding: 20px;
		min-width: 120px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
	}

	.emoji {
		font-size: 48px;
		line-height: 1;
	}

	.label {
		font-size: 14px;
		font-weight: 700;
		color: #14532d;
		letter-spacing: 0.05em;
	}

	@media (min-width: 768px) {
		.end-node {
			min-width: 140px;
			padding: 24px;
		}

		.emoji {
			font-size: 56px;
		}

		.label {
			font-size: 16px;
		}
	}
</style>
