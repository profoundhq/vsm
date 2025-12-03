<script lang="ts">
	import { vsmStore } from '$lib/stores/vsmStore';
	import type { VSMActivity, KaizenBurst, TimeUnit } from '$lib/types/vsm';
	import MetricTooltip from './MetricTooltip.svelte';

	export let activity: VSMActivity;
	export let onClose: () => void;
	export let insertingAfterActivityId: string | null = null;

	$: isInserting = insertingAfterActivityId !== null;

	// Tooltip content for metrics
	const tooltips = {
		activeWorkTime: "How long it takes to actually do the work (excluding waiting). Time yourself doing the task a few times and take the average.",
		totalTime: "Total time from when the work arrives until it's finished, including any waiting or delays.",
		errorRate: "Percentage of work that needs to be redone or has errors. Track mistakes over a week or month.",
		teamSize: "Number of people needed to complete this activity. Use decimals for part-time (e.g., 0.5 for half a person's time)."
	};

	let name = activity.name;
	let processTime = activity.processTime?.toString() || '';
	let processTimeUnit: TimeUnit = activity.processTimeUnit || 'mins';
	let leadTime = activity.leadTime?.toString() || '';
	let leadTimeUnit: TimeUnit = activity.leadTimeUnit || 'hours';
	let defectRate = activity.dimensions?.defectRate?.toString() || '';
	let operators = activity.metrics?.operators?.toString() || '';
	let isConstraint = activity.isConstraint || false;
	let swimlane = activity.swimlane || '';
	let kaizenBursts = activity.kaizenBursts || [];
	let newBurstDescription = '';
	let newBurstPriority: 'low' | 'medium' | 'high' = 'medium';

	$: availableSwimlanes = $vsmStore.swimlanes;

	function addKaizenBurst() {
		if (newBurstDescription.trim()) {
			const newBurst: KaizenBurst = {
				id: Date.now().toString(),
				description: newBurstDescription.trim(),
				priority: newBurstPriority
			};
			kaizenBursts = [...kaizenBursts, newBurst];
			newBurstDescription = '';
			newBurstPriority = 'medium';
		}
	}

	function removeBurst(burstId: string) {
		kaizenBursts = kaizenBursts.filter(b => b.id !== burstId);
	}

	function handleSave() {
		const activityData: Partial<VSMActivity> = {
			name,
			processTime: processTime ? parseInt(processTime) : undefined,
			processTimeUnit: processTime ? processTimeUnit : undefined,
			leadTime: leadTime ? parseInt(leadTime) : undefined,
			leadTimeUnit: leadTime ? leadTimeUnit : undefined,
			dimensions: {
				defectRate: defectRate ? parseInt(defectRate) : undefined
			},
			metrics: {
				operators: operators ? parseFloat(operators) : undefined
			},
			isConstraint,
			swimlane: swimlane || undefined,
			kaizenBursts
		};

		if (isInserting && insertingAfterActivityId) {
			// Create new activity and insert after specified activity
			const newActivity: VSMActivity = {
				id: activity.id, // Use the ID that was pre-generated
				name: name || 'New Activity',
				...activityData
			} as VSMActivity;
			vsmStore.insertActivityAfter(insertingAfterActivityId, newActivity);
		} else {
			// Update existing activity
			vsmStore.updateActivity(activity.id, activityData);
		}

		onClose();
	}

	function handleDelete() {
		if (confirm(`Delete "${activity.name}"?`)) {
			vsmStore.removeActivity(activity.id);
			onClose();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}
</script>

<div class="modal-backdrop" on:click={handleBackdropClick}>
	<div class="modal-content">
		<div class="modal-header">
			<h2>{isInserting ? 'Insert Activity' : 'Edit Activity'}</h2>
			<button class="close-btn" on:click={onClose}>&times;</button>
		</div>

		<form on:submit|preventDefault={handleSave}>
			<div class="form-section">
				<label class="form-label">
					Activity Name
					<input
						type="text"
						bind:value={name}
						class="form-input"
						required
					/>
				</label>
			</div>

			<div class="form-section">
				<h3 class="section-title">Time</h3>
				<div class="form-row">
					<label class="form-label">
						<span class="label-with-tooltip">
							Active Work Time
							<MetricTooltip tip={tooltips.activeWorkTime} />
						</span>
						<div class="time-input-group">
							<input
								type="number"
								bind:value={processTime}
								class="form-input time-value"
								placeholder="0"
								min="0"
							/>
							<select bind:value={processTimeUnit} class="form-input time-unit">
								<option value="mins">mins</option>
								<option value="hours">hours</option>
								<option value="days">days</option>
							</select>
						</div>
					</label>
					<label class="form-label">
						<span class="label-with-tooltip">
							Total Time
							<MetricTooltip tip={tooltips.totalTime} />
						</span>
						<div class="time-input-group">
							<input
								type="number"
								bind:value={leadTime}
								class="form-input time-value"
								placeholder="0"
								min="0"
							/>
							<select bind:value={leadTimeUnit} class="form-input time-unit">
								<option value="mins">mins</option>
								<option value="hours">hours</option>
								<option value="days">days</option>
							</select>
						</div>
					</label>
				</div>
			</div>

			<div class="form-section">
				<h3 class="section-title">Quality & Resources</h3>
				<div class="form-row">
					<label class="form-label">
						<span class="label-with-tooltip">
							Error Rate (%)
							<MetricTooltip tip={tooltips.errorRate} />
						</span>
						<input
							type="number"
							bind:value={defectRate}
							class="form-input"
							placeholder="0"
							min="0"
							max="100"
						/>
					</label>
					<label class="form-label">
						<span class="label-with-tooltip">
							Team Size
							<MetricTooltip tip={tooltips.teamSize} />
						</span>
						<input
							type="number"
							bind:value={operators}
							class="form-input"
							placeholder="0"
							min="0"
							step="0.5"
						/>
					</label>
				</div>
			</div>

			<div class="form-section">
				<h3 class="section-title">Team/Owner</h3>
				<label class="form-label">
					Who owns this activity?
					<select bind:value={swimlane} class="form-input">
						<option value="">None</option>
						{#each availableSwimlanes as lane}
							<option value={lane}>{lane}</option>
						{/each}
					</select>
				</label>
			</div>

			<div class="form-section">
				<h3 class="section-title">Improvement Ideas</h3>
				{#if kaizenBursts.length > 0}
					<div class="bursts-list">
						{#each kaizenBursts as burst}
							<div class="burst-item" class:high={burst.priority === 'high'} class:medium={burst.priority === 'medium'}>
								<span class="burst-priority">{burst.priority}</span>
								<span class="burst-desc">{burst.description}</span>
								<button type="button" class="burst-remove" on:click={() => removeBurst(burst.id)}>×</button>
							</div>
						{/each}
					</div>
				{/if}
				<div class="burst-form">
					<input
						type="text"
						bind:value={newBurstDescription}
						placeholder="How could this be improved?"
						class="form-input"
					/>
					<div class="form-row" style="margin-top: 8px;">
						<select bind:value={newBurstPriority} class="form-input">
							<option value="low">Low Priority</option>
							<option value="medium">Medium Priority</option>
							<option value="high">High Priority</option>
						</select>
						<button type="button" class="btn btn-secondary" on:click={addKaizenBurst}>Add Idea</button>
					</div>
				</div>
			</div>

			<div class="form-section">
				<label class="checkbox-label">
					<input
						type="checkbox"
						bind:checked={isConstraint}
						class="form-checkbox"
					/>
					<span>This is a bottleneck</span>
				</label>
			</div>

			<div class="modal-footer">
				{#if !isInserting}
					<button type="button" class="btn btn-delete" on:click={handleDelete}>
						Delete
					</button>
				{/if}
				<div class="footer-actions">
					<button type="button" class="btn btn-secondary" on:click={onClose}>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary">
						{isInserting ? 'Insert' : 'Save'}
					</button>
				</div>
			</div>
		</form>
	</div>
</div>

<style>
	/* Mobile-first modal design */
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: flex-end;
		justify-content: center;
		z-index: 1000;
		padding: 0;
	}

	.modal-content {
		background: var(--color-british-cream);
		width: 100%;
		max-height: 85vh;
		overflow-y: auto;
		border-radius: 0;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
		font-family: 'IBM Plex Sans', sans-serif;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		background: var(--color-british-blue);
		border-bottom: 4px solid var(--color-british-gold);
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 18px;
		font-weight: 700;
		color: white;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 32px;
		line-height: 1;
		color: var(--color-british-gold);
		cursor: pointer;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
	}

	.close-btn:hover {
		color: white;
	}

	form {
		padding: 20px;
		flex: 1;
	}

	.form-section {
		margin-bottom: 24px;
	}

	.section-title {
		font-size: 14px;
		font-weight: 700;
		margin: 0 0 12px 0;
		color: var(--color-british-blue);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.form-label {
		display: block;
		margin-bottom: 12px;
		font-size: 13px;
		font-weight: 500;
		color: #555;
	}

	.label-with-tooltip {
		display: flex;
		align-items: center;
		margin-bottom: 6px;
	}

	.form-input {
		width: 100%;
		padding: 10px 12px;
		border: 2px solid var(--color-british-blue);
		border-radius: 0;
		font-size: 16px;
		margin-top: 6px;
		box-sizing: border-box;
		background: white;
		font-family: 'IBM Plex Sans', sans-serif;
	}

	.form-input:focus {
		outline: none;
		border-color: var(--color-british-gold);
		box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		font-size: 14px;
	}

	.form-checkbox {
		width: 20px;
		height: 20px;
		cursor: pointer;
	}

	.modal-footer {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 16px 20px;
		border-top: 3px solid var(--color-british-blue);
		background: var(--color-british-cream);
		position: sticky;
		bottom: 0;
	}

	.footer-actions {
		display: flex;
		gap: 8px;
	}

	.btn {
		padding: 10px 20px;
		border: 2px solid;
		border-radius: 0;
		cursor: pointer;
		font-weight: 600;
		font-size: 14px;
		transition: all 0.2s;
		white-space: nowrap;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-family: 'IBM Plex Sans', sans-serif;
	}

	.btn-primary {
		background: var(--color-british-blue);
		color: white;
		border-color: var(--color-british-blue);
	}

	.btn-primary:hover {
		background: white;
		color: var(--color-british-blue);
	}

	.btn-secondary {
		background: white;
		color: var(--color-british-blue);
		border-color: var(--color-british-blue);
	}

	.btn-secondary:hover {
		background: var(--color-british-grey);
		color: white;
		border-color: var(--color-british-grey);
	}

	.btn-delete {
		background: white;
		color: var(--color-british-red);
		border-color: var(--color-british-red);
	}

	.btn-delete:hover {
		background: var(--color-british-red);
		color: white;
	}

	/* Tablet and desktop */
	@media (min-width: 768px) {
		.modal-backdrop {
			align-items: center;
			padding: 20px;
		}

		.modal-content {
			width: 100%;
			max-width: 500px;
			max-height: 90vh;
			border-radius: 0;
			border: 3px solid var(--color-british-blue);
		}

		.modal-header h2 {
			font-size: 20px;
		}

		.section-title {
			font-size: 15px;
		}

		.form-label {
			font-size: 14px;
		}

		.checkbox-label {
			font-size: 15px;
		}
	}

	.bursts-list {
		margin-bottom: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.burst-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px;
		background: white;
		border: 2px solid var(--color-british-gold);
		border-left-width: 6px;
		border-radius: 0;
		font-size: 13px;
	}

	.burst-item.high {
		border-color: var(--color-british-red);
		background: white;
	}

	.burst-item.medium {
		border-color: var(--color-british-gold);
		background: white;
	}

	.burst-priority {
		font-size: 10px;
		text-transform: uppercase;
		font-weight: 600;
		opacity: 0.7;
		flex-shrink: 0;
	}

	.burst-desc {
		flex: 1;
	}

	.burst-remove {
		background: none;
		border: none;
		font-size: 24px;
		line-height: 1;
		cursor: pointer;
		color: var(--color-british-grey);
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0;
		transition: all 0.15s;
	}

	.burst-remove:hover {
		background: var(--color-british-red);
		color: white;
	}

	.burst-form {
		margin-top: 8px;
	}

	.time-input-group {
		display: flex;
		gap: 8px;
		margin-top: 6px;
	}

	.time-value {
		flex: 2;
		min-width: 0;
	}

	.time-unit {
		flex: 1;
		min-width: 80px;
	}
</style>
