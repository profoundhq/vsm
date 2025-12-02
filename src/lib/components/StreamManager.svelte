<script lang="ts">
	import { vsmStore } from '$lib/stores/vsmStore';

	let showMenu = false;
	let newStreamName = '';
	let showNewStreamForm = false;
	let buttonElement: HTMLButtonElement;
	let menuPosition = { top: 0, left: 0 };

	$: streams = $vsmStore.streams;
	$: currentStreamId = $vsmStore.currentStreamId;
	$: currentStream = $vsmStore.stream;

	function toggleMenu() {
		showMenu = !showMenu;
		if (showMenu && buttonElement) {
			const rect = buttonElement.getBoundingClientRect();
			menuPosition = {
				top: rect.bottom + 8,
				left: rect.left
			};
		}
	}

	function closeMenu() {
		showMenu = false;
		showNewStreamForm = false;
		newStreamName = '';
	}

	function switchStream(streamId: string) {
		vsmStore.switchStream(streamId);
		closeMenu();
	}

	function showNewForm() {
		showNewStreamForm = true;
	}

	function createStream() {
		if (newStreamName.trim()) {
			vsmStore.createNewStream(newStreamName.trim());
			closeMenu();
		}
	}

	function deleteStream(streamId: string, event: Event) {
		event.stopPropagation();
		if (confirm('Are you sure you want to delete this stream?')) {
			vsmStore.deleteStream(streamId);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			createStream();
		} else if (event.key === 'Escape') {
			closeMenu();
		}
	}
</script>

<svelte:window on:click={closeMenu} />

<div class="stream-manager">
	<button
		bind:this={buttonElement}
		class="stream-button"
		on:click|stopPropagation={toggleMenu}
		aria-label="Stream selector"
	>
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M3 3h7v7H3z" />
			<path d="M14 3h7v7h-7z" />
			<path d="M14 14h7v7h-7z" />
			<path d="M3 14h7v7H3z" />
		</svg>
		<span class="stream-name">{currentStream?.name || 'Select Stream'}</span>
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron">
			<polyline points="6 9 12 15 18 9" />
		</svg>
	</button>
</div>

{#if showMenu}
	<div
		class="menu"
		on:click|stopPropagation
		style="top: {menuPosition.top}px; left: {menuPosition.left}px;"
	>
			{#if !showNewStreamForm}
				<div class="menu-section">
					<div class="section-header">Streams ({streams.length})</div>
					{#each streams as stream}
						<button
							class="stream-item"
							class:active={stream.id === currentStreamId}
							on:click={() => switchStream(stream.id)}
						>
							<span class="stream-info">
								<span class="stream-item-name">{stream.name}</span>
								<span class="stream-count">{stream.activities.length} activities</span>
							</span>
							{#if streams.length > 1}
								<button
									class="delete-btn"
									on:click={(e) => deleteStream(stream.id, e)}
									aria-label="Delete stream"
								>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
									</svg>
								</button>
							{/if}
						</button>
					{/each}
				</div>
				<div class="menu-divider"></div>
				<button class="new-stream-btn" on:click={showNewForm}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="12" y1="5" x2="12" y2="19" />
						<line x1="5" y1="12" x2="19" y2="12" />
					</svg>
					New Stream
				</button>
			{:else}
				<div class="new-stream-form">
					<input
						type="text"
						bind:value={newStreamName}
						on:keydown={handleKeydown}
						placeholder="Stream name..."
						autofocus
					/>
					<div class="form-actions">
						<button class="btn-cancel" on:click={closeMenu}>Cancel</button>
						<button class="btn-create" on:click={createStream}>Create</button>
					</div>
				</div>
			{/if}
	</div>
{/if}

<style>
	.stream-manager {
		position: relative;
	}

	.stream-button {
		background: rgba(255, 255, 255, 0.15);
		border: none;
		border-radius: 0;
		padding: 8px 14px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.5px;
		color: white;
		font-family: 'IBM Plex Sans', sans-serif;
		transition: all 0.2s;
		min-width: 160px;
	}

	.stream-button:hover {
		background: rgba(255, 255, 255, 0.25);
	}

	.stream-name {
		flex: 1;
		text-align: left;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.chevron {
		flex-shrink: 0;
	}

	.menu {
		position: fixed;
		background: white;
		border: 3px solid var(--color-british-blue);
		border-radius: 0;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		min-width: 280px;
		max-width: 320px;
		max-height: 400px;
		overflow-y: auto;
		z-index: 9999;
	}

	.menu-section {
		padding: 8px 0;
	}

	.section-header {
		padding: 12px 16px;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		color: white;
		letter-spacing: 0.5px;
		background: var(--color-british-blue);
		font-family: 'IBM Plex Sans', sans-serif;
	}

	.stream-item {
		width: 100%;
		padding: 12px 16px;
		border: none;
		background: white;
		text-align: left;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		transition: background 0.15s;
		border-bottom: 1px solid #E0E0E0;
		font-family: 'IBM Plex Sans', sans-serif;
	}

	.stream-item:hover {
		background: var(--color-british-cream);
	}

	.stream-item.active {
		background: var(--color-british-blue);
		color: white;
	}

	.stream-item.active .stream-count {
		color: rgba(255, 255, 255, 0.8);
	}

	.stream-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
		min-width: 0;
	}

	.stream-item-name {
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.stream-count {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.delete-btn {
		padding: 4px;
		border: none;
		background: transparent;
		color: var(--color-british-red);
		cursor: pointer;
		border-radius: 0;
		display: flex;
		align-items: center;
		opacity: 0.6;
		transition: all 0.15s;
	}

	.delete-btn:hover {
		opacity: 1;
		background: rgba(230, 0, 0, 0.1);
	}

	.menu-divider {
		height: 2px;
		background: var(--color-british-blue);
		margin: 0;
	}

	.new-stream-btn {
		width: 100%;
		padding: 12px 16px;
		border: none;
		background: var(--color-british-grey);
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.5px;
		text-transform: uppercase;
		font-family: 'IBM Plex Sans', sans-serif;
		transition: background 0.15s;
	}

	.new-stream-btn:hover {
		background: #555;
	}

	.new-stream-form {
		padding: 16px;
		background: var(--color-british-cream);
	}

	.new-stream-form input {
		width: 100%;
		padding: 10px 14px;
		border: 2px solid var(--color-british-blue);
		border-radius: 0;
		font-size: 1rem;
		font-family: 'IBM Plex Sans', sans-serif;
		margin-bottom: 12px;
		background: white;
	}

	.new-stream-form input:focus {
		outline: none;
		border-color: var(--color-british-blue);
		box-shadow: 0 0 0 3px rgba(0, 61, 122, 0.1);
	}

	.form-actions {
		display: flex;
		gap: 8px;
		justify-content: flex-end;
	}

	.form-actions button {
		padding: 8px 16px;
		border: none;
		border-radius: 0;
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.5px;
		text-transform: uppercase;
		font-family: 'IBM Plex Sans', sans-serif;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-cancel {
		background: white;
		color: var(--color-british-grey);
		border: 2px solid var(--color-british-grey);
	}

	.btn-cancel:hover {
		background: var(--color-british-grey);
		color: white;
	}

	.btn-create {
		background: var(--color-british-blue);
		color: white;
	}

	.btn-create:hover {
		background: #0052A3;
	}

	@media (max-width: 768px) {
		.stream-button {
			min-width: 120px;
			padding: 6px 10px;
		}

		.stream-name {
			font-size: 0.8125rem;
		}

		.menu {
			min-width: 240px;
		}
	}
</style>
