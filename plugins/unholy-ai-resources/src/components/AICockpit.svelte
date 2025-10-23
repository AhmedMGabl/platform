<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { showPopup, showMessage } from '@hcengineering/ui'
  import Button from '@hcengineering/ui/src/components/Button.svelte'
  import Icon from '@hcengineering/ui/src/components/Icon.svelte'
  import { unholyAi, unholyAiId } from '@hcengineering/unholy-ai'
  import AITaskCreator from './AITaskCreator.svelte'
  import AIDocumentAnalyzer from './AIDocumentAnalyzer.svelte'
  import AIChatAssistant from './AIChatAssistant.svelte'
  import AISmartSuggestions from './AISmartSuggestions.svelte'

  const dispatch = createEventDispatcher()

  export let context: any = {}

  function openTaskCreator() {
    showPopup({
      title: 'Create Task with AI',
      content: AITaskCreator,
      props: {
        projectId: context.projectId,
        parentTaskId: context.parentTaskId,
        onCreateTask: (response) => {
          dispatch('taskCreated', response)
          showMessage('Task created successfully with AI!', 'success')
        }
      },
      actions: [],
      closable: true
    })
  }

  function openDocumentAnalyzer() {
    showPopup({
      title: 'AI Document Analysis',
      content: AIDocumentAnalyzer,
      props: {
        content: context.documentContent || '',
        documentType: context.documentType || 'general',
        onAnalyze: (analysis) => {
          dispatch('documentAnalyzed', analysis)
          showMessage('Document analyzed successfully!', 'success')
        }
      },
      actions: [],
      closable: true
    })
  }

  function openChatAssistant() {
    showPopup({
      title: 'AI Assistant',
      content: AIChatAssistant,
      props: {
        context,
        onMessage: (message, response) => {
          dispatch('chatMessage', { message, response })
        }
      },
      actions: [],
      closable: true
    })
  }

  function openSmartSuggestions() {
    showPopup({
      title: 'AI Smart Suggestions',
      content: AISmartSuggestions,
      props: {
        context,
        onSuggestionSelect: (suggestion) => {
          dispatch('suggestionSelected', suggestion)
          showMessage('Suggestion applied!', 'success')
        }
      },
      actions: [],
      closable: true
    })
  }
</script>

<div class="ai-cockpit">
  <div class="cockpit-header">
    <h2>
      <Icon icon={unholyAi.icon.AI} />
      AI Cockpit
    </h2>
    <p>Supercharge your productivity with AI-powered tools</p>
  </div>

  <div class="ai-tools-grid">
    <div class="ai-tool-card" on:click={openTaskCreator}>
      <div class="tool-icon">
        <Icon icon={unholyAi.icon.Sparkles} />
      </div>
      <div class="tool-content">
        <h3>Create Task with AI</h3>
        <p>Transform your ideas into structured tasks with detailed requirements, subtasks, and time estimates.</p>
        <div class="tool-features">
          <span class="feature-tag">📝 Natural Language</span>
          <span class="feature-tag">🎯 Detailed Planning</span>
          <span class="feature-tag">⏱️ Time Estimates</span>
        </div>
      </div>
      <div class="tool-action">
        <Button variant="primary" size="small">
          Launch
        </Button>
      </div>
    </div>

    <div class="ai-tool-card" on:click={openDocumentAnalyzer}>
      <div class="tool-icon">
        📊
      </div>
      <div class="tool-content">
        <h3>Document Analysis</h3>
        <p>Analyze any document to extract insights, action items, and get improvement suggestions.</p>
        <div class="tool-features">
          <span class="feature-tag">🔍 Content Insights</span>
          <span class="feature-tag">✅ Action Items</span>
          <span class="feature-tag">💡 Improvements</span>
        </div>
      </div>
      <div class="tool-action">
        <Button variant="primary" size="small">
          Analyze
        </Button>
      </div>
    </div>

    <div class="ai-tool-card" on:click={openChatAssistant}>
      <div class="tool-icon">
        🤖
      </div>
      <div class="tool-content">
        <h3>AI Assistant</h3>
        <p>Chat with your AI assistant for project guidance, problem-solving, and expert advice.</p>
        <div class="tool-features">
          <span class="feature-tag">💬 Real-time Chat</span>
          <span class="feature-tag">🎯 Context Aware</span>
          <span class="feature-tag">🧠 Smart Suggestions</span>
        </div>
      </div>
      <div class="tool-action">
        <Button variant="primary" size="small">
          Start Chat
        </Button>
      </div>
    </div>

    <div class="ai-tool-card" on:click={openSmartSuggestions}>
      <div class="tool-icon">
        🚀
      </div>
      <div class="tool-content">
        <h3>Smart Suggestions</h3>
        <p>Get contextual AI suggestions for tasks, features, improvements, and risk mitigation.</p>
        <div class="tool-features">
          <span class="feature-tag">💡 Intelligent Ideas</span>
          <span class="feature-tag">⚠️ Risk Analysis</span>
          <span class="feature-tag">🔧 Improvements</span>
        </div>
      </div>
      <div class="tool-action">
        <Button variant="primary" size="small">
          Get Ideas
        </Button>
      </div>
    </div>
  </div>

  <div class="cockpit-footer">
    <div class="ai-status">
      <div class="status-indicator active"></div>
      <span>AI Powered by OpenRouter</span>
    </div>
    <div class="quick-actions">
      <Button variant="ghost" size="small" on:click={openChatAssistant}>
        <Icon icon={unholyAi.icon.AI} />
        Quick AI Chat
      </Button>
    </div>
  </div>
</div>

<style>
  .ai-cockpit {
    background: linear-gradient(135deg, #667eea05 0%, #764ba205 100%);
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .cockpit-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .cockpit-header h2 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 8px;
    color: #1f2937;
    font-size: 2em;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .cockpit-header p {
    color: #6b7280;
    font-size: 1.1em;
    margin: 0;
  }

  .ai-tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .ai-tool-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  .ai-tool-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  .ai-tool-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }

  .ai-tool-card:hover::before {
    transform: scaleX(1);
  }

  .tool-icon {
    font-size: 2.5em;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
    border-radius: 12px;
    color: #667eea;
  }

  .tool-content {
    flex: 1;
    margin-bottom: 20px;
  }

  .tool-content h3 {
    margin: 0 0 8px 0;
    color: #1f2937;
    font-size: 1.2em;
    font-weight: 600;
  }

  .tool-content p {
    color: #6b7280;
    line-height: 1.5;
    margin: 0 0 16px 0;
  }

  .tool-features {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .feature-tag {
    background: #f3f4f6;
    color: #6b7280;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75em;
    font-weight: 500;
  }

  .tool-action {
    display: flex;
    justify-content: flex-end;
  }

  .cockpit-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 24px;
    border-top: 1px solid #e5e7eb;
  }

  .ai-status {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6b7280;
    font-size: 0.9em;
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ef4444;
  }

  .status-indicator.active {
    background: #10b981;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @media (max-width: 768px) {
    .ai-cockpit {
      padding: 16px;
    }

    .cockpit-header h2 {
      font-size: 1.5em;
    }

    .ai-tools-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .cockpit-footer {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }
  }
</style>