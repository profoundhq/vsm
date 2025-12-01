import { writable } from 'svelte/store';

interface UIState {
	insertingAfterActivityId: string | null;
	editModeEnabled: boolean;
}

const initialState: UIState = {
	insertingAfterActivityId: null,
	editModeEnabled: false
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
		},

		toggleEditMode: () => {
			update(state => ({
				...state,
				editModeEnabled: !state.editModeEnabled
			}));
		},

		setEditMode: (enabled: boolean) => {
			update(state => ({
				...state,
				editModeEnabled: enabled
			}));
		}
	};
}

export const uiStore = createUIStore();
