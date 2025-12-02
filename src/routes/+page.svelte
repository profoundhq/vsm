<script lang="ts">
	import { onMount } from 'svelte';
	import VSMFlow from '$lib/components/VSMFlow.svelte';
	import NodeToolbar from '$lib/components/NodeToolbar.svelte';
	import StreamManager from '$lib/components/StreamManager.svelte';
	import SidebarMenu from '$lib/components/SidebarMenu.svelte';
	import { vsmStore } from '$lib/stores/vsmStore';

	let presentationMode = false;
	let showSidebar = false;
	let appContainer: HTMLElement;

	function handleReset() {
		if (confirm('Are you sure you want to reset the VSM? This will clear all data.')) {
			vsmStore.reset();
		}
	}

	function toggleSidebar() {
		showSidebar = !showSidebar;
	}

	function closeSidebar() {
		showSidebar = false;
	}

	async function enterPresentationMode() {
		presentationMode = true;

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
	<title>Throughline - Value Stream Mapping Tool</title>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="app-container" class:presentation-mode={presentationMode} bind:this={appContainer}>
	{#if !presentationMode}
		<header class="app-header">
			<div class="header-content">
				<div class="title-section">
					<div class="logo">
						<span class="double-arrow">→←</span>
						<h1>THROUGHLINE</h1>
					</div>
					<p class="subtitle">VISUALISING YOUR DELIVERY PIPELINE</p>
				</div>
				<div class="header-actions">
					<StreamManager />
					<button class="menu-button" on:click={toggleSidebar}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="3" y1="6" x2="21" y2="6" />
							<line x1="3" y1="12" x2="21" y2="12" />
							<line x1="3" y1="18" x2="21" y2="18" />
						</svg>
						MENU
					</button>
					<button class="present-button" on:click={enterPresentationMode}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z"/>
						</svg>
						PRESENT
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
			<div class="flow-container">
				<VSMFlow />
			</div>
		</main>
	</div>

	{#if presentationMode}
		<button class="exit-presentation" on:click={exitPresentationMode}>
			Exit Presentation (ESC)
		</button>
	{/if}

	<SidebarMenu
		isOpen={showSidebar}
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
		background: var(--color-british-blue);
		color: white;
		padding: 8px 12px;
		padding-top: max(8px, env(safe-area-inset-top));
		padding-left: max(12px, env(safe-area-inset-left));
		padding-right: max(12px, env(safe-area-inset-right));
		border-bottom: 6px solid var(--color-british-gold);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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

	.logo {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.double-arrow {
		font-size: 24px;
		font-weight: bold;
		letter-spacing: -5px;
	}

	.title-section h1 {
		margin: 0;
		font-size: 16px;
		font-weight: 700;
		letter-spacing: 1px;
	}

	.subtitle {
		display: none;
		font-size: 10px;
		opacity: 0.9;
		letter-spacing: 0.5px;
		margin-top: 4px;
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
		background: rgba(255, 255, 255, 0.15);
		border: none;
		color: white;
		border-radius: 0;
		cursor: pointer;
		font-weight: 600;
		font-size: 11px;
		letter-spacing: 0.5px;
		transition: background 0.2s;
		white-space: nowrap;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: 'IBM Plex Sans', sans-serif;
	}

	.menu-button:hover,
	.present-button:hover {
		background: rgba(255, 255, 255, 0.25);
	}

	.present-button {
		background: var(--color-british-gold);
		color: var(--color-british-blue);
	}

	.present-button:hover {
		background: #FFE44D;
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
		display: flex;
		flex-direction: column;
		position: relative;
		min-height: 0;
		overflow: hidden;
	}

	.flow-container {
		flex: 1;
		min-height: 0;
		position: relative;
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
			padding: 16px 24px;
			padding-top: max(16px, env(safe-area-inset-top));
			padding-left: max(24px, env(safe-area-inset-left));
			padding-right: max(24px, env(safe-area-inset-right));
			border-bottom: 8px solid var(--color-british-gold);
		}

		.double-arrow {
			font-size: 36px;
			letter-spacing: -8px;
		}

		.title-section h1 {
			font-size: 22px;
			letter-spacing: 1.5px;
		}

		.subtitle {
			display: block;
			font-size: 11px;
		}

		.menu-button,
		.present-button {
			padding: 8px 14px;
			font-size: 12px;
			letter-spacing: 0.75px;
		}
	}

	@media (min-width: 1024px) {
		.app-header {
			padding: 20px 40px;
			padding-top: max(20px, env(safe-area-inset-top));
			padding-left: max(40px, env(safe-area-inset-left));
			padding-right: max(40px, env(safe-area-inset-right));
		}

		.double-arrow {
			font-size: 48px;
			letter-spacing: -10px;
		}

		.title-section h1 {
			font-size: 28px;
			letter-spacing: 2px;
		}

		.subtitle {
			font-size: 13px;
			letter-spacing: 1px;
		}

		.menu-button,
		.present-button {
			padding: 10px 20px;
			font-size: 14px;
			letter-spacing: 1px;
		}
	}
</style>
