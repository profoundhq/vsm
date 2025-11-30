<script lang="ts">
	import { vsmStore } from '$lib/stores/vsmStore';
	import type { VSMActivity } from '$lib/types/vsm';
	import yaml from 'js-yaml';

	let showMenu = false;
	let showEditor = false;
	let format: 'csv' | 'yaml' = 'csv';
	let editorContent = '';
	let errorMessage = '';
	let previewChanges: { action: 'add' | 'update', activity: VSMActivity }[] = [];

	$: activities = $vsmStore.stream?.activities || [];

	function toggleMenu() {
		showMenu = !showMenu;
	}

	function closeMenu() {
		showMenu = false;
	}

	function exportToCSV() {
		const headers = [
			'name',
			'processTime',
			'leadTime',
			'valueAdd',
			'defectRate',
			'changeoverTime',
			'completeAccurate',
			'uptime',
			'operators',
			'batchSize',
			'swimlane',
			'isConstraint'
		];

		const rows = activities.map(a => [
			a.name,
			a.processTime || '',
			a.leadTime || '',
			a.dimensions?.value || '',
			a.dimensions?.defectRate || '',
			a.dimensions?.changeoverTime || '',
			a.metrics?.completeAccurate || '',
			a.metrics?.uptime || '',
			a.metrics?.operators || '',
			a.metrics?.batchSize || '',
			a.swimlane || '',
			a.isConstraint ? 'true' : 'false'
		]);

		const csv = [
			headers.join(','),
			...rows.map(row => row.map(val => {
				// Escape values containing commas or quotes
				const str = String(val);
				if (str.includes(',') || str.includes('"') || str.includes('\n')) {
					return `"${str.replace(/"/g, '""')}"`;
				}
				return str;
			}).join(','))
		].join('\n');

		downloadFile(csv, 'vsm-activities.csv', 'text/csv');
		closeMenu();
	}

	function exportToYAML() {
		const data = activities.map(a => ({
			name: a.name,
			processTime: a.processTime,
			leadTime: a.leadTime,
			dimensions: a.dimensions,
			metrics: a.metrics,
			swimlane: a.swimlane,
			isConstraint: a.isConstraint,
			kaizenBursts: a.kaizenBursts
		}));

		const yamlStr = yaml.dump(data, {
			indent: 2,
			lineWidth: -1,
			noRefs: true
		});

		downloadFile(yamlStr, 'vsm-activities.yaml', 'text/yaml');
		closeMenu();
	}

	function downloadFile(content: string, filename: string, mimeType: string) {
		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		link.click();
		URL.revokeObjectURL(url);
	}

	function openEditor(fmt: 'csv' | 'yaml') {
		format = fmt;
		if (fmt === 'csv') {
			// Generate CSV content for editing
			const headers = 'name,processTime,leadTime,valueAdd,defectRate,changeoverTime,completeAccurate,uptime,operators,batchSize,swimlane,isConstraint';
			const rows = activities.map(a =>
				[
					a.name,
					a.processTime || '',
					a.leadTime || '',
					a.dimensions?.value || '',
					a.dimensions?.defectRate || '',
					a.dimensions?.changeoverTime || '',
					a.metrics?.completeAccurate || '',
					a.metrics?.uptime || '',
					a.metrics?.operators || '',
					a.metrics?.batchSize || '',
					a.swimlane || '',
					a.isConstraint ? 'true' : 'false'
				].join(',')
			);
			editorContent = [headers, ...rows].join('\n');
		} else {
			// Generate YAML content for editing
			const data = activities.map(a => ({
				name: a.name,
				processTime: a.processTime,
				leadTime: a.leadTime,
				dimensions: a.dimensions,
				metrics: a.metrics,
				swimlane: a.swimlane,
				isConstraint: a.isConstraint,
				kaizenBursts: a.kaizenBursts
			}));
			editorContent = yaml.dump(data, { indent: 2, lineWidth: -1, noRefs: true });
		}
		showEditor = true;
		showMenu = false;
		errorMessage = '';
		previewChanges = [];
	}

	function parseCSV(csv: string): VSMActivity[] {
		const lines = csv.trim().split('\n');
		if (lines.length < 2) throw new Error('CSV must have header row and at least one data row');

		const headers = lines[0].split(',').map(h => h.trim());
		const nameIndex = headers.indexOf('name');
		if (nameIndex === -1) throw new Error('CSV must have "name" column');

		const activities: VSMActivity[] = [];

		for (let i = 1; i < lines.length; i++) {
			const values = parseCSVLine(lines[i]);
			if (values.length !== headers.length) {
				throw new Error(`Line ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
			}

			const activity: VSMActivity = {
				id: '', // Will be set during preview/apply
				name: values[nameIndex].trim()
			};

			if (!activity.name) {
				throw new Error(`Line ${i + 1}: Activity name is required`);
			}

			headers.forEach((header, idx) => {
				const value = values[idx].trim();
				if (!value) return;

				switch (header) {
					case 'processTime':
						activity.processTime = parseInt(value);
						break;
					case 'leadTime':
						activity.leadTime = parseInt(value);
						break;
					case 'valueAdd':
						if (!activity.dimensions) activity.dimensions = {};
						activity.dimensions.value = parseInt(value);
						break;
					case 'defectRate':
						if (!activity.dimensions) activity.dimensions = {};
						activity.dimensions.defectRate = parseInt(value);
						break;
					case 'changeoverTime':
						if (!activity.dimensions) activity.dimensions = {};
						activity.dimensions.changeoverTime = parseInt(value);
						break;
					case 'completeAccurate':
						if (!activity.metrics) activity.metrics = {};
						activity.metrics.completeAccurate = parseInt(value);
						break;
					case 'uptime':
						if (!activity.metrics) activity.metrics = {};
						activity.metrics.uptime = parseInt(value);
						break;
					case 'operators':
						if (!activity.metrics) activity.metrics = {};
						activity.metrics.operators = parseInt(value);
						break;
					case 'batchSize':
						if (!activity.metrics) activity.metrics = {};
						activity.metrics.batchSize = parseInt(value);
						break;
					case 'swimlane':
						activity.swimlane = value;
						break;
					case 'isConstraint':
						activity.isConstraint = value.toLowerCase() === 'true';
						break;
				}
			});

			activities.push(activity);
		}

		return activities;
	}

	function parseCSVLine(line: string): string[] {
		const values: string[] = [];
		let current = '';
		let inQuotes = false;

		for (let i = 0; i < line.length; i++) {
			const char = line[i];
			const next = line[i + 1];

			if (char === '"' && inQuotes && next === '"') {
				current += '"';
				i++; // Skip next quote
			} else if (char === '"') {
				inQuotes = !inQuotes;
			} else if (char === ',' && !inQuotes) {
				values.push(current);
				current = '';
			} else {
				current += char;
			}
		}
		values.push(current);

		return values;
	}

	function parseYAML(yamlStr: string): VSMActivity[] {
		const data = yaml.load(yamlStr) as any[];
		if (!Array.isArray(data)) {
			throw new Error('YAML must be an array of activities');
		}

		return data.map((item, idx) => {
			if (!item.name) {
				throw new Error(`Activity ${idx + 1}: name is required`);
			}

			const activity: VSMActivity = {
				id: '', // Will be set during preview/apply
				name: item.name,
				processTime: item.processTime,
				leadTime: item.leadTime,
				dimensions: item.dimensions,
				metrics: item.metrics,
				swimlane: item.swimlane,
				isConstraint: item.isConstraint,
				kaizenBursts: item.kaizenBursts
			};

			return activity;
		});
	}

	function previewImport() {
		errorMessage = '';
		previewChanges = [];

		try {
			const importedActivities = format === 'csv'
				? parseCSV(editorContent)
				: parseYAML(editorContent);

			// Match imported activities with existing ones
			importedActivities.forEach(imported => {
				const existing = activities.find(a =>
					a.name.toLowerCase() === imported.name.toLowerCase()
				);

				if (existing) {
					// Update existing activity
					previewChanges.push({
						action: 'update',
						activity: { ...imported, id: existing.id }
					});
				} else {
					// Add new activity
					previewChanges.push({
						action: 'add',
						activity: { ...imported, id: Date.now().toString() + Math.random() }
					});
				}
			});

		} catch (error: any) {
			errorMessage = error.message || 'Failed to parse content';
		}
	}

	function applyChanges() {
		if (previewChanges.length === 0) return;

		previewChanges.forEach(change => {
			if (change.action === 'add') {
				vsmStore.addActivity(change.activity);
			} else {
				vsmStore.updateActivity(change.activity.id, change.activity);
			}
		});

		showEditor = false;
		editorContent = '';
		previewChanges = [];
		errorMessage = '';
	}

	function cancelEditor() {
		showEditor = false;
		editorContent = '';
		previewChanges = [];
		errorMessage = '';
	}
</script>

<svelte:window on:click={closeMenu} />

<div class="bulk-update">
	<button class="bulk-button" on:click|stopPropagation={toggleMenu}>
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
			<polyline points="14 2 14 8 20 8" />
			<line x1="12" y1="18" x2="12" y2="12" />
			<line x1="9" y1="15" x2="15" y2="15" />
		</svg>
		Bulk Update
	</button>

	{#if showMenu}
		<div class="menu" on:click|stopPropagation>
			<div class="menu-section">
				<div class="menu-title">Export</div>
				<button on:click={exportToCSV} class="menu-item">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="7 10 12 15 17 10" />
						<line x1="12" y1="15" x2="12" y2="3" />
					</svg>
					Export CSV
				</button>
				<button on:click={exportToYAML} class="menu-item">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="7 10 12 15 17 10" />
						<line x1="12" y1="15" x2="12" y2="3" />
					</svg>
					Export YAML
				</button>
			</div>

			<div class="menu-divider"></div>

			<div class="menu-section">
				<div class="menu-title">Import / Edit</div>
				<button on:click={() => openEditor('csv')} class="menu-item">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
						<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
					</svg>
					Edit as CSV
				</button>
				<button on:click={() => openEditor('yaml')} class="menu-item">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
						<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
					</svg>
					Edit as YAML
				</button>
			</div>
		</div>
	{/if}
</div>

{#if showEditor}
	<div class="editor-modal">
		<div class="editor-content">
			<div class="editor-header">
				<h2>Bulk Update ({format.toUpperCase()})</h2>
				<button class="close-btn" on:click={cancelEditor}>&times;</button>
			</div>

			<div class="editor-body">
				<div class="editor-instructions">
					{#if format === 'csv'}
						<p><strong>CSV Format:</strong> Edit the data below. Add new rows for new activities, modify existing rows to update them.</p>
					{:else}
						<p><strong>YAML Format:</strong> Edit the YAML below. Add new entries for new activities, modify existing ones to update them.</p>
					{/if}
				</div>

				<textarea
					bind:value={editorContent}
					class="editor-textarea"
					spellcheck="false"
					placeholder={format === 'csv' ? 'name,processTime,leadTime,...' : '- name: Activity 1\n  processTime: 5\n  ...'}
				/>

				{#if errorMessage}
					<div class="error-message">{errorMessage}</div>
				{/if}

				{#if previewChanges.length > 0}
					<div class="preview-section">
						<h3>Preview Changes ({previewChanges.length})</h3>
						<div class="preview-list">
							{#each previewChanges as change}
								<div class="preview-item {change.action}">
									<span class="preview-badge">{change.action}</span>
									<span class="preview-name">{change.activity.name}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<div class="editor-footer">
				<button class="btn-secondary" on:click={cancelEditor}>Cancel</button>
				<button class="btn-preview" on:click={previewImport}>Preview</button>
				<button
					class="btn-primary"
					on:click={applyChanges}
					disabled={previewChanges.length === 0}
				>
					Apply Changes ({previewChanges.length})
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.bulk-update {
		position: relative;
	}

	.bulk-button {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		padding: 8px 12px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.875rem;
		color: #374151;
		transition: all 0.2s;
		font-weight: 500;
	}

	.bulk-button:hover {
		background: #f9fafb;
		border-color: #d1d5db;
	}

	.menu {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		min-width: 200px;
		z-index: 100;
	}

	.menu-section {
		padding: 8px;
	}

	.menu-title {
		padding: 8px 12px;
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.menu-item {
		width: 100%;
		padding: 8px 12px;
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 8px;
		color: #374151;
		font-size: 0.875rem;
		border-radius: 4px;
		transition: background 0.2s;
	}

	.menu-item:hover {
		background: #f3f4f6;
	}

	.menu-divider {
		height: 1px;
		background: #e5e7eb;
		margin: 4px 0;
	}

	.editor-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}

	.editor-content {
		background: white;
		border-radius: 12px;
		width: 100%;
		max-width: 900px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
	}

	.editor-header {
		padding: 20px 24px;
		border-bottom: 1px solid #e5e7eb;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.editor-header h2 {
		margin: 0;
		font-size: 1.25rem;
		color: #111827;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 28px;
		cursor: pointer;
		color: #6b7280;
		line-height: 1;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: #f3f4f6;
		color: #111827;
	}

	.editor-body {
		flex: 1;
		overflow-y: auto;
		padding: 20px 24px;
		min-height: 0;
	}

	.editor-instructions {
		margin-bottom: 16px;
		padding: 12px;
		background: #eff6ff;
		border-left: 3px solid #3b82f6;
		border-radius: 4px;
	}

	.editor-instructions p {
		margin: 0;
		font-size: 0.875rem;
		color: #1e40af;
		line-height: 1.5;
	}

	.editor-textarea {
		width: 100%;
		min-height: 300px;
		padding: 12px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
		font-size: 13px;
		line-height: 1.5;
		resize: vertical;
		box-sizing: border-box;
	}

	.editor-textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.error-message {
		margin-top: 12px;
		padding: 12px;
		background: #fee2e2;
		border-left: 3px solid #ef4444;
		border-radius: 4px;
		color: #991b1b;
		font-size: 0.875rem;
	}

	.preview-section {
		margin-top: 20px;
		padding: 16px;
		background: #f9fafb;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
	}

	.preview-section h3 {
		margin: 0 0 12px 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
	}

	.preview-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
		max-height: 200px;
		overflow-y: auto;
	}

	.preview-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		background: white;
		border-radius: 4px;
		font-size: 0.875rem;
	}

	.preview-badge {
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.preview-item.add .preview-badge {
		background: #d1fae5;
		color: #065f46;
	}

	.preview-item.update .preview-badge {
		background: #dbeafe;
		color: #1e40af;
	}

	.preview-name {
		color: #374151;
	}

	.editor-footer {
		padding: 16px 24px;
		border-top: 1px solid #e5e7eb;
		display: flex;
		gap: 12px;
		justify-content: flex-end;
	}

	.editor-footer button {
		padding: 8px 16px;
		border-radius: 6px;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.btn-secondary {
		background: white;
		color: #374151;
		border: 1px solid #d1d5db;
	}

	.btn-secondary:hover {
		background: #f9fafb;
	}

	.btn-preview {
		background: #f59e0b;
		color: white;
	}

	.btn-preview:hover {
		background: #d97706;
	}

	.btn-primary {
		background: #3b82f6;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: #2563eb;
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Mobile adjustments */
	@media (max-width: 640px) {
		.editor-modal {
			padding: 0;
		}

		.editor-content {
			max-width: 100%;
			max-height: 100vh;
			border-radius: 0;
		}

		.editor-textarea {
			min-height: 200px;
			font-size: 12px;
		}

		.editor-footer {
			flex-wrap: wrap;
		}

		.editor-footer button {
			flex: 1;
			min-width: 100px;
		}
	}
</style>
