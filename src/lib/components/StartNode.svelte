<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
</script>

<div class="start-node">
	<div class="emoji-container">
		<div class="emoji">💡</div>
	</div>
	<div class="label">START</div>
	<Handle type="source" position={Position.Right} />
</div>

<style>
	.start-node {
		background: white;
		border: 3px solid #fbbf24;
		border-radius: 12px;
		padding: 16px;
		min-width: 100px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
	}

	.emoji-container {
		background: #dbeafe;
		border-radius: 50%;
		width: 64px;
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
	}

	.emoji {
		font-size: 40px;
		line-height: 1;
	}

	.label {
		font-size: 13px;
		font-weight: 700;
		color: #78350f;
		letter-spacing: 0.05em;
	}

	@media (min-width: 768px) {
		.start-node {
			min-width: 120px;
			padding: 20px;
		}

		.emoji-container {
			width: 72px;
			height: 72px;
		}

		.emoji {
			font-size: 48px;
		}

		.label {
			font-size: 14px;
		}
	}
</style>
