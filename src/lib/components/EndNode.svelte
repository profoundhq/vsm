<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
</script>

<div class="end-node">
	<Handle type="target" position={Position.Left} />
	<div class="icon-circle">
		<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<circle cx="12" cy="12" r="10" />
			<path d="M8 14s1.5 2 4 2 4-2 4-2" />
			<line x1="9" y1="9" x2="9.01" y2="9" />
			<line x1="15" y1="9" x2="15.01" y2="9" />
		</svg>
	</div>
	<div class="label">END</div>
</div>

<style>
	.end-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}

	.icon-circle {
		background: var(--color-british-green);
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
		width: 48px;
		height: 48px;
		color: white;
	}

	.label {
		font-size: 11px;
		font-weight: 700;
		color: white;
		background: var(--color-british-green);
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
			width: 56px;
			height: 56px;
		}

		.label {
			font-size: 13px;
			padding: 8px 16px;
			letter-spacing: 1.5px;
		}
	}
</style>
