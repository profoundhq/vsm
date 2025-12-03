export type WorkflowStep =
	| 'stream-selection'
	| 'add-activities'
	| 'add-timing'
	| 'add-dimensions'
	| 'highlight-constraint';

export type TimeUnit = 'mins' | 'hours' | 'days';

export interface KaizenBurst {
	id: string;
	description: string;
	priority?: 'low' | 'medium' | 'high';
}

export interface VSMActivity {
	id: string;
	name: string;
	processTime?: number;
	processTimeUnit?: TimeUnit;
	leadTime?: number;
	leadTimeUnit?: TimeUnit;
	dimensions?: {
		value?: number;
		defectRate?: number;
		changeoverTime?: number;
		changeoverTimeUnit?: TimeUnit;
	};
	metrics?: {
		completeAccurate?: number; // % Complete & Accurate
		uptime?: number; // % Uptime/Availability
		operators?: number; // Number of operators
		batchSize?: number; // Batch/lot size
	};
	isConstraint?: boolean;
	kaizenBursts?: KaizenBurst[]; // Improvement opportunities
	swimlane?: string; // Department/role
}

export interface VSMConnection {
	id: string;
	source: string; // Activity ID or 'start-node'
	target: string; // Activity ID or 'end-node'
	label?: string; // Optional label for conditional branches (e.g., "Approved", "Rejected")
}

export interface VSMStream {
	id: string;
	name: string;
	activities: VSMActivity[];
	connections?: VSMConnection[]; // Explicit connections for branching
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
	streams: VSMStream[]; // All saved streams
	currentStreamId: string | null; // Active stream
	messages: ChatMessage[];
	swimlanes: string[]; // Available swimlanes/departments
}
