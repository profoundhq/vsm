<script lang="ts">
	import { vsmStore } from '$lib/stores/vsmStore';
	import type { VSMActivity } from '$lib/types/vsm';

	export let activity: VSMActivity;
	export let onClose: () => void;

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
			isConstraint
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
						Process Time (min)
						<input
							type="number"
							bind:value={processTime}
							class="form-input"
							placeholder="0"
							min="0"
						/>
					</label>
					<label class="form-label">
						Lead Time (min)
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
						Value-Add (%)
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
						Defect Rate (%)
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
					Changeover Time (min)
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
						%C&A (%)
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
						Uptime (%)
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
						Operators
						<input
							type="number"
							bind:value={operators}
							class="form-input"
							placeholder="0"
							min="0"
						/>
					</label>
					<label class="form-label">
						Batch Size
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

	.form-input {
		width: 100%;
		padding: 10px 12px;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		font-size: 15px;
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
</style>
