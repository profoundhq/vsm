import type { VSMState } from '$lib/types/vsm';

export function createShareableLink(state: VSMState): string {
	try {
		// Only include essential data for sharing (streams and current stream)
		const shareData = {
			streams: state.streams,
			currentStreamId: state.currentStreamId,
			swimlanes: state.swimlanes
		};

		const json = JSON.stringify(shareData);
		const base64 = btoa(encodeURIComponent(json));

		const url = new URL(window.location.href);
		url.searchParams.set('share', base64);

		return url.toString();
	} catch (e) {
		console.error('Failed to create shareable link:', e);
		throw new Error('Failed to create shareable link');
	}
}

export function loadSharedData(): any | null {
	try {
		if (typeof window === 'undefined') return null;

		const url = new URL(window.location.href);
		const shareParam = url.searchParams.get('share');

		if (!shareParam) return null;

		const json = decodeURIComponent(atob(shareParam));
		return JSON.parse(json);
	} catch (e) {
		console.error('Failed to load shared data:', e);
		return null;
	}
}

export function clearShareParam() {
	if (typeof window === 'undefined') return;

	const url = new URL(window.location.href);
	url.searchParams.delete('share');
	window.history.replaceState({}, '', url.toString());
}
