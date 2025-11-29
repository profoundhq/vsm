<script lang="ts">
	import ChatInterface from '$lib/components/ChatInterface.svelte';
	import VSMFlow from '$lib/components/VSMFlow.svelte';
	import { vsmStore } from '$lib/stores/vsmStore';

	function handleReset() {
		if (confirm('Are you sure you want to reset the VSM? This will clear all data.')) {
			vsmStore.reset();
		}
	}
</script>

<svelte:head>
	<title>VSM Builder - Value Stream Mapping Tool</title>
</svelte:head>

<div class="app-container">
	<header class="app-header">
		<h1>VSM Builder</h1>
		<p class="subtitle">Build your value stream map backwards from the end</p>
		<button class="reset-button" on:click={handleReset}>Reset</button>
	</header>

	<div class="main-content">
		<aside class="chat-panel">
			<ChatInterface />
		</aside>

		<main class="flow-panel">
			<VSMFlow />
		</main>
	</div>
</div>

<style>
	.app-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--color-bg-1);
	}

	.app-header {
		background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
		color: white;
		padding: 16px 24px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		position: relative;
	}

	.app-header h1 {
		margin: 0;
		font-size: 24px;
		font-weight: 700;
	}

	.subtitle {
		margin: 4px 0 0 0;
		font-size: 14px;
		opacity: 0.9;
	}

	.reset-button {
		position: absolute;
		top: 50%;
		right: 24px;
		transform: translateY(-50%);
		padding: 8px 16px;
		background: rgba(255, 255, 255, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: white;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 600;
		transition: background 0.2s;
	}

	.reset-button:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.main-content {
		flex: 1;
		display: grid;
		grid-template-columns: 350px 1fr;
		overflow: hidden;
	}

	.chat-panel {
		background: white;
		overflow: hidden;
	}

	.flow-panel {
		overflow: hidden;
	}

	@media (max-width: 768px) {
		.main-content {
			grid-template-columns: 1fr;
			grid-template-rows: 300px 1fr;
		}
	}
</style>
