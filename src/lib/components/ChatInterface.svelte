<script lang="ts">
	import { vsmStore } from '$lib/stores/vsmStore';

	let input = '';
	let lastResponse = '';
	let showResponse = false;

	$: currentStep = $vsmStore.currentStep;

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

		showResponseMessage(`Great! We're mapping "${input}". Now let's add activities working backwards from the end. What's the FINAL activity in this stream? (Type "done" when you've added all activities)`);
	}

	function handleAddActivity(input: string) {
		if (input.toLowerCase() === 'done') {
			vsmStore.setStep('add-timing');
			showResponseMessage('Perfect! Now let\'s add timing data. Select an activity and type: "activity [name] process [minutes] lead [minutes]"');
			return;
		}

		vsmStore.addActivity({
			id: Date.now().toString(),
			name: input
		});

		showResponseMessage(`Added "${input}". What's the activity before this one? (Type "done" when finished)`);
	}

	function handleAddTiming(input: string) {
		if (input.toLowerCase() === 'done') {
			vsmStore.setStep('add-dimensions');
			showResponseMessage('Great! Now let\'s add dimensions. Format: "activity [name] value [%] defect [%] changeover [minutes]"');
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
				showResponseMessage(`Updated timing for "${activity.name}". Add more or type "done" to continue.`);
			} else {
				showResponseMessage(`Activity "${name}" not found. Please check the name and try again.`);
			}
		}
	}

	function handleAddDimensions(input: string) {
		if (input.toLowerCase() === 'done') {
			vsmStore.setStep('highlight-constraint');
			showResponseMessage('Final step! Which activity is the constraint? Type the activity name.');
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
				showResponseMessage(`Updated dimensions for "${activity.name}". Add more or type "done" to continue.`);
			}
		}
	}

	function handleHighlightConstraint(input: string) {
		const activity = $vsmStore.stream?.activities.find(a =>
			a.name.toLowerCase().includes(input.toLowerCase())
		);

		if (activity) {
			vsmStore.setConstraint(activity.id);
			showResponseMessage(`"${activity.name}" is now marked as the constraint! Your VSM is complete. You can continue to adjust activities using the flow diagram or type "reset" to start over.`);
		} else {
			showResponseMessage(`Activity "${input}" not found. Please check the name and try again.`);
		}
	}

	function showResponseMessage(message: string) {
		lastResponse = message;
		showResponse = true;
		vsmStore.addMessage({ role: 'assistant', content: message });
	}

	function dismissResponse() {
		showResponse = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}
</script>

<div class="help-input">
	{#if showResponse}
		<div class="response-banner">
			<div class="response-content">{lastResponse}</div>
			<button class="dismiss-btn" on:click={dismissResponse}>×</button>
		</div>
	{/if}

	<div class="input-bar">
		<input
			type="text"
			bind:value={input}
			on:keydown={handleKeydown}
			placeholder="Ask a question or type a command..."
			class="help-input-field"
		/>
		<button on:click={handleSubmit} class="send-button">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="22" y1="2" x2="11" y2="13" />
				<polygon points="22 2 15 22 11 13 2 9 22 2" />
			</svg>
		</button>
	</div>
</div>

<style>
	.help-input {
		position: relative;
		background: white;
		border-top: 1px solid var(--color-border);
	}

	.response-banner {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		padding: 12px 16px;
		background: #f0f7ff;
		border-bottom: 1px solid #d1e7ff;
		animation: slideDown 0.2s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.response-content {
		flex: 1;
		font-size: 13px;
		line-height: 1.4;
		color: #1e40af;
	}

	.dismiss-btn {
		background: none;
		border: none;
		font-size: 24px;
		line-height: 1;
		color: #60a5fa;
		cursor: pointer;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		flex-shrink: 0;
		transition: all 0.2s;
	}

	.dismiss-btn:hover {
		background: rgba(96, 165, 250, 0.1);
		color: #1e40af;
	}

	.input-bar {
		display: flex;
		padding: 12px 16px;
		gap: 8px;
		align-items: center;
	}

	.help-input-field {
		flex: 1;
		padding: 10px 14px;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		font-size: 14px;
		min-width: 0;
		transition: border-color 0.2s;
	}

	.help-input-field:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.help-input-field::placeholder {
		color: #9ca3af;
	}

	.send-button {
		padding: 10px;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: background 0.2s;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.send-button:hover {
		background: #3a7bc8;
	}

	.send-button:active {
		transform: scale(0.95);
	}

	/* Tablet and desktop */
	@media (min-width: 768px) {
		.response-banner {
			padding: 14px 20px;
		}

		.response-content {
			font-size: 14px;
		}

		.input-bar {
			padding: 14px 20px;
			gap: 10px;
		}

		.help-input-field {
			padding: 12px 16px;
			font-size: 15px;
		}

		.send-button {
			padding: 12px;
		}
	}
</style>
