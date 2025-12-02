<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import BulkUpdate from './BulkUpdate.svelte';
	import ExportImport from './ExportImport.svelte';
	import DiagramExport from './DiagramExport.svelte';

	export let isOpen = false;
	export let onReset: () => void;
	export let onClose: () => void;

	const dispatch = createEventDispatcher();

	function handleReset() {
		onReset();
	}

	function handleBackdropClick() {
		onClose();
	}
</script>

<!-- Backdrop -->
{#if isOpen}
	<div class="backdrop" on:click={handleBackdropClick}></div>
{/if}

<!-- Sidebar -->
<aside class="sidebar" class:open={isOpen}>
	<div class="sidebar-header">
		<h2>Menu</h2>
		<button class="close-btn" on:click={onClose}>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</button>
	</div>

	<div class="sidebar-content">
		<section class="menu-section">
			<h3 class="section-title">Data Management</h3>
			<div class="menu-items">
				<BulkUpdate />
				<ExportImport />
				<DiagramExport />
			</div>
		</section>

		<section class="menu-section">
			<h3 class="section-title">Actions</h3>
			<button class="menu-item danger" on:click={handleReset}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="1 4 1 10 7 10" />
					<polyline points="23 20 23 14 17 14" />
					<path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
				</svg>
				<span>Reset VSM</span>
			</button>
		</section>
	</div>
</aside>

<style>
	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 999;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.sidebar {
		position: fixed;
		top: 0;
		right: -320px;
		width: 320px;
		height: 100vh;
		background: var(--color-british-cream);
		z-index: 1000;
		display: flex;
		flex-direction: column;
		box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
		transition: right 0.3s ease-out;
		font-family: 'IBM Plex Sans', sans-serif;
	}

	.sidebar.open {
		right: 0;
	}

	.sidebar-header {
		padding: 20px;
		background: var(--color-british-blue);
		border-bottom: 4px solid var(--color-british-gold);
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-shrink: 0;
	}

	.sidebar-header h2 {
		margin: 0;
		font-size: 1.25rem;
		color: white;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1.5px;
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px;
		border-radius: 0;
		color: var(--color-british-gold);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: rgba(255, 215, 0, 0.1);
		color: white;
	}

	.sidebar-content {
		flex: 1;
		overflow-y: auto;
		padding: 16px 0;
	}

	.menu-section {
		padding: 16px 20px;
		border-bottom: 2px solid var(--color-british-blue);
	}

	.menu-section:last-child {
		border-bottom: none;
	}

	.section-title {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-british-blue);
		text-transform: uppercase;
		letter-spacing: 1px;
		margin: 0 0 12px 0;
	}

	.menu-items {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.menu-item {
		width: 100%;
		padding: 12px 16px;
		background: white;
		border: 2px solid var(--color-british-blue);
		border-radius: 0;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 12px;
		color: var(--color-british-blue);
		font-size: 0.875rem;
		font-weight: 600;
		transition: all 0.2s;
		text-align: left;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.menu-item:hover {
		background: var(--color-british-blue);
		color: white;
	}

	.menu-item.danger {
		color: var(--color-british-red);
		border-color: var(--color-british-red);
		background: white;
	}

	.menu-item.danger:hover {
		background: var(--color-british-red);
		color: white;
	}

	/* Mobile adjustments */
	@media (max-width: 640px) {
		.sidebar {
			width: 100%;
			right: -100%;
		}
	}
</style>
