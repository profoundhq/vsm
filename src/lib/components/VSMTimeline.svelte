<script lang="ts">
	import { vsmStore } from '$lib/stores/vsmStore';
	import type { TimeUnit } from '$lib/types/vsm';

	let isExpanded = true;

	$: activities = $vsmStore.stream?.activities || [];

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

	// Calculate timeline segments (all in minutes)
	$: timelineSegments = activities.map(a => {
		const processMinutes = normalizeToMinutes(a.processTime || 0, a.processTimeUnit);
		const leadMinutes = normalizeToMinutes(a.leadTime || 0, a.leadTimeUnit);
		return {
			name: a.name,
			processTime: processMinutes,
			processDisplay: a.processTime ? `${a.processTime}${a.processTimeUnit || 'mins'}` : '',
			leadTime: leadMinutes,
			leadDisplay: a.leadTime ? `${a.leadTime}${a.leadTimeUnit || 'hours'}` : '',
			waitTime: leadMinutes - processMinutes
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

			<!-- Visual Timeline -->
			<div class="timeline-visual">
				<div class="timeline-title">Activity Timeline (proportional to lead time)</div>
				<div class="timeline-activities">
					{#each timelineSegments as segment}
						{#if segment.leadTime > 0}
							<div class="activity-row">
								<div class="activity-name">{segment.name}</div>
								<div class="activity-bar-container">
									<div
										class="activity-bar"
										style="width: {(segment.leadTime / maxLeadTime * 100)}%"
										title="Lead time: {segment.leadDisplay}"
									>
										<div
											class="process-time"
											style="width: {segment.processTime > 0 ? (segment.processTime / segment.leadTime * 100) : 0}%"
											title="Process time: {segment.processDisplay}"
										>
											{#if segment.processTime > 0}
												<span class="bar-label">{segment.processDisplay}</span>
											{/if}
										</div>
										{#if segment.waitTime > 0}
											<div class="wait-time" title="Wait time: {formatTime(segment.waitTime).value}{formatTime(segment.waitTime).unit}">
												<span class="bar-label">{formatTime(segment.waitTime).value}{formatTime(segment.waitTime).unit}</span>
											</div>
										{/if}
									</div>
									<span class="total-time">{segment.leadDisplay}</span>
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
		border: 3px solid var(--color-british-blue);
		overflow: hidden;
		max-width: 100%;
		box-shadow: 0 -4px 12px rgba(0, 61, 122, 0.15);
	}

	.timeline-container.collapsed {
		border-width: 2px;
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

	/* Timeline Visual */
	.timeline-visual {
		padding: 20px;
		background: white;
		border-top: 2px solid var(--color-british-blue);
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

	.timeline-activities {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.activity-row {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.activity-name {
		font-size: 12px;
		font-weight: 700;
		color: var(--color-british-blue);
		letter-spacing: 0.5px;
		font-family: 'IBM Plex Sans', sans-serif;
	}

	.activity-bar-container {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.activity-bar {
		display: flex;
		height: 36px;
		min-width: 80px;
		border-radius: 0;
		overflow: hidden;
		border: 2px solid var(--color-british-blue);
		box-shadow: none;
	}

	.process-time {
		background: var(--color-british-green);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.3px;
		font-family: 'IBM Plex Sans', sans-serif;
		position: relative;
	}

	.wait-time {
		background: var(--color-british-gold);
		color: #78350f;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.3px;
		font-family: 'IBM Plex Sans', sans-serif;
		flex: 1;
	}

	.bar-label {
		padding: 0 8px;
		white-space: nowrap;
	}

	.total-time {
		font-size: 11px;
		font-weight: 700;
		color: var(--color-british-blue);
		letter-spacing: 0.3px;
		font-family: 'IBM Plex Sans', sans-serif;
		white-space: nowrap;
		flex-shrink: 0;
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

		.activity-row {
			flex-direction: row;
			align-items: center;
			gap: 12px;
		}

		.activity-name {
			min-width: 140px;
			font-size: 13px;
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

		.activity-name {
			min-width: 180px;
			font-size: 14px;
		}

		.activity-bar {
			height: 36px;
		}

		.bar-label {
			font-size: 12px;
		}

		.total-time {
			font-size: 12px;
		}
	}
</style>
