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
			// Get the entire flow container which contains both nodes and edges
			const flowContainer = document.querySelector('.svelte-flow') as HTMLElement;
			if (!flowContainer) {
				alert('Flow diagram not found');
				return;
			}

			// Get all nodes to ensure they're in view
			const nodes = document.querySelectorAll('.svelte-flow__node');
			if (nodes.length === 0) {
				alert('No activities to export. Please add some activities first.');
				return;
			}

			// Calculate the bounding box of all nodes
			const flowRect = flowContainer.getBoundingClientRect();
			let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

			nodes.forEach((node) => {
				const rect = node.getBoundingClientRect();
				// Convert to flow container coordinates
				const x = rect.left - flowRect.left;
				const y = rect.top - flowRect.top;

				minX = Math.min(minX, x);
				minY = Math.min(minY, y);
				maxX = Math.max(maxX, x + rect.width);
				maxY = Math.max(maxY, y + rect.height);
			});

			// Add padding
			const padding = 100;
			minX -= padding;
			minY -= padding;
			maxX += padding;
			maxY += padding;

			const width = maxX - minX;
			const height = maxY - minY;

			// Capture the entire flow container with high resolution
			const canvas = await html2canvas(flowContainer, {
				backgroundColor: '#FFF8DC', // British Rail cream
				scale: 2, // High resolution
				logging: false,
				x: minX,
				y: minY,
				width: width,
				height: height
			});

			const link = document.createElement('a');
			link.download = `throughline-vsm-${new Date().toISOString().split('T')[0]}.png`;
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
			// Get the entire flow container which contains both nodes and edges
			const flowContainer = document.querySelector('.svelte-flow') as HTMLElement;
			if (!flowContainer) {
				alert('Flow diagram not found');
				return;
			}

			// Get all nodes to ensure they're in view
			const nodes = document.querySelectorAll('.svelte-flow__node');
			if (nodes.length === 0) {
				alert('No activities to export. Please add some activities first.');
				return;
			}

			// Calculate the bounding box of all nodes
			const flowRect = flowContainer.getBoundingClientRect();
			let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

			nodes.forEach((node) => {
				const rect = node.getBoundingClientRect();
				// Convert to flow container coordinates
				const x = rect.left - flowRect.left;
				const y = rect.top - flowRect.top;

				minX = Math.min(minX, x);
				minY = Math.min(minY, y);
				maxX = Math.max(maxX, x + rect.width);
				maxY = Math.max(maxY, y + rect.height);
			});

			// Add padding
			const padding = 100;
			minX -= padding;
			minY -= padding;
			maxX += padding;
			maxY += padding;

			const width = maxX - minX;
			const height = maxY - minY;

			// Capture the entire flow container with high resolution
			const canvas = await html2canvas(flowContainer, {
				backgroundColor: '#FFF8DC', // British Rail cream
				scale: 2,
				logging: false,
				x: minX,
				y: minY,
				width: width,
				height: height
			});

			const imgData = canvas.toDataURL('image/png');

			// Create PDF with appropriate orientation
			const aspectRatio = canvas.width / canvas.height;
			const pdf = new jsPDF({
				orientation: aspectRatio > 1 ? 'landscape' : 'portrait',
				unit: 'mm',
				format: 'a3' // A3 for better visibility
			});

			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = pdf.internal.pageSize.getHeight();

			// Calculate scaling to fit
			let imgWidth = pdfWidth;
			let imgHeight = (canvas.height / canvas.width) * pdfWidth;

			if (imgHeight > pdfHeight) {
				imgHeight = pdfHeight;
				imgWidth = (canvas.width / canvas.height) * pdfHeight;
			}

			// Center the image
			const xOffset = (pdfWidth - imgWidth) / 2;
			const yOffset = (pdfHeight - imgHeight) / 2;

			pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
			pdf.save(`throughline-vsm-${new Date().toISOString().split('T')[0]}.pdf`);
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
		aria-label="Export diagram as image"
	>
		{#if isExporting}
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinner">
				<circle cx="12" cy="12" r="10" opacity="0.25" />
				<path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
			</svg>
		{:else}
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
				<circle cx="8.5" cy="8.5" r="1.5" />
				<polyline points="21 15 16 10 5 21" />
			</svg>
		{/if}
		<span>Diagram Image</span>
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
		width: 100%;
		background: white;
		border: 2px solid var(--color-british-blue);
		border-radius: 0;
		padding: 12px 16px;
		cursor: pointer;
		color: var(--color-british-blue);
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 0.875rem;
		font-weight: 600;
		font-family: 'IBM Plex Sans', sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		transition: all 0.2s;
	}

	.export-button:hover:not(:disabled) {
		background: var(--color-british-blue);
		color: white;
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
		border: 3px solid var(--color-british-blue);
		border-radius: 0;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		min-width: 180px;
		z-index: 100;
		overflow: hidden;
	}

	.menu-item {
		width: 100%;
		padding: 12px 16px;
		border: none;
		background: white;
		text-align: left;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.5px;
		color: #333;
		font-family: 'IBM Plex Sans', sans-serif;
		transition: background 0.15s;
		border-bottom: 1px solid #E0E0E0;
	}

	.menu-item:last-child {
		border-bottom: none;
	}

	.menu-item:hover {
		background: var(--color-british-cream);
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
