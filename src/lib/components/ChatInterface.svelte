<script lang="ts">
	import { vsmStore } from '$lib/stores/vsmStore';
	import type { WorkflowStep } from '$lib/types/vsm';

	let input = '';
	let messagesContainer: HTMLDivElement;

	$: messages = $vsmStore.messages;
	$: currentStep = $vsmStore.currentStep;

	$: {
		if (messagesContainer) {
			setTimeout(() => {
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			}, 0);
		}
	}

	function handleSubmit() {
		if (!input.trim()) return;

		vsmStore.addMessage({ role: 'user', content: input });
		processUserInput(input.trim());
		input = '';
	}

	function processUserInput(userInput: string) {
		const lowerInput = userInput.toLowerCase();

		switch (currentStep) {
			case 'stream-selection':
				handleStreamSelection(userInput);
				break;
			case 'add-activities':
				handleAddActivity(userInput);
				break;
			case 'add-timing':
				handleAddTiming(userInput);
				break;
			case 'add-dimensions':
				handleAddDimensions(userInput);
				break;
			case 'highlight-constraint':
				handleHighlightConstraint(userInput);
				break;
		}
	}

	function handleStreamSelection(input: string) {
		vsmStore.setStream({
			id: Date.now().toString(),
			name: input,
			activities: []
		});

		vsmStore.addMessage({
			role: 'assistant',
			content: `Great! We're mapping "${input}". Now let's add activities working backwards from the end. What's the FINAL activity in this stream? (Type "done" when you've added all activities)`
		});
	}

	function handleAddActivity(input: string) {
		if (input.toLowerCase() === 'done') {
			vsmStore.setStep('add-timing');
			vsmStore.addMessage({
				role: 'assistant',
				content: 'Perfect! Now let\'s add timing data. Select an activity and type: "activity [name] process [minutes] lead [minutes]"'
			});
			return;
		}

		vsmStore.addActivity({
			id: Date.now().toString(),
			name: input
		});

		vsmStore.addMessage({
			role: 'assistant',
			content: `Added "${input}". What's the activity before this one? (Type "done" when finished)`
		});
	}

	function handleAddTiming(input: string) {
		if (input.toLowerCase() === 'done') {
			vsmStore.setStep('add-dimensions');
			vsmStore.addMessage({
				role: 'assistant',
				content: 'Great! Now let\'s add dimensions. Format: "activity [name] value [%] defect [%] changeover [minutes]"'
			});
			return;
		}

		// Parse timing: "activity [name] process [time] lead [time]"
		const activityMatch = input.match(/activity\s+(.+?)\s+process\s+(\d+)\s+lead\s+(\d+)/i);
		if (activityMatch) {
			const [, name, processTime, leadTime] = activityMatch;
			const activity = $vsmStore.stream?.activities.find(a =>
				a.name.toLowerCase().includes(name.toLowerCase())
			);

			if (activity) {
				vsmStore.updateActivity(activity.id, {
					processTime: parseInt(processTime),
					leadTime: parseInt(leadTime)
				});
				vsmStore.addMessage({
					role: 'assistant',
					content: `Updated timing for "${activity.name}". Add more or type "done" to continue.`
				});
			} else {
				vsmStore.addMessage({
					role: 'assistant',
					content: `Activity "${name}" not found. Please check the name and try again.`
				});
			}
		}
	}

	function handleAddDimensions(input: string) {
		if (input.toLowerCase() === 'done') {
			vsmStore.setStep('highlight-constraint');
			vsmStore.addMessage({
				role: 'assistant',
				content: 'Final step! Which activity is the constraint? Type the activity name.'
			});
			return;
		}

		// Parse dimensions: "activity [name] value [%] defect [%] changeover [min]"
		const dimMatch = input.match(/activity\s+(.+?)\s+(?:value\s+(\d+))?\s*(?:defect\s+(\d+))?\s*(?:changeover\s+(\d+))?/i);
		if (dimMatch) {
			const [, name, value, defect, changeover] = dimMatch;
			const activity = $vsmStore.stream?.activities.find(a =>
				a.name.toLowerCase().includes(name.toLowerCase())
			);

			if (activity) {
				vsmStore.updateActivity(activity.id, {
					dimensions: {
						...(value && { value: parseInt(value) }),
						...(defect && { defectRate: parseInt(defect) }),
						...(changeover && { changeoverTime: parseInt(changeover) })
					}
				});
				vsmStore.addMessage({
					role: 'assistant',
					content: `Updated dimensions for "${activity.name}". Add more or type "done" to continue.`
				});
			}
		}
	}

	function handleHighlightConstraint(input: string) {
		const activity = $vsmStore.stream?.activities.find(a =>
			a.name.toLowerCase().includes(input.toLowerCase())
		);

		if (activity) {
			vsmStore.setConstraint(activity.id);
			vsmStore.addMessage({
				role: 'assistant',
				content: `"${activity.name}" is now marked as the constraint! Your VSM is complete. You can continue to adjust activities using the flow diagram or type "reset" to start over.`
			});
		} else {
			vsmStore.addMessage({
				role: 'assistant',
				content: `Activity "${input}" not found. Please check the name and try again.`
			});
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}
</script>

<div class="chat-interface">
	<div class="messages" bind:this={messagesContainer}>
		{#each messages as message (message.id)}
			<div class="message {message.role}">
				<div class="message-content">
					{message.content}
				</div>
			</div>
		{/each}
	</div>

	<div class="input-area">
		<input
			type="text"
			bind:value={input}
			on:keydown={handleKeydown}
			placeholder="Type your response..."
			class="chat-input"
		/>
		<button on:click={handleSubmit} class="send-button">Send</button>
	</div>

	<div class="step-indicator">
		Step: {currentStep.replace('-', ' ').toUpperCase()}
	</div>
</div>

<style>
	/* Mobile-first chat design */
	.chat-interface {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: white;
	}

	.messages {
		flex: 1;
		overflow-y: auto;
		padding: 10px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-height: 0;
	}

	.message {
		display: flex;
		max-width: 85%;
	}

	.message.user {
		align-self: flex-end;
	}

	.message.assistant {
		align-self: flex-start;
	}

	.message-content {
		padding: 8px 12px;
		border-radius: 12px;
		font-size: 13px;
		line-height: 1.4;
	}

	.message.user .message-content {
		background: var(--color-primary);
		color: white;
	}

	.message.assistant .message-content {
		background: var(--color-bg-1);
		color: var(--color-text);
	}

	.input-area {
		display: flex;
		padding: 10px;
		gap: 6px;
		border-top: 1px solid var(--color-border);
		background: white;
	}

	.chat-input {
		flex: 1;
		padding: 8px 10px;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		font-size: 16px;
		min-width: 0;
	}

	.chat-input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.send-button {
		padding: 8px 16px;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
		font-size: 13px;
		transition: background 0.2s;
		flex-shrink: 0;
	}

	.send-button:hover {
		background: #3a7bc8;
	}

	.step-indicator {
		padding: 6px 10px;
		background: var(--color-secondary);
		color: white;
		font-size: 11px;
		font-weight: 600;
		text-align: center;
		flex-shrink: 0;
	}

	/* Tablet and desktop */
	@media (min-width: 768px) {
		.messages {
			padding: 14px;
			gap: 10px;
		}

		.message-content {
			padding: 10px 14px;
			font-size: 14px;
		}

		.input-area {
			padding: 12px 14px;
			gap: 8px;
		}

		.chat-input {
			padding: 10px 12px;
		}

		.send-button {
			padding: 10px 20px;
			font-size: 14px;
		}

		.step-indicator {
			padding: 8px 14px;
			font-size: 12px;
		}
	}
</style>
