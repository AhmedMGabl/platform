<script lang="ts">
  import { onMount } from 'svelte'
  import { showPopup, showMessage, type Popup } from '@hcengineering/ui'
  import Button from '@hcengineering/ui/src/components/Button.svelte'
  import Textarea from '@hcengineering/ui/src/components/Textarea.svelte'
  import Icon from '@hcengineering/ui/src/components/Icon.svelte'
  import Spinner from '@hcengineering/ui/src/components/Spinner.svelte'
  import { unholyAi, unholyAiId } from '@hcengineering/unholy-ai'

  export let context: any = {}
  export let onMessage: (message: string, response: any) => void

  let message = ''
  let isLoading = false
  let conversationHistory: Array<{ role: 'user' | 'assistant', content: string }> = []
  let currentResponse: any = null
  let popup: Popup | undefined
  let chatContainer: HTMLElement

  onMount(() => {
    scrollToBottom()
  })

  async function sendMessage() {
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    message = ''
    isLoading = true

    // Add user message to history
    conversationHistory = [...conversationHistory, { role: 'user', content: userMessage }]

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          history: conversationHistory.slice(-10), // Keep last 10 messages for context
          context
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      currentResponse = await response.json()

      // Add AI response to history
      conversationHistory = [
        ...conversationHistory,
        { role: 'assistant', content: currentResponse.response }
      ]

      onMessage(userMessage, currentResponse)

    } catch (error) {
      showMessage('Failed to send message: ' + error.message, 'error')
      // Remove the user message if it failed
      conversationHistory = conversationHistory.slice(0, -1)
    } finally {
      isLoading = false
      setTimeout(scrollToBottom, 100)
    }
  }

  function scrollToBottom() {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }

  function openPopup() {
    conversationHistory = []
    currentResponse = null
    message = ''

    popup = showPopup({
      title: 'AI Assistant',
      content: AIChatAssistant,
      props: {
        context,
        onMessage
      },
      actions: [],
      closable: true
    })
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  function clearChat() {
    conversationHistory = []
    currentResponse = null
  }

  function useSuggestion(suggestion: string) {
    message = suggestion
    sendMessage()
  }
</script>

<div class="ai-chat-assistant">
  <div class="chat-header">
    <div class="header-info">
      <h3>
        <Icon icon={unholyAi.icon.AI} />
        AI Assistant
      </h3>
      <span class="status">Powered by OpenRouter</span>
    </div>
    <Button variant="ghost" size="small" on:click={clearChat}>
      Clear
    </Button>
  </div>

  <div class="chat-container" bind:this={chatContainer}>
    {#if conversationHistory.length === 0}
      <div class="welcome-message">
        <Icon icon={unholyAi.icon.Sparkles} />
        <h4>👋 Welcome to AI Assistant!</h4>
        <p>I'm here to help you with project management, task creation, document analysis, and team collaboration. Ask me anything!</p>

        <div class="example-prompts">
          <h5>Try asking:</h5>
          <div class="prompt-suggestions">
            <button class="suggestion-btn" on:click={() => useSuggestion("Help me create a project plan for a mobile app")}>
              📱 Create a mobile app project plan
            </button>
            <button class="suggestion-btn" on:click={() => useSuggestion("What are the best practices for team collaboration?")}>
              👥 Team collaboration best practices
            </button>
            <button class="suggestion-btn" on:click={() => useSuggestion("How do I analyze project risks?")}>
              ⚠️ Analyze project risks
            </button>
            <button class="suggestion-btn" on:click={() => useSuggestion("Help me write better task descriptions")}>
              ✍️ Improve task descriptions
            </button>
          </div>
        </div>
      </div>
    {:else}
      <div class="messages">
        {#each conversationHistory as msg, index}
          <div class="message {msg.role}" transition:slide={{ duration: 300 }}>
            <div class="message-avatar">
              {#if msg.role === 'user'}
                <div class="user-avatar">👤</div>
              {:else}
                <Icon icon={unholyAi.icon.AI} />
              {/if}
            </div>
            <div class="message-content">
              <div class="message-text">{msg.content}</div>
              {#if msg.role === 'assistant' && index === conversationHistory.length - 1 && currentResponse}
                <div class="ai-additional">
                  {#if currentResponse.suggestions && currentResponse.suggestions.length > 0}
                    <div class="suggestions">
                      <h6>💡 Suggestions:</h6>
                      {#each currentResponse.suggestions as suggestion}
                        <button class="inline-suggestion" on:click={() => useSuggestion(suggestion)}>
                          {suggestion}
                        </button>
                      {/each}
                    </div>
                  {/if}

                  {#if currentResponse.followUpQuestions && currentResponse.followUpQuestions.length > 0}
                    <div class="follow-up">
                      <h6>🤔 Follow-up:</h6>
                      {#each currentResponse.followUpQuestions as question}
                        <button class="follow-up-question" on:click={() => useSuggestion(question)}>
                          {question}
                        </button>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        {/each}

        {#if isLoading}
          <div class="message assistant">
            <div class="message-avatar">
              <Icon icon={unholyAi.icon.AI} />
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <div class="chat-input">
    <div class="input-container">
      <Textarea
        bind:value={message}
        placeholder="Ask me anything about your project..."
        rows={2}
        disabled={isLoading}
        on:keydown={handleKeydown}
        class="chat-textarea"
      />
      <Button
        variant="primary"
        size="small"
        on:click={sendMessage}
        disabled={isLoading || !message.trim()}
        class="send-button"
      >
        {#if isLoading}
          <Spinner size="small" />
        {:else}
          <Icon icon={unholyAi.icon.Sparkles} />
        {/if}
      </Button>
    </div>
    <div class="input-hint">
      Press Enter to send, Shift+Enter for new line
    </div>
  </div>
</div>

<style>
  .ai-chat-assistant {
    width: 600px;
    height: 700px;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .header-info h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1em;
  }

  .status {
    font-size: 0.8em;
    opacity: 0.9;
    margin-top: 2px;
  }

  .chat-container {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #f8fafc;
  }

  .welcome-message {
    text-align: center;
    padding: 40px 20px;
    color: #64748b;
  }

  .welcome-message h4 {
    margin: 16px 0 8px;
    color: #334155;
  }

  .welcome-message p {
    margin-bottom: 32px;
    line-height: 1.6;
  }

  .example-prompts h5 {
    margin-bottom: 16px;
    color: #475569;
  }

  .prompt-suggestions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .suggestion-btn {
    padding: 12px 16px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    text-align: left;
    font-size: 0.9em;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .suggestion-btn:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }

  .messages {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .message {
    display: flex;
    gap: 12px;
    max-width: 100%;
  }

  .message.user {
    flex-direction: row-reverse;
  }

  .message-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .user-avatar {
    background: #3b82f6;
    color: white;
    font-size: 14px;
  }

  .message-content {
    flex: 1;
    min-width: 0;
  }

  .message-text {
    background: white;
    padding: 12px 16px;
    border-radius: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .message.user .message-text {
    background: #3b82f6;
    color: white;
  }

  .message.assistant .message-text {
    border: 1px solid #e2e8f0;
  }

  .ai-additional {
    margin-top: 12px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .suggestions, .follow-up {
    margin-bottom: 12px;
  }

  .suggestions:last-child, .follow-up:last-child {
    margin-bottom: 0;
  }

  .ai-additional h6 {
    margin: 0 0 8px 0;
    font-size: 0.9em;
    color: #64748b;
    font-weight: 600;
  }

  .inline-suggestion, .follow-up-question {
    display: block;
    width: 100%;
    padding: 8px 12px;
    margin: 4px 0;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    text-align: left;
    font-size: 0.85em;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .inline-suggestion:hover, .follow-up-question:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  .typing-indicator {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    width: fit-content;
  }

  .typing-indicator span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #94a3b8;
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

  .chat-input {
    padding: 20px;
    background: white;
    border-top: 1px solid #e2e8f0;
  }

  .input-container {
    display: flex;
    gap: 12px;
    align-items: flex-end;
  }

  .chat-textarea {
    flex: 1;
    resize: none;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
  }

  .send-button {
    height: fit-content;
  }

  .input-hint {
    font-size: 0.75em;
    color: #94a3b8;
    margin-top: 8px;
    text-align: center;
  }

  /* Custom animation for slide effect */
  @keyframes slide {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>