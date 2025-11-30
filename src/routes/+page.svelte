<script lang="ts">
	import ChatInterface from '$lib/components/ChatInterface.svelte';
	import VSMFlow from '$lib/components/VSMFlow.svelte';
	import NodeToolbar from '$lib/components/NodeToolbar.svelte';
	import StreamManager from '$lib/components/StreamManager.svelte';
	import ExportImport from '$lib/components/ExportImport.svelte';
	import DiagramExport from '$lib/components/DiagramExport.svelte';
	import { vsmStore } from '$lib/stores/vsmStore';

	let showChat = true;

	function handleReset() {
		if (confirm('Are you sure you want to reset the VSM? This will clear all data.')) {
			vsmStore.reset();
		}
	}

	function toggleChat() {
		showChat = !showChat;
	}
</script>

<svelte:head>
	<title>VSM Builder - Value Stream Mapping Tool</title>
</svelte:head>

<div class="app-container">
	<header class="app-header">
		<div class="header-content">
			<div class="title-section">
				<h1>VSM Builder</h1>
				<p class="subtitle">Build your value stream map backwards from the end</p>
			</div>
			<div class="header-actions">
				<StreamManager />
				<ExportImport />
				<DiagramExport />
				<button class="toggle-button" on:click={toggleChat}>
					{showChat ? 'Hide' : 'Show'} Chat
				</button>
				<button class="reset-button" on:click={handleReset}>Reset</button>
			</div>
		</div>
	</header>

	<div class="main-content">
		<main class="flow-panel">
			<NodeToolbar />
			<VSMFlow />
		</main>

		{#if showChat}
			<aside class="chat-panel">
				<ChatInterface />
			</aside>
		{/if}
	</div>
</div>

<style>
	/* Mobile-first design */
	.app-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--color-bg-1);
	}

	.app-header {
		background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
		color: white;
		padding: 12px 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		flex-shrink: 0;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
	}

	.title-section h1 {
		margin: 0;
		font-size: 18px;
		font-weight: 700;
	}

	.subtitle {
		margin: 2px 0 0 0;
		font-size: 11px;
		opacity: 0.9;
	}

	.header-actions {
		display: flex;
		gap: 8px;
		flex-shrink: 0;
	}

	.toggle-button,
	.reset-button {
		padding: 6px 12px;
		background: rgba(255, 255, 255, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: white;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 600;
		font-size: 12px;
		transition: background 0.2s;
		white-space: nowrap;
	}

	.toggle-button:hover,
	.reset-button:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		min-height: 0;
	}

	.flow-panel {
		flex: 1;
		overflow: hidden;
		position: relative;
		min-height: 0;
	}

	.chat-panel {
		background: white;
		border-top: 2px solid var(--color-border);
		height: 280px;
		flex-shrink: 0;
		overflow: hidden;
	}

	/* Desktop/tablet styles */
	@media (min-width: 768px) {
		.app-header {
			padding: 16px 24px;
		}

		.title-section h1 {
			font-size: 24px;
		}

		.subtitle {
			font-size: 14px;
		}

		.toggle-button,
		.reset-button {
			padding: 8px 16px;
			font-size: 14px;
		}

		.chat-panel {
			height: 320px;
		}
	}

	@media (min-width: 1024px) {
		.chat-panel {
			height: 350px;
		}
	}
</style>
