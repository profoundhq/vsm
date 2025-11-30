<script lang="ts">
	import { vsmStore } from '$lib/stores/vsmStore';

	let activityName = '';
	let showAddForm = false;

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

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			addActivity();
		} else if (event.key === 'Escape') {
			showAddForm = false;
			activityName = '';
		}
	}
</script>

<div class="toolbar">
	<div class="toolbar-content">
		{#if showAddForm}
			<div class="add-form">
				<input
					type="text"
					bind:value={activityName}
					on:keydown={handleKeydown}
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
			<button on:click={() => showAddForm = true} class="btn btn-add">
				+ Add Activity
			</button>
		{/if}

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
		background: white;
		border-bottom: 1px solid var(--color-border);
		padding: 8px 12px;
		position: relative;
		z-index: 10;
	}

	.toolbar-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.add-form {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
	}

	.activity-input {
		flex: 1;
		padding: 8px 12px;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		font-size: 14px;
		max-width: 300px;
	}

	.activity-input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.btn {
		padding: 8px 16px;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 600;
		font-size: 13px;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.btn-add {
		background: var(--color-primary);
		color: white;
	}

	.btn-add:hover {
		background: #3a7bc8;
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
	}

	.btn-primary:hover {
		background: #3a7bc8;
	}

	.btn-secondary {
		background: var(--color-bg-1);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover {
		background: #e8e8e8;
	}

	.toolbar-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.activity-count {
		font-size: 12px;
		color: #666;
		font-weight: 500;
	}

	/* Mobile optimization */
	@media (max-width: 480px) {
		.toolbar {
			padding: 6px 10px;
		}

		.btn {
			padding: 6px 12px;
			font-size: 12px;
		}

		.activity-input {
			font-size: 13px;
			padding: 6px 10px;
		}

		.activity-count {
			font-size: 11px;
		}
	}
</style>
