import { writable } from 'svelte/store';

interface UIState {
	insertingAfterActivityId: string | null;
}

const initialState: UIState = {
	insertingAfterActivityId: null
};

function createUIStore() {
	const { subscribe, set, update } = writable<UIState>(initialState);

	return {
		subscribe,

		requestInsertAfter: (activityId: string) => {
			update(state => ({
				...state,
				insertingAfterActivityId: activityId
			}));
		},

		clearInsertRequest: () => {
			update(state => ({
				...state,
				insertingAfterActivityId: null
			}));
		}
	};
}

export const uiStore = createUIStore();
