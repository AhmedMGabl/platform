<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  import { showPopup, showMessage } from '@hcengineering/ui'
  import Button from '@hcengineering/ui/src/components/Button.svelte'
  import Textarea from '@hcengineering/ui/src/components/Textarea.svelte'
  import Icon from '@hcengineering/ui/src/components/Icon.svelte'
  import Spinner from '@hcengineering/ui/src/components/Spinner.svelte'
  import { unholyAi, unholyAiId } from '@hcengineering/unholy-ai'

  const dispatch = createEventDispatcher()

  let inputText = ''
  let isProcessing = false
  let conversationHistory = []
  let proactiveSuggestions = []
  let commandHistory = []
  let chatContainer: HTMLElement
  let voiceRecognition = null
  let isListening = false

  // Sample commands to inspire users
  const exampleCommands = [
    "Create a task to review the Q1 financial report by Friday",
    "Schedule a meeting with Sarah tomorrow at 3pm to discuss the project",
    "Assign the bug fix task to John and set it as high priority",
    "Generate a weekly progress report for the development team",
    "Create a new project for the mobile app development",
    "Send a message to the team about the deadline change",
    "Schedule an AI bot to record tomorrow's standup meeting",
    "Analyze the user engagement data from last month",
    "Create a workflow to automatically assign incoming bugs",
    "Add a deadline to the UI design task for next Monday"
  ]

  onMount(() => {
    loadCommandHistory()
    loadProactiveSuggestions()
    initializeVoiceRecognition()
    scrollToBottom()
  })

  async function processCommand() {
    if (!inputText.trim() || isProcessing) return

    const commandText = inputText.trim()
    inputText = ''
    isProcessing = true

    // Add user message to conversation
    addUserMessage(commandText)

    try {
      // Send command to UNHOLY AI Command Center
      const response = await fetch('/api/ai/unholy-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          command: commandText,
          context: {
            history: conversationHistory.slice(-5),
            currentProject: getCurrentProject(),
            activeTasks: getActiveTasks()
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process command')
      }

      const result = await response.json()

      // Add AI response to conversation
      addAIResponse(result)

      // Show success message
      if (result.success) {
        showMessage(result.message || 'Command executed successfully!', 'success')
      } else {
        showMessage(result.message || 'Command failed', 'error')
      }

      // Refresh proactive suggestions
      loadProactiveSuggestions()

    } catch (error) {
      showMessage('Failed to process command: ' + error.message, 'error')
      addErrorMessage(error.message)
    } finally {
      isProcessing = false
      setTimeout(scrollToBottom, 100)
    }
  }

  async function loadProactiveSuggestions() {
    try {
      const response = await fetch('/api/ai/proactive-suggestions')
      if (response.ok) {
        proactiveSuggestions = await response.json()
      }
    } catch (error) {
      console.warn('Failed to load proactive suggestions:', error)
    }
  }

  async function loadCommandHistory() {
    try {
      const response = await fetch('/api/ai/command-history')
      if (response.ok) {
        commandHistory = await response.json()
      }
    } catch (error) {
      console.warn('Failed to load command history:', error)
    }
  }

  function addUserMessage(text: string) {
    conversationHistory.push({
      type: 'user',
      text,
      timestamp: Date.now()
    })
  }

  function addAIResponse(result: any) {
    conversationHistory.push({
      type: 'ai',
      result,
      timestamp: Date.now()
    })
  }

  function addErrorMessage(error: string) {
    conversationHistory.push({
      type: 'error',
      text: error,
      timestamp: Date.now()
    })
  }

  function scrollToBottom() {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }

  function initializeVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      voiceRecognition = new SpeechRecognition()
      voiceRecognition.continuous = false
      voiceRecognition.interimResults = false
      voiceRecognition.lang = 'en-US'

      voiceRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        inputText = transcript
        isListening = false
      }

      voiceRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        isListening = false
        showMessage('Voice recognition failed. Please try again.', 'error')
      }

      voiceRecognition.onend = () => {
        isListening = false
      }
    }
  }

  function toggleVoiceRecognition() {
    if (!voiceRecognition) {
      showMessage('Voice recognition is not supported in your browser.', 'error')
      return
    }

    if (isListening) {
      voiceRecognition.stop()
      isListening = false
    } else {
      voiceRecognition.start()
      isListening = true
    }
  }

  function useExampleCommand(command: string) {
    inputText = command
    processCommand()
  }

  function clearConversation() {
    conversationHistory = []
    showMessage('Conversation cleared', 'info')
  }

  function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  function getCommandIcon(type: string): string {
    switch (type) {
      case 'task_created': return '✅'
      case 'meeting_created': return '📅'
      case 'bot_scheduled': return '🤖'
      case 'task_assigned': return '🎯'
      case 'project_created': return '🚀'
      case 'message_sent': return '💬'
      case 'report_generated': return '📊'
      case 'data_analyzed': return '🔍'
      case 'workflow_created': return '⚡'
      default: return '🌟'
    }
  }

  function executeProactiveSuggestion(suggestion: string) {
    inputText = suggestion
    processCommand()
  }

  // Placeholder functions for context
  function getCurrentProject(): string {
    return 'Current Project'
  }

  function getActiveTasks(): string[] {
    return ['Task 1', 'Task 2']
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      processCommand()
    }
  }
