<script lang="ts">
	import html2canvas from 'html2canvas';
	import jsPDF from 'jspdf';

	let showMenu = false;
	let isExporting = false;

	function toggleMenu() {
		showMenu = !showMenu;
	}

	function closeMenu() {
		showMenu = false;
	}

	async function exportToPNG() {
		isExporting = true;
		closeMenu();

		try {
			const flowWrapper = document.querySelector('.flow-wrapper') as HTMLElement;
			if (!flowWrapper) {
				alert('Flow diagram not found');
				return;
			}

			const canvas = await html2canvas(flowWrapper, {
				backgroundColor: '#f5f5f5',
				scale: 2,
				logging: false
			});

			const link = document.createElement('a');
			link.download = `vsm-diagram-${new Date().toISOString().split('T')[0]}.png`;
			link.href = canvas.toDataURL('image/png');
			link.click();
		} catch (error) {
			console.error('Export to PNG failed:', error);
			alert('Failed to export diagram. Please try again.');
		} finally {
			isExporting = false;
		}
	}

	async function exportToPDF() {
		isExporting = true;
		closeMenu();

		try {
			const flowWrapper = document.querySelector('.flow-wrapper') as HTMLElement;
			if (!flowWrapper) {
				alert('Flow diagram not found');
				return;
			}

			const canvas = await html2canvas(flowWrapper, {
				backgroundColor: '#f5f5f5',
				scale: 2,
				logging: false
			});

			const imgData = canvas.toDataURL('image/png');
			const pdf = new jsPDF({
				orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
				unit: 'px',
				format: [canvas.width, canvas.height]
			});

			pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
			pdf.save(`vsm-diagram-${new Date().toISOString().split('T')[0]}.pdf`);
		} catch (error) {
			console.error('Export to PDF failed:', error);
			alert('Failed to export diagram. Please try again.');
		} finally {
			isExporting = false;
		}
	}
</script>

<svelte:window on:click={closeMenu} />

<div class="diagram-export">
	<button
		class="export-button"
		on:click|stopPropagation={toggleMenu}
		disabled={isExporting}
		aria-label="Export diagram"
	>
		{#if isExporting}
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinner">
				<circle cx="12" cy="12" r="10" opacity="0.25" />
				<path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
			</svg>
		{:else}
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
				<circle cx="8.5" cy="8.5" r="1.5" />
				<polyline points="21 15 16 10 5 21" />
			</svg>
		{/if}
	</button>

	{#if showMenu}
		<div class="menu" on:click|stopPropagation>
			<button on:click={exportToPNG} class="menu-item">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
					<circle cx="8.5" cy="8.5" r="1.5" />
					<polyline points="21 15 16 10 5 21" />
				</svg>
				Export as PNG
			</button>
			<button on:click={exportToPDF} class="menu-item">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
					<polyline points="14 2 14 8 20 8" />
					<line x1="16" y1="13" x2="8" y2="13" />
					<line x1="16" y1="17" x2="8" y2="17" />
					<polyline points="10 9 9 9 8 9" />
				</svg>
				Export as PDF
			</button>
		</div>
	{/if}
</div>

<style>
	.diagram-export {
		position: relative;
	}

	.export-button {
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.3);
		border-radius: 6px;
		padding: 8px 10px;
		cursor: pointer;
		color: #10b981;
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.export-button:hover:not(:disabled) {
		background: rgba(16, 185, 129, 0.2);
		border-color: rgba(16, 185, 129, 0.5);
	}

	.export-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.spinner {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.menu {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		min-width: 160px;
		z-index: 100;
		overflow: hidden;
	}

	.menu-item {
		width: 100%;
		padding: 10px 16px;
		border: none;
		background: white;
		text-align: left;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 0.875rem;
		color: #374151;
		transition: background 0.15s;
	}

	.menu-item:hover {
		background: #f3f4f6;
	}

	.menu-item svg {
		flex-shrink: 0;
	}

	@media (max-width: 768px) {
		.export-button {
			padding: 6px 8px;
		}

		.menu {
			right: auto;
			left: 50%;
			transform: translateX(-50%);
		}
	}
</style>
