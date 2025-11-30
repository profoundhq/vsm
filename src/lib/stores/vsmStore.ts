import { writable } from 'svelte/store';
import type { VSMState, VSMStream, VSMActivity, ChatMessage, WorkflowStep } from '$lib/types/vsm';

const initialState: VSMState = {
	currentStep: 'stream-selection',
	stream: null,
	messages: [
		{
			id: '1',
			role: 'assistant',
			content: "Welcome to VSM Builder! Let's create your value stream map working backwards from the end. What stream would you like to map?",
			timestamp: Date.now()
		}
	]
};

function createVSMStore() {
	const { subscribe, set, update } = writable<VSMState>(initialState);

	return {
		subscribe,
		setStream: (stream: VSMStream) => {
			update(state => ({
				...state,
				stream,
				currentStep: 'add-activities'
			}));
		},
		addActivity: (activity: VSMActivity) => {
			update(state => {
				if (!state.stream) return state;
				return {
					...state,
					stream: {
						...state.stream,
						// Add activity at the beginning (working backwards)
						activities: [activity, ...state.stream.activities]
					}
				};
			});
		},
		updateActivity: (activityId: string, updates: Partial<VSMActivity>) => {
			update(state => {
				if (!state.stream) return state;
				return {
					...state,
					stream: {
						...state.stream,
						activities: state.stream.activities.map(activity =>
							activity.id === activityId ? { ...activity, ...updates } : activity
						)
					}
				};
			});
		},
		removeActivity: (activityId: string) => {
			update(state => {
				if (!state.stream) return state;
				return {
					...state,
					stream: {
						...state.stream,
						activities: state.stream.activities.filter(activity => activity.id !== activityId)
					}
				};
			});
		},
		setConstraint: (activityId: string) => {
			update(state => {
				if (!state.stream) return state;
				return {
					...state,
					stream: {
						...state.stream,
						activities: state.stream.activities.map(activity => ({
							...activity,
							isConstraint: activity.id === activityId
						}))
					}
				};
			});
		},
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
		reset: () => set(initialState)
	};
}

export const vsmStore = createVSMStore();
