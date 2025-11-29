export type WorkflowStep =
	| 'stream-selection'
	| 'add-activities'
	| 'add-timing'
	| 'add-dimensions'
	| 'highlight-constraint';

export interface VSMActivity {
	id: string;
	name: string;
	processTime?: number;
	leadTime?: number;
	dimensions?: {
		value?: number;
		defectRate?: number;
		changeoverTime?: number;
	};
	isConstraint?: boolean;
}

export interface VSMStream {
	id: string;
	name: string;
	activities: VSMActivity[];
}

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
}

export interface VSMState {
	currentStep: WorkflowStep;
	stream: VSMStream | null;
	messages: ChatMessage[];
}
