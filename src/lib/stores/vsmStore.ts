import { writable, get } from 'svelte/store';
import type { VSMState, VSMStream, VSMActivity, ChatMessage, WorkflowStep, KaizenBurst } from '$lib/types/vsm';

const STORAGE_KEY = 'vsm-state';

const initialState: VSMState = {
	currentStep: 'stream-selection',
	stream: null,
	streams: [],
	currentStreamId: null,
	messages: [
		{
			id: '1',
			role: 'assistant',
			content: "Welcome to VSM Builder! 🎯\n\nYour flow shows START 💡 → Activities → END 😀\n\n✨ Map BACKWARDS from the END:\n• Add activities working from customer (END) to supplier (START)\n• Use '+ Add Activity' button or chat\n• Click any activity to add metrics, kaizen bursts, swimlanes\n• Export as PNG/PDF or JSON\n• Mark constraints with pulsing animation\n\nLet's start! What stream would you like to map?",
			timestamp: Date.now()
		}
	],
	swimlanes: ['Production', 'Quality', 'Planning', 'Shipping']
};

// Load state from localStorage
function loadState(): VSMState {
	if (typeof window === 'undefined') return initialState;

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			// Merge with initial state to ensure new fields exist
			return {
				...initialState,
				...parsed,
				streams: parsed.streams || [],
				swimlanes: parsed.swimlanes || initialState.swimlanes
			};
		}
	} catch (e) {
		console.error('Failed to load VSM state:', e);
	}
	return initialState;
}

// Save state to localStorage
function saveState(state: VSMState) {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch (e) {
		console.error('Failed to save VSM state:', e);
	}
}

function createVSMStore() {
	const { subscribe, set, update } = writable<VSMState>(loadState());

	// Auto-save on every update
	subscribe(state => {
		saveState(state);
	});

	return {
		subscribe,

		// Stream management
		setStream: (stream: VSMStream) => {
			update(state => {
				const streams = state.streams.filter(s => s.id !== stream.id);
				streams.push(stream);
				return {
					...state,
					stream,
					streams,
					currentStreamId: stream.id,
					currentStep: 'add-activities'
				};
			});
		},

		createNewStream: (name: string) => {
			const newStream: VSMStream = {
				id: Date.now().toString(),
				name,
				activities: []
			};
			update(state => ({
				...state,
				stream: newStream,
				streams: [...state.streams, newStream],
				currentStreamId: newStream.id,
				currentStep: 'add-activities'
			}));
		},

		switchStream: (streamId: string) => {
			update(state => {
				const stream = state.streams.find(s => s.id === streamId);
				if (!stream) return state;
				return {
					...state,
					stream,
					currentStreamId: streamId
				};
			});
		},

		deleteStream: (streamId: string) => {
			update(state => {
				const streams = state.streams.filter(s => s.id !== streamId);
				const isCurrentStream = state.currentStreamId === streamId;
				return {
					...state,
					streams,
					stream: isCurrentStream ? null : state.stream,
					currentStreamId: isCurrentStream ? null : state.currentStreamId
				};
			});
		},

		// Activity management
		addActivity: (activity: VSMActivity) => {
			update(state => {
				if (!state.stream) return state;
				const updatedStream = {
					...state.stream,
					activities: [activity, ...state.stream.activities]
				};
				return {
					...state,
					stream: updatedStream,
					streams: state.streams.map(s => s.id === state.stream?.id ? updatedStream : s)
				};
			});
		},

		updateActivity: (activityId: string, updates: Partial<VSMActivity>) => {
			update(state => {
				if (!state.stream) return state;
				const updatedStream = {
					...state.stream,
					activities: state.stream.activities.map(activity =>
						activity.id === activityId ? { ...activity, ...updates } : activity
					)
				};
				return {
					...state,
					stream: updatedStream,
					streams: state.streams.map(s => s.id === state.stream?.id ? updatedStream : s)
				};
			});
		},

		removeActivity: (activityId: string) => {
			update(state => {
				if (!state.stream) return state;
				const updatedStream = {
					...state.stream,
					activities: state.stream.activities.filter(activity => activity.id !== activityId)
				};
				return {
					...state,
					stream: updatedStream,
					streams: state.streams.map(s => s.id === state.stream?.id ? updatedStream : s)
				};
			});
		},

		setConstraint: (activityId: string) => {
			update(state => {
				if (!state.stream) return state;
				const updatedStream = {
					...state.stream,
					activities: state.stream.activities.map(activity => ({
						...activity,
						isConstraint: activity.id === activityId
					}))
				};
				return {
					...state,
					stream: updatedStream,
					streams: state.streams.map(s => s.id === state.stream?.id ? updatedStream : s)
				};
			});
		},

		// Kaizen burst management
		addKaizenBurst: (activityId: string, burst: KaizenBurst) => {
			update(state => {
				if (!state.stream) return state;
				const updatedStream = {
					...state.stream,
					activities: state.stream.activities.map(activity =>
						activity.id === activityId
							? { ...activity, kaizenBursts: [...(activity.kaizenBursts || []), burst] }
							: activity
					)
				};
				return {
					...state,
					stream: updatedStream,
					streams: state.streams.map(s => s.id === state.stream?.id ? updatedStream : s)
				};
			});
		},

		removeKaizenBurst: (activityId: string, burstId: string) => {
			update(state => {
				if (!state.stream) return state;
				const updatedStream = {
					...state.stream,
					activities: state.stream.activities.map(activity =>
						activity.id === activityId
							? { ...activity, kaizenBursts: activity.kaizenBursts?.filter(b => b.id !== burstId) || [] }
							: activity
					)
				};
				return {
					...state,
					stream: updatedStream,
					streams: state.streams.map(s => s.id === state.stream?.id ? updatedStream : s)
				};
			});
		},

		// Swimlane management
		addSwimlane: (name: string) => {
			update(state => ({
				...state,
				swimlanes: [...state.swimlanes, name]
			}));
		},

		removeSwimlane: (name: string) => {
			update(state => ({
				...state,
				swimlanes: state.swimlanes.filter(s => s !== name)
			}));
		},

		// Export/Import
		exportToJSON: (): string => {
			const state = get({ subscribe });
			return JSON.stringify(state, null, 2);
		},

		importFromJSON: (json: string) => {
			try {
				const imported = JSON.parse(json);
				set({
					...initialState,
					...imported,
					streams: imported.streams || [],
					swimlanes: imported.swimlanes || initialState.swimlanes
				});
			} catch (e) {
				console.error('Failed to import VSM data:', e);
				throw new Error('Invalid VSM data format');
			}
		},

		// Chat
		addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
			update(state => ({
				...state,
				messages: [
					...state.messages,
					{
						...message,
						id: Date.now().toString(),
						timestamp: Date.now()
					}
				]
			}));
		},

		setStep: (step: WorkflowStep) => {
			update(state => ({ ...state, currentStep: step }));
		},

		reset: () => {
			set(initialState);
			if (typeof window !== 'undefined') {
				localStorage.removeItem(STORAGE_KEY);
			}
		}
	};
}

export const vsmStore = createVSMStore();
