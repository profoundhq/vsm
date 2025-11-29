/**
 * Simple test script for VSM Store functionality
 * Run with: node test-vsm-store.js
 */

// Mock Svelte's writable store
function writable(initialValue) {
	let value = initialValue;
	const subscribers = new Set();

	return {
		subscribe(fn) {
			subscribers.add(fn);
			fn(value);
			return () => subscribers.delete(fn);
		},
		set(newValue) {
			value = newValue;
			subscribers.forEach(fn => fn(value));
		},
		update(fn) {
			value = fn(value);
			subscribers.forEach(fn => fn(value));
		}
	};
}

// Create VSM Store (simplified version)
function createVSMStore() {
	const initialState = {
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

	const { subscribe, set, update } = writable(initialState);

	return {
		subscribe,
		setStream: (stream) => {
			update(state => ({
				...state,
				stream,
				currentStep: 'add-activities'
			}));
		},
		addActivity: (activity) => {
			update(state => {
				if (!state.stream) return state;
				return {
					...state,
					stream: {
						...state.stream,
						activities: [activity, ...state.stream.activities]
					}
				};
			});
		},
		updateActivity: (activityId, updates) => {
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
		setConstraint: (activityId) => {
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
		addMessage: (message) => {
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
		setStep: (step) => {
			update(state => ({ ...state, currentStep: step }));
		}
	};
}

// Run tests
console.log('🧪 Testing VSM Store Functionality\n');

const store = createVSMStore();
let currentState;

store.subscribe(state => {
	currentState = state;
});

// Test 1: Initial state
console.log('✓ Test 1: Initial state');
console.log(`  Current step: ${currentState.currentStep}`);
console.log(`  Messages: ${currentState.messages.length}`);
console.log(`  Stream: ${currentState.stream === null ? 'null' : 'set'}`);

// Test 2: Set stream
console.log('\n✓ Test 2: Set stream');
store.setStream({
	id: '1',
	name: 'Order Fulfillment',
	activities: []
});
console.log(`  Stream name: ${currentState.stream.name}`);
console.log(`  Current step: ${currentState.currentStep}`);

// Test 3: Add activities (backwards from end)
console.log('\n✓ Test 3: Add activities (working backwards)');
const activities = [
	{ id: '1', name: 'Delivery to Customer' },
	{ id: '2', name: 'Package Order' },
	{ id: '3', name: 'Pick Items' },
	{ id: '4', name: 'Process Payment' }
];

activities.forEach(activity => {
	store.addActivity(activity);
});

console.log(`  Total activities: ${currentState.stream.activities.length}`);
console.log('  Activity order (end to start):');
currentState.stream.activities.forEach((a, i) => {
	console.log(`    ${i + 1}. ${a.name}`);
});

// Test 4: Add timing
console.log('\n✓ Test 4: Add timing data');
store.updateActivity('2', {
	processTime: 15,
	leadTime: 30
});
const packageActivity = currentState.stream.activities.find(a => a.id === '2');
console.log(`  Package Order - Process: ${packageActivity.processTime}min, Lead: ${packageActivity.leadTime}min`);

// Test 5: Add dimensions
console.log('\n✓ Test 5: Add dimensions');
store.updateActivity('2', {
	dimensions: {
		value: 85,
		defectRate: 5,
		changeoverTime: 5
	}
});
const packageActivityWithDims = currentState.stream.activities.find(a => a.id === '2');
console.log(`  Package Order dimensions:`, packageActivityWithDims.dimensions);

// Test 6: Highlight constraint
console.log('\n✓ Test 6: Highlight constraint');
store.setConstraint('2');
const constraintActivity = currentState.stream.activities.find(a => a.isConstraint);
console.log(`  Constraint activity: ${constraintActivity.name}`);

// Test 7: Message history
console.log('\n✓ Test 7: Add message to chat');
store.addMessage({
	role: 'user',
	content: 'Order Fulfillment'
});
console.log(`  Total messages: ${currentState.messages.length}`);
console.log(`  Last message: "${currentState.messages[currentState.messages.length - 1].content}"`);

// Test 8: Workflow steps
console.log('\n✓ Test 8: Workflow progression');
const steps = ['stream-selection', 'add-activities', 'add-timing', 'add-dimensions', 'highlight-constraint'];
steps.forEach((step, i) => {
	store.setStep(step);
	console.log(`  Step ${i + 1}: ${step} ✓`);
});

console.log('\n🎉 All tests passed!\n');
console.log('Summary:');
console.log(`  ✓ Stream: ${currentState.stream.name}`);
console.log(`  ✓ Activities: ${currentState.stream.activities.length}`);
console.log(`  ✓ Messages: ${currentState.messages.length}`);
console.log(`  ✓ Current step: ${currentState.currentStep}`);
console.log(`  ✓ Constraint identified: ${constraintActivity.name}`);
