<script lang="ts">
	import { vsmStore } from '$lib/stores/vsmStore';
	import type { VSMActivity, KaizenBurst } from '$lib/types/vsm';
	import MetricTooltip from './MetricTooltip.svelte';

	export let activity: VSMActivity;
	export let onClose: () => void;

	// Tooltip content for metrics
	const tooltips = {
		processTime: "Time the activity actually takes to perform (value-adding time). Measure by timing multiple cycles and taking the average.",
		leadTime: "Total elapsed time from when work arrives until it's complete, including wait time. Track from activity start to completion.",
		valueAdd: "Percentage of time spent adding value from the customer's perspective. Calculate: (Process Time / Lead Time) × 100",
		defectRate: "Percentage of units requiring rework or scrapping. Track: (Defective Units / Total Units) × 100 over a period.",
		changeoverTime: "Time needed to switch from one product/process to another. Measure from last good piece to first good piece of next run.",
		completeAccurate: "Percentage of outputs that are 100% complete and accurate, requiring no rework. Track: (Perfect Units / Total Units) × 100",
		uptime: "Percentage of scheduled production time that equipment is actually available. Calculate: (Available Time / Scheduled Time) × 100",
		operators: "Number of people required to perform this activity. Count full-time equivalents if shared across activities.",
		batchSize: "Number of units processed together before moving to next step. Observe the typical transfer batch size used."
	};

	let name = activity.name;
	let processTime = activity.processTime?.toString() || '';
	let leadTime = activity.leadTime?.toString() || '';
	let value = activity.dimensions?.value?.toString() || '';
	let defectRate = activity.dimensions?.defectRate?.toString() || '';
	let changeoverTime = activity.dimensions?.changeoverTime?.toString() || '';
	let completeAccurate = activity.metrics?.completeAccurate?.toString() || '';
	let uptime = activity.metrics?.uptime?.toString() || '';
	let operators = activity.metrics?.operators?.toString() || '';
	let batchSize = activity.metrics?.batchSize?.toString() || '';
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
		const updates: Partial<VSMActivity> = {
			name,
			processTime: processTime ? parseInt(processTime) : undefined,
			leadTime: leadTime ? parseInt(leadTime) : undefined,
			dimensions: {
				value: value ? parseInt(value) : undefined,
				defectRate: defectRate ? parseInt(defectRate) : undefined,
				changeoverTime: changeoverTime ? parseInt(changeoverTime) : undefined
			},
			metrics: {
				completeAccurate: completeAccurate ? parseInt(completeAccurate) : undefined,
				uptime: uptime ? parseInt(uptime) : undefined,
				operators: operators ? parseInt(operators) : undefined,
				batchSize: batchSize ? parseInt(batchSize) : undefined
			},
			isConstraint,
			swimlane: swimlane || undefined,
			kaizenBursts
		};

		vsmStore.updateActivity(activity.id, updates);
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
			<h2>Edit Activity</h2>
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
				<h3 class="section-title">Timing</h3>
				<div class="form-row">
					<label class="form-label">
						<span class="label-with-tooltip">
							Process Time (min)
							<MetricTooltip tip={tooltips.processTime} />
						</span>
						<input
							type="number"
							bind:value={processTime}
							class="form-input"
							placeholder="0"
							min="0"
						/>
					</label>
					<label class="form-label">
						<span class="label-with-tooltip">
							Lead Time (min)
							<MetricTooltip tip={tooltips.leadTime} />
						</span>
						<input
							type="number"
							bind:value={leadTime}
							class="form-input"
							placeholder="0"
							min="0"
						/>
					</label>
				</div>
			</div>

			<div class="form-section">
				<h3 class="section-title">Dimensions</h3>
				<div class="form-row">
					<label class="form-label">
						<span class="label-with-tooltip">
							Value-Add (%)
							<MetricTooltip tip={tooltips.valueAdd} />
						</span>
						<input
							type="number"
							bind:value={value}
							class="form-input"
							placeholder="0"
							min="0"
							max="100"
						/>
					</label>
					<label class="form-label">
						<span class="label-with-tooltip">
							Defect Rate (%)
							<MetricTooltip tip={tooltips.defectRate} />
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
				</div>
				<label class="form-label">
					<span class="label-with-tooltip">
						Changeover Time (min)
						<MetricTooltip tip={tooltips.changeoverTime} />
					</span>
					<input
						type="number"
						bind:value={changeoverTime}
						class="form-input"
						placeholder="0"
						min="0"
					/>
				</label>
			</div>

			<div class="form-section">
				<h3 class="section-title">VSM Metrics</h3>
				<div class="form-row">
					<label class="form-label">
						<span class="label-with-tooltip">
							%C&A (%)
							<MetricTooltip tip={tooltips.completeAccurate} />
						</span>
						<input
							type="number"
							bind:value={completeAccurate}
							class="form-input"
							placeholder="0"
							min="0"
							max="100"
							title="% Complete & Accurate"
						/>
					</label>
					<label class="form-label">
						<span class="label-with-tooltip">
							Uptime (%)
							<MetricTooltip tip={tooltips.uptime} />
						</span>
						<input
							type="number"
							bind:value={uptime}
							class="form-input"
							placeholder="0"
							min="0"
							max="100"
						/>
					</label>
				</div>
				<div class="form-row">
					<label class="form-label">
						<span class="label-with-tooltip">
							Operators
							<MetricTooltip tip={tooltips.operators} />
						</span>
						<input
							type="number"
							bind:value={operators}
							class="form-input"
							placeholder="0"
							min="0"
						/>
					</label>
					<label class="form-label">
						<span class="label-with-tooltip">
							Batch Size
							<MetricTooltip tip={tooltips.batchSize} />
						</span>
						<input
							type="number"
							bind:value={batchSize}
							class="form-input"
							placeholder="0"
							min="1"
						/>
					</label>
				</div>
			</div>

			<div class="form-section">
				<h3 class="section-title">Department/Role</h3>
				<label class="form-label">
					Swimlane
					<select bind:value={swimlane} class="form-input">
						<option value="">None</option>
						{#each availableSwimlanes as lane}
							<option value={lane}>{lane}</option>
						{/each}
					</select>
				</label>
			</div>

			<div class="form-section">
				<h3 class="section-title">Kaizen Bursts (Improvements)</h3>
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
						placeholder="Improvement idea..."
						class="form-input"
					/>
					<div class="form-row" style="margin-top: 8px;">
						<select bind:value={newBurstPriority} class="form-input">
							<option value="low">Low Priority</option>
							<option value="medium">Medium Priority</option>
							<option value="high">High Priority</option>
						</select>
						<button type="button" class="btn btn-secondary" on:click={addKaizenBurst}>Add Burst</button>
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
					<span>Mark as Constraint (bottleneck)</span>
				</label>
			</div>

			<div class="modal-footer">
				<button type="button" class="btn btn-delete" on:click={handleDelete}>
					Delete
				</button>
				<div class="footer-actions">
					<button type="button" class="btn btn-secondary" on:click={onClose}>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary">
						Save
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
		background: white;
		width: 100%;
		max-height: 85vh;
		overflow-y: auto;
		border-radius: 16px 16px 0 0;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		background: white;
		z-index: 1;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 18px;
		font-weight: 700;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 32px;
		line-height: 1;
		color: #666;
		cursor: pointer;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
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
		font-weight: 600;
		margin: 0 0 12px 0;
		color: #333;
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
		border: 1px solid var(--color-border);
		border-radius: 8px;
		font-size: 16px;
		margin-top: 6px;
		box-sizing: border-box;
	}

	.form-input:focus {
		outline: none;
		border-color: var(--color-primary);
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
		border-top: 1px solid var(--color-border);
		background: white;
		position: sticky;
		bottom: 0;
	}

	.footer-actions {
		display: flex;
		gap: 8px;
	}

	.btn {
		padding: 10px 20px;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
		font-size: 14px;
		transition: all 0.2s;
		white-space: nowrap;
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

	.btn-delete {
		background: #fff;
		color: var(--color-constraint);
		border: 1px solid var(--color-constraint);
	}

	.btn-delete:hover {
		background: #fff5f5;
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
			border-radius: 12px;
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
		background: #fef3c7;
		border: 1px solid #fbbf24;
		border-radius: 6px;
		font-size: 13px;
	}

	.burst-item.high {
		background: #fee2e2;
		border-color: #ef4444;
	}

	.burst-item.medium {
		background: #fed7aa;
		border-color: #f97316;
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
		color: #666;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.15s;
	}

	.burst-remove:hover {
		background: rgba(0, 0, 0, 0.1);
	}

	.burst-form {
		margin-top: 8px;
	}
</style>
