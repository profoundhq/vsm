<script lang="ts">
	export let showChat: boolean;
	export let onToggleChat: () => void;
	export let onReset: () => void;

	let showMenu = false;

	function toggleMenu() {
		showMenu = !showMenu;
	}

	function closeMenu() {
		showMenu = false;
	}

	function handleToggleChat() {
		onToggleChat();
		closeMenu();
	}

	function handleReset() {
		onReset();
		closeMenu();
	}
</script>

<svelte:window on:click={closeMenu} />

<div class="menu-container">
	<button class="hamburger-button" on:click|stopPropagation={toggleMenu} aria-label="Menu">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<line x1="3" y1="6" x2="21" y2="6" />
			<line x1="3" y1="12" x2="21" y2="12" />
			<line x1="3" y1="18" x2="21" y2="18" />
		</svg>
		Menu
	</button>

	{#if showMenu}
		<div class="dropdown-menu" on:click|stopPropagation>
			<div class="menu-section">
				<button class="menu-action-item" on:click={handleToggleChat}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
					</svg>
					{showChat ? 'Hide' : 'Show'} Chat
				</button>
				<button class="menu-action-item danger" on:click={handleReset}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="1 4 1 10 7 10" />
						<polyline points="23 20 23 14 17 14" />
						<path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
					</svg>
					Reset VSM
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.menu-container {
		position: relative;
	}

	.hamburger-button {
		background: rgba(255, 255, 255, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: white;
		border-radius: 6px;
		padding: 6px 10px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 6px;
		font-weight: 600;
		font-size: 11px;
		transition: background 0.2s;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.hamburger-button:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
		min-width: 240px;
		z-index: 1000;
		overflow: hidden;
	}

	.menu-section {
		padding: 4px;
	}

	.menu-action-item {
		width: 100%;
		padding: 10px 12px;
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 10px;
		color: #374151;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 4px;
		transition: background 0.2s;
	}

	.menu-action-item:hover {
		background: #f3f4f6;
	}

	.menu-action-item.danger {
		color: #dc2626;
	}

	.menu-action-item.danger:hover {
		background: #fee2e2;
	}

	/* Responsive */
	@media (min-width: 640px) {
		.hamburger-button {
			padding: 6px 12px;
			font-size: 12px;
		}
	}

	@media (min-width: 1024px) {
		.hamburger-button {
			padding: 8px 16px;
			font-size: 14px;
		}
	}
</style>
