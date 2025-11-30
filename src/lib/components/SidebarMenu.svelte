<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import BulkUpdate from './BulkUpdate.svelte';
	import ExportImport from './ExportImport.svelte';
	import DiagramExport from './DiagramExport.svelte';

	export let isOpen = false;
	export let showChat: boolean;
	export let onToggleChat: () => void;
	export let onReset: () => void;
	export let onClose: () => void;

	const dispatch = createEventDispatcher();

	function handleToggleChat() {
		onToggleChat();
	}

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
			<h3 class="section-title">View</h3>
			<button class="menu-item" on:click={handleToggleChat}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
				</svg>
				<span>{showChat ? 'Hide' : 'Show'} Chat</span>
			</button>
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
		background: white;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
		transition: right 0.3s ease-out;
	}

	.sidebar.open {
		right: 0;
	}

	.sidebar-header {
		padding: 20px;
		border-bottom: 1px solid #e5e7eb;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-shrink: 0;
	}

	.sidebar-header h2 {
		margin: 0;
		font-size: 1.25rem;
		color: #111827;
		font-weight: 700;
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		color: #6b7280;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: #f3f4f6;
		color: #111827;
	}

	.sidebar-content {
		flex: 1;
		overflow-y: auto;
		padding: 16px 0;
	}

	.menu-section {
		padding: 12px 20px;
		border-bottom: 1px solid #e5e7eb;
	}

	.menu-section:last-child {
		border-bottom: none;
	}

	.section-title {
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
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
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 12px;
		color: #374151;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s;
		text-align: left;
	}

	.menu-item:hover {
		background: #f9fafb;
		border-color: #d1d5db;
	}

	.menu-item.danger {
		color: #dc2626;
		border-color: #fecaca;
		background: #fef2f2;
	}

	.menu-item.danger:hover {
		background: #fee2e2;
		border-color: #fca5a5;
	}

	/* Mobile adjustments */
	@media (max-width: 640px) {
		.sidebar {
			width: 100%;
			right: -100%;
		}
	}
</style>