</script>

<div class="unholy-command-center">
  <div class="command-header">
    <div class="header-content">
      <h1>
        <span class="unholy-logo">🌟</span>
        UNHOLY AI COMMAND CENTER
      </h1>
      <p>Tell me what to do and I'll MAKE IT HAPPEN!</p>
    </div>
    <div class="header-actions">
      <Button variant="ghost" size="small" on:click={clearConversation}>
        Clear Chat
      </Button>
    </div>
  </div>

  <!-- Proactive Suggestions -->
  {#if proactiveSuggestions.length > 0}
    <div class="proactive-suggestions">
      <h3>💡 UNHOLY Suggestions</h3>
      <div class="suggestions-grid">
        {#each proactiveSuggestions as suggestion}
          <button
            class="suggestion-card"
            on:click={() => executeProactiveSuggestion(suggestion.originalText)}
          >
            <span class="suggestion-icon">🌟</span>
            <span class="suggestion-text">{suggestion.originalText}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Conversation Area -->
  <div class="chat-container" bind:this={chatContainer}>
    {#if conversationHistory.length === 0}
      <div class="welcome-screen">
        <div class="welcome-icon">🌟</div>
        <h2>Welcome to UNHOLY AI!</h2>
        <p>I'm your personal AI assistant that can actually DO things!</p>

        <div class="example-commands">
          <h3>Try saying things like:</h3>
          <div class="examples-grid">
            {#each exampleCommands as command}
              <button
                class="example-button"
                on:click={() => useExampleCommand(command)}
              >
                "{command}"
              </button>
            {/each}
          </div>
        </div>

        <div class="voice-section">
          <p>Or click the microphone and speak naturally!</p>
        </div>
      </div>
    {:else}
      <div class="conversation">
        {#each conversationHistory as message}
          <div class="message {message.type}" transition:slide={{ duration: 300 }}>
            <div class="message-header">
              <span class="message-time">{formatTime(message.timestamp)}</span>
              <span class="message-sender">
                {#if message.type === 'user'}
                  👤 You
                {:else if message.type === 'error'}
                  ❌ Error
                {:else}
                  🤖 UNHOLY AI
                {/if}
              </span>
            </div>

            <div class="message-content">
              {#if message.type === 'user'}
                <div class="user-text">{message.text}</div>
              {:else if message.type === 'error'}
                <div class="error-text">{message.text}</div>
              {:else}
                <div class="ai-response">
                  <div class="action-result">
                    <span class="action-icon">{getCommandIcon(message.result.action)}</span>
                    <span class="action-message">{message.result.message}</span>
                  </div>

                  {#if message.result.followUpActions && message.result.followUpActions.length > 0}
                    <div class="follow-up-actions">
                      <h4>💡 Follow-up suggestions:</h4>
                      {#each message.result.followUpActions as action}
                        <button
                          class="follow-up-button"
                          on:click={() => { inputText = action; processCommand(); }}
                        >
                          {action}
                        </button>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        {/each}

        {#if isProcessing}
          <div class="message ai processing">
            <div class="message-header">
              <span class="message-time">{formatTime(Date.now())}</span>
              <span class="message-sender">🤖 UNHOLY AI</span>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p class="processing-text">Executing your command...</p>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Command Input -->
  <div class="command-input">
    <div class="input-container">
      <div class="input-wrapper">
        <Textarea
          bind:value={inputText}
          placeholder="Tell me what to do... (e.g., 'Create a task to review the report by Friday')"
          rows={2}
          disabled={isProcessing}
          on:keydown={handleKeydown}
          class="command-textarea"
        />
        <div class="input-actions">
          <Button
            variant="ghost"
            size="small"
            on:click={toggleVoiceRecognition}
            disabled={isProcessing}
            class="voice-button {isListening ? 'listening' : ''}"
          >
            {#if isListening}
              🎙️ Listening...
            {:else}
              🎙️
            {/if}
          </Button>
          <Button
            variant="primary"
            on:click={processCommand}
            disabled={isProcessing || !inputText.trim()}
            class="execute-button"
          >
            {#if isProcessing}
              <Spinner size="small" />
              Executing...
            {:else}
              🌟 Execute
            {/if}
          </Button>
        </div>
      </div>
    </div>
    <div class="input-hint">
      💡 Press Enter to execute, Shift+Enter for new line • Use voice recognition for hands-free commands
    </div>
  </div>
</div>

<style>
  .unholy-command-center {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .command-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header-content h1 {
    margin: 0 0 4px 0;
    font-size: 1.8em;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .unholy-logo {
    font-size: 1.2em;
    animation: glow 2s ease-in-out infinite alternate;
  }

  @keyframes glow {
    from { filter: drop-shadow(0 0 5px #667eea); }
    to { filter: drop-shadow(0 0 20px #764ba2); }
  }

  .header-content p {
    margin: 0;
    color: #9ca3af;
    font-size: 1.1em;
  }

  .proactive-suggestions {
    padding: 16px 24px;
    background: rgba(102, 126, 234, 0.1);
    border-bottom: 1px solid rgba(102, 126, 234, 0.3);
  }

  .proactive-suggestions h3 {
    margin: 0 0 12px 0;
    color: #a5b4fc;
    font-size: 1em;
    font-weight: 600;
  }

  .suggestions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 12px;
  }

  .suggestion-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .suggestion-card:hover {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.5);
    transform: translateY(-1px);
  }

  .suggestion-icon {
    font-size: 1.2em;
  }

  .suggestion-text {
    flex: 1;
    font-size: 0.9em;
    line-height: 1.4;
  }

  .chat-container {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
  }

  .welcome-screen {
    text-align: center;
    padding: 60px 20px;
    max-width: 800px;
    margin: 0 auto;
  }

  .welcome-icon {
    font-size: 4em;
    margin-bottom: 20px;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  .welcome-screen h2 {
    margin: 0 0 12px 0;
    font-size: 2.5em;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .welcome-screen > p {
    margin: 0 0 40px 0;
    font-size: 1.3em;
    color: #9ca3af;
  }

  .example-commands h3 {
    margin: 0 0 20px 0;
    color: #d1d5db;
    font-size: 1.2em;
  }

  .examples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 12px;
    margin-bottom: 40px;
  }

  .example-button {
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #a5b4fc;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9em;
    text-align: left;
  }

  .example-button:hover {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.5);
    color: #ffffff;
    transform: translateY(-1px);
  }

  .voice-section p {
    color: #9ca3af;
    font-size: 1.1em;
  }

  .conversation {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 800px;
    margin: 0 auto;
  }

  .message {
    display: flex;
    flex-direction: column;
    gap: 8px;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .message-time {
    color: #6b7280;
    font-size: 0.85em;
  }

  .message-sender {
    font-weight: 600;
    color: #a5b4fc;
    font-size: 0.9em;
  }

  .message-content {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
  }

  .message.user .message-content {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.3);
    margin-left: 60px;
  }

  .message.ai .message-content {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    margin-right: 60px;
  }

  .message.error .message-content {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    margin-right: 60px;
  }

  .user-text {
    color: #ffffff;
    line-height: 1.5;
  }

  .error-text {
    color: #fca5a5;
    line-height: 1.5;
  }

  .action-result {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .action-icon {
    font-size: 1.5em;
  }

  .action-message {
    color: #86efac;
    font-weight: 500;
    line-height: 1.5;
  }

  .follow-up-actions {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .follow-up-actions h4 {
    margin: 0 0 8px 0;
    color: #fbbf24;
    font-size: 0.9em;
  }

  .follow-up-button {
    display: block;
    width: 100%;
    padding: 8px 12px;
    margin-bottom: 6px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #d1d5db;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85em;
    text-align: left;
  }

  .follow-up-button:hover {
    background: rgba(251, 191, 36, 0.2);
    border-color: rgba(251, 191, 36, 0.3);
    color: #ffffff;
  }

  .message.processing {
    opacity: 0.7;
  }

  .typing-indicator {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
  }

  .typing-indicator span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    animation: typing 1.4s infinite ease-in-out;
  }

  .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
  .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

  @keyframes typing {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .processing-text {
    margin: 0;
    color: #9ca3af;
    font-style: italic;
  }

  .command-input {
    padding: 20px 24px;
    background: rgba(0, 0, 0, 0.3);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .input-wrapper {
    display: flex;
    gap: 12px;
    align-items: flex-end;
  }

  .command-textarea {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #ffffff;
    padding: 12px 16px;
    font-size: 1em;
    resize: none;
    transition: all 0.2s ease;
  }

  .command-textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }

  .command-textarea::placeholder {
    color: #6b7280;
  }

  .input-actions {
    display: flex;
    gap: 8px;
  }

  .voice-button {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .voice-button.listening {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
    animation: pulse-red 1.5s infinite;
  }

  @keyframes pulse-red {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
    50% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  }

  .execute-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    font-weight: 600;
  }

  .input-hint {
    margin-top: 8px;
    text-align: center;
    color: #6b7280;
    font-size: 0.85em;
  }

  @media (max-width: 768px) {
    .command-header {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }

    .welcome-screen {
      padding: 40px 16px;
    }

    .welcome-screen h2 {
      font-size: 2em;
    }

    .examples-grid {
      grid-template-columns: 1fr;
    }

    .suggestions-grid {
      grid-template-columns: 1fr;
    }

    .message.user .message-content {
      margin-left: 20px;
    }

    .message.ai .message-content,
    .message.error .message-content {
      margin-right: 20px;
    }

    .input-wrapper {
      flex-direction: column;
      gap: 12px;
    }

    .input-actions {
      justify-content: center;
    }
  }
</style>