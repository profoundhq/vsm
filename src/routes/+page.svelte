<script lang="ts">
	import { onMount } from 'svelte';
	import ChatInterface from '$lib/components/ChatInterface.svelte';
	import VSMFlow from '$lib/components/VSMFlow.svelte';
	import NodeToolbar from '$lib/components/NodeToolbar.svelte';
	import StreamManager from '$lib/components/StreamManager.svelte';
	import SidebarMenu from '$lib/components/SidebarMenu.svelte';
	import { vsmStore } from '$lib/stores/vsmStore';

	let showChat = true;
	let presentationMode = false;
	let showSidebar = false;
	let appContainer: HTMLElement;

	function handleReset() {
		if (confirm('Are you sure you want to reset the VSM? This will clear all data.')) {
			vsmStore.reset();
		}
	}

	function toggleChat() {
		showChat = !showChat;
	}

	function toggleSidebar() {
		showSidebar = !showSidebar;
	}

	function closeSidebar() {
		showSidebar = false;
	}

	async function enterPresentationMode() {
		presentationMode = true;
		showChat = false;

		// Try to enter fullscreen
		try {
			if (appContainer && appContainer.requestFullscreen) {
				await appContainer.requestFullscreen();
			}
		} catch (e) {
			console.log('Fullscreen not supported or denied');
		}
	}

	function exitPresentationMode() {
		presentationMode = false;

		// Exit fullscreen if active
		if (document.fullscreenElement) {
			document.exitFullscreen().catch(() => {});
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && presentationMode) {
			exitPresentationMode();
		}
	}

	onMount(() => {
		// Listen for fullscreen changes
		const handleFullscreenChange = () => {
			if (!document.fullscreenElement && presentationMode) {
				presentationMode = false;
			}
		};

		document.addEventListener('fullscreenchange', handleFullscreenChange);

		return () => {
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
		};
	});
</script>

<svelte:head>
	<title>VSM Builder - Value Stream Mapping Tool</title>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="app-container" class:presentation-mode={presentationMode} bind:this={appContainer}>
	{#if !presentationMode}
		<header class="app-header">
			<div class="header-content">
				<div class="title-section">
					<h1>VSM Builder</h1>
					<p class="subtitle">Build your value stream map backwards from the end</p>
				</div>
				<div class="header-actions">
					<StreamManager />
					<button class="menu-button" on:click={toggleSidebar}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="3" y1="6" x2="21" y2="6" />
							<line x1="3" y1="12" x2="21" y2="12" />
							<line x1="3" y1="18" x2="21" y2="18" />
						</svg>
						Menu
					</button>
					<button class="present-button" on:click={enterPresentationMode}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z"/>
						</svg>
						Present
					</button>
				</div>
			</div>
		</header>
	{/if}

	<div class="main-content">
		<main class="flow-panel">
			{#if !presentationMode}
				<NodeToolbar />
			{/if}
			<VSMFlow />
		</main>

		{#if showChat && !presentationMode}
			<aside class="chat-panel">
				<ChatInterface />
			</aside>
		{/if}
	</div>

	{#if presentationMode}
		<button class="exit-presentation" on:click={exitPresentationMode}>
			Exit Presentation (ESC)
		</button>
	{/if}

	<SidebarMenu
		isOpen={showSidebar}
		showChat={showChat}
		onToggleChat={toggleChat}
		onReset={handleReset}
		onClose={closeSidebar}
	/>
</div>

<style>
	/* Mobile-first design */
	.app-container {
		width: 100%;
		max-width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--color-bg-1);
		overflow-x: hidden;
	}

	.app-header {
		background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
		color: white;
		padding: 8px 12px;
		padding-top: max(8px, env(safe-area-inset-top));
		padding-left: max(12px, env(safe-area-inset-left));
		padding-right: max(12px, env(safe-area-inset-right));
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		flex-shrink: 0;
		overflow-x: auto;
	}

	.header-content {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	}

	.title-section {
		min-width: 0;
	}

	.title-section h1 {
		margin: 0;
		font-size: 16px;
		font-weight: 700;
	}

	.subtitle {
		display: none;
	}

	.header-actions {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		width: 100%;
	}

	.menu-button,
	.present-button {
		padding: 6px 10px;
		background: rgba(255, 255, 255, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: white;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 600;
		font-size: 11px;
		transition: background 0.2s;
		white-space: nowrap;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.menu-button:hover,
	.present-button:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.present-button {
		background: rgba(255, 215, 0, 0.3);
		border-color: rgba(255, 215, 0, 0.5);
	}

	.present-button:hover {
		background: rgba(255, 215, 0, 0.4);
	}

	/* Presentation Mode Styles */
	.app-container.presentation-mode {
		background: #ffffff;
	}

	.app-container.presentation-mode .main-content {
		flex: 1;
	}

	.app-container.presentation-mode .flow-panel {
		background: #ffffff;
	}

	.exit-presentation {
		position: fixed;
		top: 16px;
		right: 16px;
		padding: 10px 20px;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
		font-size: 14px;
		z-index: 1000;
		transition: all 0.2s;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.exit-presentation:hover {
		background: rgba(0, 0, 0, 0.9);
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
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
		overflow: auto;
		position: relative;
		min-height: 0;
	}

	.chat-panel {
		background: white;
		flex-shrink: 0;
		padding-bottom: env(safe-area-inset-bottom);
	}

	/* Tablet styles */
	@media (min-width: 640px) {
		.header-content {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			gap: 12px;
		}

		.subtitle {
			display: block;
			margin: 2px 0 0 0;
			font-size: 11px;
			opacity: 0.9;
		}

		.header-actions {
			flex-wrap: nowrap;
			width: auto;
		}
	}

	/* Desktop styles */
	@media (min-width: 768px) {
		.app-header {
			padding: 12px 16px;
			padding-top: max(12px, env(safe-area-inset-top));
			padding-left: max(16px, env(safe-area-inset-left));
			padding-right: max(16px, env(safe-area-inset-right));
		}

		.title-section h1 {
			font-size: 20px;
		}

		.subtitle {
			font-size: 13px;
		}

		.menu-button,
		.present-button {
			padding: 6px 12px;
			font-size: 12px;
		}
	}

	@media (min-width: 1024px) {
		.app-header {
			padding: 16px 24px;
			padding-top: max(16px, env(safe-area-inset-top));
			padding-left: max(24px, env(safe-area-inset-left));
			padding-right: max(24px, env(safe-area-inset-right));
		}

		.title-section h1 {
			font-size: 24px;
		}

		.subtitle {
			font-size: 14px;
		}

		.menu-button,
		.present-button {
			padding: 8px 16px;
			font-size: 14px;
		}
	}
</style>
