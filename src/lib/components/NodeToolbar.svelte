<script lang="ts">
	import { vsmStore } from '$lib/stores/vsmStore';

	let activityName = '';
	let showAddForm = false;
	let streamName = '';
	let showAddStreamForm = false;

	function addActivity() {
		if (!activityName.trim()) return;

		// Ensure stream exists
		if (!$vsmStore.stream) {
			vsmStore.setStream({
				id: Date.now().toString(),
				name: 'Value Stream',
				activities: []
			});
		}

		vsmStore.addActivity({
			id: Date.now().toString(),
			name: activityName.trim()
		});

		activityName = '';
		showAddForm = false;
	}

	function addStream() {
		if (!streamName.trim()) return;

		vsmStore.createNewStream(streamName.trim());
		streamName = '';
		showAddStreamForm = false;
	}

	function handleActivityKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			addActivity();
		} else if (event.key === 'Escape') {
			showAddForm = false;
			activityName = '';
		}
	}

	function handleStreamKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			addStream();
		} else if (event.key === 'Escape') {
			showAddStreamForm = false;
			streamName = '';
		}
	}
</script>

<div class="toolbar">
	<div class="toolbar-content">
		<div class="button-group">
			{#if showAddStreamForm}
				<div class="add-form">
					<input
						type="text"
						bind:value={streamName}
						on:keydown={handleStreamKeydown}
						placeholder="Stream name..."
						class="activity-input"
						autofocus
					/>
					<button on:click={addStream} class="btn btn-primary">Add</button>
					<button on:click={() => { showAddStreamForm = false; streamName = ''; }} class="btn btn-secondary">
						Cancel
					</button>
				</div>
			{:else if showAddForm}
				<div class="add-form">
					<input
						type="text"
						bind:value={activityName}
						on:keydown={handleActivityKeydown}
						placeholder="Activity name..."
						class="activity-input"
						autofocus
					/>
					<button on:click={addActivity} class="btn btn-primary">Add</button>
					<button on:click={() => { showAddForm = false; activityName = ''; }} class="btn btn-secondary">
						Cancel
					</button>
				</div>
			{:else}
				<button on:click={() => showAddStreamForm = true} class="btn btn-add-stream">
					+ Add Stream
				</button>
				<button on:click={() => showAddForm = true} class="btn btn-add">
					+ Add Activity
				</button>
			{/if}
		</div>

		<div class="toolbar-info">
			{#if $vsmStore.stream}
				<span class="activity-count">
					{$vsmStore.stream.activities.length} {$vsmStore.stream.activities.length === 1 ? 'activity' : 'activities'}
				</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.toolbar {
		background: var(--color-british-grey);
		border-bottom: none;
		padding: 12px 16px;
		position: relative;
		z-index: 10;
	}

	.toolbar-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.button-group {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1;
	}

	.add-form {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1;
	}

	.activity-input {
		flex: 1;
		padding: 10px 14px;
		border: 2px solid var(--color-british-blue);
		border-radius: 0;
		font-size: 14px;
		font-family: 'IBM Plex Sans', sans-serif;
		max-width: 350px;
		background: white;
	}

	.activity-input:focus {
		outline: none;
		border-color: var(--color-british-blue);
		box-shadow: 0 0 0 3px rgba(0, 61, 122, 0.1);
	}

	.btn {
		padding: 10px 20px;
		border: none;
		border-radius: 0;
		cursor: pointer;
		font-weight: 600;
		font-size: 13px;
		letter-spacing: 0.5px;
		text-transform: uppercase;
		transition: all 0.2s;
		white-space: nowrap;
		font-family: 'IBM Plex Sans', sans-serif;
	}

	.btn-add-stream {
		background: var(--color-british-blue);
		color: white;
	}

	.btn-add-stream:hover {
		background: #0052A3;
	}

	.btn-add {
		background: var(--color-british-blue);
		color: white;
	}

	.btn-add:hover {
		background: #0052A3;
	}

	.btn-primary {
		background: var(--color-british-blue);
		color: white;
	}

	.btn-primary:hover {
		background: #0052A3;
	}

	.btn-secondary {
		background: transparent;
		color: white;
		border: 2px solid rgba(255, 255, 255, 0.5);
	}

	.btn-secondary:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.8);
	}

	.toolbar-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.activity-count {
		font-size: 12px;
		color: white;
		font-weight: 600;
		letter-spacing: 0.5px;
		text-transform: uppercase;
	}

	/* Mobile optimization */
	@media (max-width: 480px) {
		.toolbar {
			padding: 10px 12px;
		}

		.btn {
			padding: 8px 14px;
			font-size: 11px;
			letter-spacing: 0.3px;
		}

		.activity-input {
			font-size: 14px;
			padding: 8px 12px;
		}

		.activity-count {
			font-size: 11px;
		}
	}

	/* Desktop styles */
	@media (min-width: 768px) {
		.toolbar {
			padding: 16px 24px;
		}

		.btn {
			padding: 12px 24px;
			font-size: 14px;
			letter-spacing: 0.75px;
		}

		.activity-input {
			font-size: 16px;
			padding: 12px 16px;
		}

		.activity-count {
			font-size: 13px;
		}
	}
</style>
