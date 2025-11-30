<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
</script>

<div class="start-node">
	<div class="emoji-circle">
		<div class="emoji">💡</div>
	</div>
	<div class="label">START</div>
	<Handle type="source" position={Position.Right} />
</div>

<style>
	.start-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.emoji-circle {
		background: #dbeafe;
		border: 3px solid #3b82f6;
		border-radius: 50%;
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}

	.emoji {
		font-size: 48px;
		line-height: 1;
	}

	.label {
		font-size: 12px;
		font-weight: 700;
		color: #1e40af;
		letter-spacing: 0.05em;
	}

	@media (min-width: 768px) {
		.emoji-circle {
			width: 96px;
			height: 96px;
		}

		.emoji {
			font-size: 56px;
		}

		.label {
			font-size: 14px;
		}
	}
</style>
