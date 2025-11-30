<script lang="ts">
	import { vsmStore } from '$lib/stores/vsmStore';

	$: activities = $vsmStore.stream?.activities || [];

	// Calculate summary statistics
	$: totalProcessTime = activities.reduce((sum, a) => sum + (a.processTime || 0), 0);
	$: totalLeadTime = activities.reduce((sum, a) => sum + (a.leadTime || 0), 0);
	$: cycleEfficiency = totalLeadTime > 0 ? (totalProcessTime / totalLeadTime * 100).toFixed(1) : 0;
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

	// Calculate Rolled Throughput Yield (RTY) - product of all %C&A values
	$: rolledThroughputYield = activities.length > 0 && activities.some(a => a.metrics?.completeAccurate)
		? (activities.reduce((product, a) => product * ((a.metrics?.completeAccurate || 100) / 100), 1) * 100).toFixed(1)
		: 0;

	// Calculate timeline segments for visualization
	$: timelineSegments = activities.map(a => ({
		name: a.name,
		processTime: a.processTime || 0,
		leadTime: a.leadTime || 0,
		waitTime: (a.leadTime || 0) - (a.processTime || 0)
	}));

	$: hasData = activities.some(a => a.processTime !== undefined || a.leadTime !== undefined);
</script>

{#if hasData && activities.length > 0}
	<div class="timeline-container">
		<div class="timeline-header">
			<h3>Timeline & Statistics</h3>
		</div>

		<!-- Visual Timeline -->
		<div class="timeline-visual">
			<div class="timeline-row">
				<span class="timeline-label">Process Time</span>
				<div class="timeline-bars">
					{#each timelineSegments as segment}
						{#if segment.processTime > 0}
							<div class="timeline-segment process" title="{segment.name}: {segment.processTime}min">
								<span class="segment-label">{segment.processTime}m</span>
							</div>
						{/if}
					{/each}
				</div>
			</div>

			<div class="timeline-row">
				<span class="timeline-label">Lead Time</span>
				<div class="timeline-bars">
					{#each timelineSegments as segment}
						{#if segment.leadTime > 0}
							<div class="timeline-segment lead" title="{segment.name}: {segment.leadTime}min total">
								<div class="lead-breakdown">
									{#if segment.processTime > 0}
										<div class="process-portion" style="width: {(segment.processTime / segment.leadTime * 100)}%">
											{segment.processTime}m
										</div>
									{/if}
									{#if segment.waitTime > 0}
										<div class="wait-portion" style="width: {(segment.waitTime / segment.leadTime * 100)}%">
											{segment.waitTime}m
										</div>
									{/if}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</div>

		<!-- Summary Statistics -->
		<div class="stats-grid">
			<div class="stat-card">
				<div class="stat-value">{totalProcessTime}</div>
				<div class="stat-label">Total Value-Add Time (min)</div>
			</div>

			<div class="stat-card">
				<div class="stat-value">{totalLeadTime}</div>
				<div class="stat-label">Total Lead Time (min)</div>
			</div>

			<div class="stat-card highlight">
				<div class="stat-value">{cycleEfficiency}%</div>
				<div class="stat-label">Process Cycle Efficiency (PCE)</div>
			</div>

			{#if averageCompleteAccurate > 0}
				<div class="stat-card highlight">
					<div class="stat-value">{averageCompleteAccurate}%</div>
					<div class="stat-label">Avg %C&A</div>
				</div>
			{/if}

			{#if rolledThroughputYield > 0}
				<div class="stat-card">
					<div class="stat-value">{rolledThroughputYield}%</div>
					<div class="stat-label">Rolled Throughput Yield</div>
				</div>
			{/if}

			{#if averageUptime > 0}
				<div class="stat-card">
					<div class="stat-value">{averageUptime}%</div>
					<div class="stat-label">Avg Uptime</div>
				</div>
			{/if}

			{#if totalOperators > 0}
				<div class="stat-card">
					<div class="stat-value">{totalOperators}</div>
					<div class="stat-label">Total Operators</div>
				</div>
			{/if}

			{#if totalBatchSize > 0}
				<div class="stat-card">
					<div class="stat-value">{totalBatchSize}</div>
					<div class="stat-label">Total Batch Size</div>
				</div>
			{/if}

			<div class="stat-card">
				<div class="stat-value">{activityCount}</div>
				<div class="stat-label">Total Activities</div>
			</div>

			{#if averageDefectRate > 0}
				<div class="stat-card warning">
					<div class="stat-value">{averageDefectRate}%</div>
					<div class="stat-label">Avg Defect Rate</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.timeline-container {
		background: white;
		border-top: 2px solid var(--color-border);
		padding: 12px;
		position: relative;
	}

	.timeline-header {
		margin-bottom: 12px;
	}

	.timeline-header h3 {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: #333;
	}

	.timeline-visual {
		margin-bottom: 16px;
		background: #fafafa;
		padding: 12px;
		border-radius: 8px;
	}

	.timeline-row {
		display: flex;
		align-items: center;
		margin-bottom: 10px;
		gap: 12px;
	}

	.timeline-row:last-child {
		margin-bottom: 0;
	}

	.timeline-label {
		font-size: 11px;
		font-weight: 600;
		color: #666;
		min-width: 80px;
		flex-shrink: 0;
	}

	.timeline-bars {
		display: flex;
		gap: 4px;
		flex: 1;
		overflow-x: auto;
	}

	.timeline-segment {
		padding: 6px 8px;
		border-radius: 4px;
		font-size: 10px;
		font-weight: 600;
		white-space: nowrap;
		min-width: 40px;
		text-align: center;
	}

	.timeline-segment.process {
		background: var(--color-primary);
		color: white;
	}

	.timeline-segment.lead {
		background: #e0e0e0;
		padding: 0;
		overflow: hidden;
	}

	.lead-breakdown {
		display: flex;
		height: 100%;
		font-size: 9px;
		font-weight: 600;
	}

	.process-portion {
		background: var(--color-primary);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px 4px;
	}

	.wait-portion {
		background: #fbbf24;
		color: #78350f;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px 4px;
	}

	.segment-label {
		display: block;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: 10px;
	}

	.stat-card {
		background: #f8f9fa;
		padding: 10px;
		border-radius: 6px;
		text-align: center;
		border: 2px solid transparent;
		transition: all 0.2s;
	}

	.stat-card.highlight {
		background: #f0f7ff;
		border-color: var(--color-primary);
	}

	.stat-card.warning {
		background: #fff5f5;
		border-color: var(--color-constraint);
	}

	.stat-value {
		font-size: 18px;
		font-weight: 700;
		color: #333;
		margin-bottom: 4px;
	}

	.stat-label {
		font-size: 10px;
		color: #666;
		font-weight: 500;
		line-height: 1.2;
	}

	/* Tablet and desktop */
	@media (min-width: 768px) {
		.timeline-container {
			padding: 16px 20px;
		}

		.timeline-header h3 {
			font-size: 16px;
		}

		.timeline-visual {
			padding: 16px;
		}

		.timeline-label {
			font-size: 12px;
			min-width: 100px;
		}

		.timeline-segment {
			padding: 8px 10px;
			font-size: 11px;
		}

		.lead-breakdown {
			font-size: 10px;
		}

		.process-portion,
		.wait-portion {
			padding: 8px 6px;
		}

		.stats-grid {
			grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
			gap: 12px;
		}

		.stat-card {
			padding: 14px;
		}

		.stat-value {
			font-size: 22px;
		}

		.stat-label {
			font-size: 11px;
		}
	}

	@media (min-width: 1024px) {
		.stats-grid {
			grid-template-columns: repeat(5, 1fr);
		}
	}
</style>
