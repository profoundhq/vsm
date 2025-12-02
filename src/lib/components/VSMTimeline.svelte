<script lang="ts">
	import { vsmStore } from '$lib/stores/vsmStore';
	import type { TimeUnit } from '$lib/types/vsm';

	let isExpanded = true;

	// Match the spacing and positioning from VSMFlow.svelte
	const spacing = 300;
	const startX = 100;

	$: activities = $vsmStore.stream?.activities || [];
	$: visualOrder = [...activities].reverse(); // Match VSMFlow's visual order

	// Helper to normalize time to minutes
	function normalizeToMinutes(value: number, unit?: TimeUnit): number {
		if (!unit) return value; // Default to minutes if no unit specified
		switch (unit) {
			case 'hours': return value * 60;
			case 'days': return value * 60 * 24;
			case 'mins':
			default: return value;
		}
	}

	// Helper to format time with best unit
	function formatTime(minutes: number): { value: number, unit: string } {
		if (minutes >= 1440) { // >= 1 day
			return { value: +(minutes / 1440).toFixed(1), unit: 'days' };
		} else if (minutes >= 60) { // >= 1 hour
			return { value: +(minutes / 60).toFixed(1), unit: 'hours' };
		} else {
			return { value: +minutes.toFixed(1), unit: 'mins' };
		}
	}

	// Calculate summary statistics (normalized to minutes)
	$: totalProcessTimeMinutes = activities.reduce(
		(sum, a) => sum + normalizeToMinutes(a.processTime || 0, a.processTimeUnit), 0
	);
	$: totalLeadTimeMinutes = activities.reduce(
		(sum, a) => sum + normalizeToMinutes(a.leadTime || 0, a.leadTimeUnit), 0
	);
	$: totalProcessTime = formatTime(totalProcessTimeMinutes);
	$: totalLeadTime = formatTime(totalLeadTimeMinutes);
	$: cycleEfficiency = totalLeadTimeMinutes > 0
		? (totalProcessTimeMinutes / totalLeadTimeMinutes * 100).toFixed(1)
		: 0;
	$: activityCount = activities.length;
	$: averageDefectRate = activities.length > 0
		? (activities.reduce((sum, a) => sum + (a.dimensions?.defectRate || 0), 0) / activities.length).toFixed(1)
		: 0;

	// Calculate VSM metrics
	$: averageCompleteAccurate = activities.length > 0
		? (activities.reduce((sum, a) => sum + (a.metrics?.completeAccurate || 0), 0) / activities.length).toFixed(1)
		: 0;
	$: averageUptime = activities.length > 0
		? (activities.reduce((sum, a) => sum + (a.metrics?.uptime || 0), 0) / activities.length).toFixed(1)
		: 0;
	$: totalOperators = activities.reduce((sum, a) => sum + (a.metrics?.operators || 0), 0);
	$: totalBatchSize = activities.reduce((sum, a) => sum + (a.metrics?.batchSize || 0), 0);

	// Calculate Rolled Throughput Yield (RTY)
	$: rolledThroughputYield = activities.length > 0 && activities.some(a => a.metrics?.completeAccurate)
		? (activities.reduce((product, a) => product * ((a.metrics?.completeAccurate || 100) / 100), 1) * 100).toFixed(1)
		: 0;

	// Calculate timeline segments (all in minutes) - using visualOrder to match node positions
	$: timelineSegments = visualOrder.map((a, index) => {
		const processMinutes = normalizeToMinutes(a.processTime || 0, a.processTimeUnit);
		const leadMinutes = normalizeToMinutes(a.leadTime || 0, a.leadTimeUnit);
		return {
			id: a.id,
			name: a.name,
			processTime: processMinutes,
			processDisplay: a.processTime ? `${a.processTime}${a.processTimeUnit || 'mins'}` : '',
			leadTime: leadMinutes,
			leadDisplay: a.leadTime ? `${a.leadTime}${a.leadTimeUnit || 'hours'}` : '',
			waitTime: leadMinutes - processMinutes,
			xPosition: startX + (index + 1) * spacing // Position matches the node in the flow
		};
	});

	// Calculate max time for scaling the visualization
	$: maxLeadTime = Math.max(...timelineSegments.map(s => s.leadTime), 1);

	$: hasData = activities.some(a => a.processTime !== undefined || a.leadTime !== undefined);

	function toggleExpanded() {
		isExpanded = !isExpanded;
	}
</script>

