<script lang="ts">
	import { vsmStore } from '$lib/stores/vsmStore';

	let fileInput: HTMLInputElement;
	let showMenu = false;

	function handleExport() {
		const json = vsmStore.exportToJSON();
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `vsm-export-${new Date().toISOString().split('T')[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
		showMenu = false;
	}

	function handleImport() {
		fileInput.click();
	}

	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		try {
			const text = await file.text();
			vsmStore.importFromJSON(text);
			alert('VSM data imported successfully!');
		} catch (e) {
			alert('Failed to import VSM data. Please check the file format.');
		}

		// Reset file input
		target.value = '';
		showMenu = false;
	}

	function toggleMenu() {
		showMenu = !showMenu;
	}

	function closeMenu() {
		showMenu = false;
	}
</script>

<svelte:window on:click={closeMenu} />

<div class="export-import">
	<button class="menu-button" on:click|stopPropagation={toggleMenu} aria-label="Export/Import VSM Data">
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
			<polyline points="14 2 14 8 20 8" />
			<circle cx="10" cy="12" r="2" />
			<path d="M12 12h6" />
		</svg>
		<span>VSM Data (JSON)</span>
	</button>

	{#if showMenu}
		<div class="menu" on:click|stopPropagation>
			<button on:click={handleExport} class="menu-item">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="17 8 12 3 7 8" />
					<line x1="12" y1="3" x2="12" y2="15" />
				</svg>
				Export JSON
			</button>
			<button on:click={handleImport} class="menu-item">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="7 10 12 15 17 10" />
					<line x1="12" y1="15" x2="12" y2="3" />
				</svg>
				Import JSON
			</button>
		</div>
	{/if}

	<input
		type="file"
		accept="application/json,.json"
		bind:this={fileInput}
		on:change={handleFileSelect}
		style="display: none;"
	/>
</div>

<style>
	.export-import {
		position: relative;
	}

	.menu-button {
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

	.menu-button:hover {
		background: var(--color-british-blue);
		color: white;
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
		.menu-button {
			padding: 6px 8px;
		}

		.menu {
			right: auto;
			left: 50%;
			transform: translateX(-50%);
		}
	}
</style>
