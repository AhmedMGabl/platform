<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { showPopup } from '@hcengineering/ui'
  import Button from '@hcengineering/ui/src/components/Button.svelte'
  import Icon from '@hcengineering/ui/src/components/Icon.svelte'
  import { unholyAi, unholyAiId } from '@hcengineering/unholy-ai'
  import UnholyCommandCenter from './UnholyCommandCenter.svelte'
  import MeetingBotManager from './MeetingBotManager.svelte'
  import AIChatAssistant from './AIChatAssistant.svelte'
  import AITaskCreator from './AITaskCreator.svelte'
  import AIDocumentAnalyzer from './AIDocumentAnalyzer.svelte'

  const dispatch = createEventDispatcher()

  function openUnholyCommandCenter() {
    showPopup({
      title: '🌟 UNHOLY AI Command Center',
      content: UnholyCommandCenter,
      props: {},
      actions: [],
      closable: true,
      width: '90vw',
      height: '90vh'
    })
  }

  function openAIChat() {
    showPopup({
      title: '🤖 AI Chat Assistant',
      content: AIChatAssistant,
      props: {},
      actions: [],
      closable: true,
      width: '600px',
      height: '700px'
    })
  }

  function openTaskCreator() {
    showPopup({
      title: '✨ Create Task with AI',
      content: AITaskCreator,
      props: {
        onCreateTask: (task) => {
          console.log('Task created:', task)
        }
      },
      actions: [],
      closable: true
    })
  }

  function openDocumentAnalyzer() {
    showPopup({
      title: '📊 AI Document Analysis',
      content: AIDocumentAnalyzer,
      props: {
        onAnalyze: (analysis) => {
          console.log('Document analyzed:', analysis)
        }
      },
      actions: [],
      closable: true,
      width: '800px'
    })
  }

  function openMeetingBot() {
    showPopup({
      title: '🤖 Meeting Bot Manager',
      content: MeetingBotManager,
      props: {},
      actions: [],
      closable: true,
      width: '90vw'
    })
  }
</script>

<div class="ai-navigation">
  <div class="ai-header">
    <h3>
      <Icon icon={unholyAi.icon.AI} />
      UNHOLY AI
    </h3>
    <div class="ai-status">
      <div class="status-indicator active"></div>
      <span>AI Active</span>
    </div>
  </div>

  <div class="ai-actions">
    <Button
      variant="primary"
      size="small"
      on:click={openUnholyCommandCenter}
      class="ai-button primary"
    >
      <Icon icon={unholyAi.icon.Sparkles} />
      Command Center
    </Button>

    <Button
      variant="outline"
      size="small"
      on:click={openAIChat}
      class="ai-button"
    >
      <Icon icon={unholyAi.icon.AI} />
      AI Chat
    </Button>

    <Button
      variant="outline"
      size="small"
      on:click={openTaskCreator}
      class="ai-button"
    >
      <Icon icon={unholyAi.icon.Sparkles} />
      Create Task
    </Button>

    <Button
      variant="outline"
      size="small"
      on:click={openDocumentAnalyzer}
      class="ai-button"
    >
      <Icon icon={unholyAi.icon.Sparkles} />
      Analyze Doc
    </Button>

    <Button
      variant="outline"
      size="small"
      on:click={openMeetingBot}
      class="ai-button"
    >
      <Icon icon={unholyAi.icon.MeetingBot} />
      Meeting Bot
    </Button>
  </div>

  <div class="ai-quick-actions">
    <div class="quick-title">Quick Commands:</div>
    <div class="quick-commands">
      <button
        class="quick-btn"
        on:click={() => openUnholyCommandCenter()}
      >
        🎤 Talk to AI
      </button>
      <button
        class="quick-btn"
        on:click={() => openTaskCreator()}
      >
        ✅ Add Task
      </button>
      <button
        class="quick-btn"
        on:click={() => openMeetingBot()}
      >
        🤖 Record Meeting
      </button>
    </div>
  </div>

  <div class="ai-tips">
    <p>💡 <strong>Tip:</strong> Just tell the AI what to do!</p>
    <p>Examples: "Create task to review report by Friday"</p>
    <p>"Schedule meeting with Sarah tomorrow at 3pm"</p>
  </div>
</div>

<style>
  .ai-navigation {
    padding: 20px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 12px;
    color: #ffffff;
    margin-bottom: 16px;
  }

  .ai-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .ai-header h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 1.2em;
    font-weight: 600;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .ai-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85em;
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
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .ai-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }

  .ai-button {
    width: 100%;
    justify-content: flex-start;
    padding: 10px 12px;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .ai-button.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    font-weight: 600;
  }

  .ai-button.primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .ai-button:not(.primary) {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  .ai-button:not(.primary):hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .ai-quick-actions {
    margin-bottom: 20px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .quick-title {
    font-size: 0.9em;
    color: #9ca3af;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .quick-commands {
    display: grid;
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .quick-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #a5b4fc;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85em;
    text-align: left;
  }

  .quick-btn:hover {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.5);
    color: #ffffff;
  }

  .ai-tips {
    font-size: 0.8em;
    color: #6b7280;
    line-height: 1.4;
  }

  .ai-tips p {
    margin: 4px 0;
  }

  .ai-tips strong {
    color: #a5b4fc;
  }
</style>