{#if hasData && activities.length > 0}
	<div class="timeline-container" class:collapsed={!isExpanded}>
		<button class="timeline-header" on:click={toggleExpanded}>
			<div class="header-left">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="expand-icon" class:expanded={isExpanded}>
					<polyline points="6 9 12 15 18 9" />
				</svg>
				<h3>Timeline & Statistics</h3>
			</div>
			<div class="header-stats">
				<span class="quick-stat">PCE: <strong>{cycleEfficiency}%</strong></span>
				<span class="quick-stat">{totalLeadTime.value}{totalLeadTime.unit} total</span>
			</div>
		</button>

		{#if isExpanded}
			<!-- Summary Statistics -->
			<div class="stats-grid">
				<div class="stat-card highlight">
					<div class="stat-value">{cycleEfficiency}%</div>
					<div class="stat-label">Process Cycle Efficiency</div>
					<div class="stat-help">Value-add ÷ Total time</div>
				</div>

				<div class="stat-card">
					<div class="stat-value">{totalProcessTime.value}<span class="unit">{totalProcessTime.unit}</span></div>
					<div class="stat-label">Total Value-Add Time</div>
					<div class="stat-help">Actual work time</div>
				</div>

				<div class="stat-card">
					<div class="stat-value">{totalLeadTime.value}<span class="unit">{totalLeadTime.unit}</span></div>
					<div class="stat-label">Total Lead Time</div>
					<div class="stat-help">End-to-end time</div>
				</div>

				{#if rolledThroughputYield > 0}
					<div class="stat-card highlight">
						<div class="stat-value">{rolledThroughputYield}%</div>
						<div class="stat-label">Rolled Throughput Yield</div>
						<div class="stat-help">Product of all %C&A</div>
					</div>
				{/if}

				{#if averageCompleteAccurate > 0}
					<div class="stat-card">
						<div class="stat-value">{averageCompleteAccurate}%</div>
						<div class="stat-label">Avg Complete & Accurate</div>
						<div class="stat-help">Quality metric</div>
					</div>
				{/if}

				{#if averageUptime > 0}
					<div class="stat-card">
						<div class="stat-value">{averageUptime}%</div>
						<div class="stat-label">Avg Uptime</div>
						<div class="stat-help">Availability</div>
					</div>
				{/if}

				{#if totalOperators > 0}
					<div class="stat-card">
						<div class="stat-value">{totalOperators}</div>
						<div class="stat-label">Total Operators</div>
						<div class="stat-help">Full headcount</div>
					</div>
				{/if}

				{#if averageDefectRate > 0}
					<div class="stat-card warning">
						<div class="stat-value">{averageDefectRate}%</div>
						<div class="stat-label">Avg Defect Rate</div>
						<div class="stat-help">Requires rework</div>
					</div>
				{/if}
			</div>

			<!-- Visual Timeline - Lead Time Ladder -->
			<div class="timeline-visual">
				<div class="timeline-title">Lead Time Ladder</div>
				<div class="timeline-ladder" style="min-width: {startX + (visualOrder.length + 2) * spacing}px;">
					{#each timelineSegments as segment}
						{#if segment.leadTime > 0}
							<div class="ladder-segment" style="left: {segment.xPosition}px;">
								<div class="ladder-bars">
									<!-- Process Time Bar (value-add) -->
									<div class="ladder-bar process">
										<div class="bar-value">{segment.processDisplay}</div>
										<div class="bar-label-bottom">PT</div>
									</div>
									<!-- Lead Time Bar (total time) -->
									<div class="ladder-bar lead">
										<div class="bar-value">{segment.leadDisplay}</div>
										<div class="bar-label-bottom">LT</div>
									</div>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	/* Mobile-first design */
	.timeline-container {
		background: white;
		border-top: 3px solid var(--color-british-blue);
		overflow: hidden;
		width: 100%;
	}

	.timeline-container.collapsed {
		border-top-width: 2px;
	}

	.timeline-header {
		width: 100%;
		background: var(--color-british-blue);
		color: white;
		border: none;
		border-bottom: 3px solid var(--color-british-gold);
		padding: 14px 16px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		font-family: 'IBM Plex Sans', sans-serif;
		transition: all 0.2s;
		gap: 12px;
	}

	.timeline-header:hover {
		background: #0052A3;
	}

	.timeline-container.collapsed .timeline-header {
		background: var(--color-british-blue);
		border-bottom-width: 2px;
		padding: 16px;
	}

	.timeline-container.collapsed .timeline-header:hover {
		background: #0052A3;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
		flex: 1;
	}

	.timeline-container.collapsed .header-left {
		flex: 1;
		min-width: 0;
	}

	.expand-icon {
		flex-shrink: 0;
		transition: transform 0.2s;
		width: 20px;
		height: 20px;
	}

	.expand-icon.expanded {
		transform: rotate(180deg);
	}

	.timeline-container.collapsed .expand-icon {
		transform: rotate(-90deg);
	}

	.timeline-header h3 {
		margin: 0;
		font-size: 15px;
		font-weight: 700;
		color: white;
		letter-spacing: 1px;
		text-transform: uppercase;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
		flex: 1;
	}

	.timeline-container.collapsed .timeline-header h3 {
		font-size: 16px !important;
		font-weight: 700 !important;
		letter-spacing: 1.2px !important;
		color: white !important;
		flex: 1 1 auto !important;
		overflow: visible !important;
		white-space: normal !important;
		text-overflow: clip !important;
	}

	.header-stats {
		display: none;
		gap: 12px;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.9);
		flex-shrink: 0;
		letter-spacing: 0.5px;
	}

	.timeline-container:not(.collapsed) .header-stats {
		display: flex;
	}

	.quick-stat {
		white-space: nowrap;
	}

	.quick-stat strong {
		color: var(--color-british-gold);
	}

	/* Statistics Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0;
		padding: 0;
		border-bottom: 2px solid var(--color-british-blue);
		background: var(--color-british-cream);
	}

	.stat-card {
		background: white;
		padding: 16px 14px;
		border-radius: 0;
		text-align: center;
		border: 2px solid var(--color-british-blue);
		border-left-width: 0;
		border-top-width: 0;
		font-family: 'IBM Plex Sans', sans-serif;
		transition: all 0.2s;
	}

	.stat-card:nth-child(2n+1) {
		border-left-width: 2px;
	}

	.stat-card:hover {
		background: var(--color-british-cream);
	}

	.stat-card.highlight {
		background: var(--color-british-blue);
		color: white;
		border-left-width: 8px;
		border-left-color: var(--color-british-gold);
	}

	.stat-card.highlight .stat-value {
		color: white;
	}

	.stat-card.highlight .stat-label,
	.stat-card.highlight .stat-help {
		color: rgba(255, 255, 255, 0.9);
	}

	.stat-card.warning {
		background: #FFF5F5;
		border-left-width: 8px;
		border-left-color: var(--color-british-red);
	}

	.stat-value {
		font-size: 28px;
		font-weight: 700;
		color: var(--color-british-blue);
		margin-bottom: 8px;
		line-height: 1;
		letter-spacing: 0.5px;
	}

	.stat-value .unit {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-british-grey);
		margin-left: 2px;
		letter-spacing: 0.3px;
	}

	.stat-label {
		font-size: 11px;
		color: var(--color-british-grey);
		font-weight: 700;
		line-height: 1.3;
		margin-bottom: 4px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stat-help {
		font-size: 10px;
		color: #999;
		font-weight: 400;
		line-height: 1.2;
		letter-spacing: 0.3px;
	}

	/* Timeline Visual - Lead Time Ladder */
	.timeline-visual {
		padding: 20px;
		background: white;
		border-top: 2px solid var(--color-british-blue);
		overflow-x: auto;
	}

	.timeline-title {
		font-size: 11px;
		font-weight: 700;
		color: white;
		background: var(--color-british-grey);
		padding: 8px 12px;
		margin: -20px -20px 16px -20px;
		text-transform: uppercase;
		letter-spacing: 1px;
		font-family: 'IBM Plex Sans', sans-serif;
	}

	.timeline-ladder {
		position: relative;
		min-height: 120px;
		width: 100%;
		/* Ensure container is wide enough for all positioned segments */
		/* Width = startX + (numActivities + 2) * spacing for START, activities, and END */
	}

	.ladder-segment {
		position: absolute;
		top: 0;
		transform: translateX(-50%); /* Center on the activity node */
	}

	.ladder-bars {
		display: flex;
		gap: 8px;
		align-items: flex-end;
	}

	.ladder-bar {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		min-width: 60px;
	}

	.ladder-bar.process {
		/* Process Time (value-add) */
	}

	.ladder-bar.lead {
		/* Lead Time (total) */
	}

	.bar-value {
		background: var(--color-british-blue);
		color: white;
		padding: 8px 12px;
		border: 2px solid var(--color-british-blue);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.3px;
		font-family: 'IBM Plex Sans', sans-serif;
		text-align: center;
		min-height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ladder-bar.process .bar-value {
		background: var(--color-british-green);
		border-color: var(--color-british-green);
	}

	.bar-label-bottom {
		font-size: 10px;
		font-weight: 700;
		color: var(--color-british-grey);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-family: 'IBM Plex Sans', sans-serif;
	}

	/* Tablet */
	@media (min-width: 640px) {
		.timeline-header {
			padding: 14px 20px;
		}

		.timeline-header h3 {
			font-size: 16px;
		}

		.header-stats {
			font-size: 13px;
		}

		.stats-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 14px;
			padding: 20px;
		}

		.stat-card {
			padding: 16px 14px;
		}

		.stat-value {
			font-size: 28px;
		}

		.stat-label {
			font-size: 12px;
		}

		.ladder-bar {
			min-width: 70px;
		}

		.bar-value {
			font-size: 12px;
			padding: 10px 14px;
		}
	}

	/* Desktop */
	@media (min-width: 1024px) {
		.timeline-header {
			padding: 16px 24px;
		}

		.stats-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: 16px;
			padding: 24px;
		}

		.stat-card {
			padding: 18px 16px;
		}

		.stat-value {
			font-size: 32px;
		}

		.stat-label {
			font-size: 13px;
		}

		.stat-help {
			font-size: 11px;
		}

		.timeline-visual {
			padding: 20px 24px;
		}

		.timeline-title {
			font-size: 13px;
		}

		.ladder-bar {
			min-width: 80px;
		}

		.bar-value {
			font-size: 13px;
			padding: 12px 16px;
		}

		.bar-label-bottom {
			font-size: 11px;
		}
	}
</style>
