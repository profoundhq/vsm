<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
</script>

<div class="start-node">
	<div class="icon-circle">
		<span class="icon">💡</span>
	</div>
	<div class="label">START</div>
	<Handle type="source" position={Position.Right} />
</div>

<style>
	.start-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}

	.icon-circle {
		background: white;
		border: 4px solid var(--color-british-blue);
		border-radius: 0;
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 8px rgba(0, 61, 122, 0.3);
	}

	.icon {
		font-size: 48px;
	}

	.label {
		font-size: 11px;
		font-weight: 700;
		color: white;
		background: var(--color-british-blue);
		padding: 6px 12px;
		letter-spacing: 1px;
		font-family: 'IBM Plex Sans', sans-serif;
		text-transform: uppercase;
	}

	@media (min-width: 768px) {
		.icon-circle {
			width: 96px;
			height: 96px;
			border-width: 5px;
		}

		.icon {
			font-size: 56px;
		}

		.label {
			font-size: 13px;
			padding: 8px 16px;
			letter-spacing: 1.5px;
		}
	}
</style>
