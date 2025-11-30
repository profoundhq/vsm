<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
</script>

<div class="start-node">
	<div class="emoji">💡</div>
	<div class="label">START</div>
	<Handle type="source" position={Position.Right} />
</div>

<style>
	.start-node {
		background: linear-gradient(135deg, #fbbf24, #f59e0b);
		border: 3px solid #d97706;
		border-radius: 12px;
		padding: 20px;
		min-width: 120px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
	}

	.emoji {
		font-size: 48px;
		line-height: 1;
	}

	.label {
		font-size: 14px;
		font-weight: 700;
		color: #78350f;
		letter-spacing: 0.05em;
	}

	@media (min-width: 768px) {
		.start-node {
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
