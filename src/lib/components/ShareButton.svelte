<script lang="ts">
	import { vsmStore } from '$lib/stores/vsmStore';
	import { createShareableLink } from '$lib/utils/shareUtils';

	let showCopied = false;
	let copyTimeout: ReturnType<typeof setTimeout>;

	async function handleShare() {
		try {
			const state = $vsmStore;
			const shareUrl = createShareableLink(state);

			await navigator.clipboard.writeText(shareUrl);

			showCopied = true;
			clearTimeout(copyTimeout);
			copyTimeout = setTimeout(() => {
				showCopied = false;
			}, 2000);
		} catch (e) {
			console.error('Failed to copy share link:', e);
			alert('Failed to create share link');
		}
	}
</script>

<button class="share-button" on:click={handleShare} title="Share VSM">
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
		<circle cx="18" cy="5" r="3" />
		<circle cx="6" cy="12" r="3" />
		<circle cx="18" cy="19" r="3" />
		<line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
		<line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
	</svg>
	{#if showCopied}
		<span class="copied-indicator">Link Copied!</span>
	{:else}
		SHARE
	{/if}
</button>

<style>
	.share-button {
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
		position: relative;
	}

	.share-button:hover {
		background: rgba(255, 255, 255, 0.25);
	}

	.copied-indicator {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		background: var(--color-british-green);
		color: white;
		padding: 4px 8px;
		font-size: 10px;
		white-space: nowrap;
		margin-top: 4px;
		border-radius: 2px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	@media (min-width: 640px) {
		.share-button {
			padding: 8px 14px;
			font-size: 12px;
			letter-spacing: 0.75px;
		}
	}

	@media (min-width: 1024px) {
		.share-button {
			padding: 10px 20px;
			font-size: 14px;
			letter-spacing: 1px;
		}
	}
</style>
