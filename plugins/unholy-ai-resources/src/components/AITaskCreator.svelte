<script lang="ts">
  import { showPopup, showMessage, type Popup } from '@hcengineering/ui'
  import Button from '@hcengineering/ui/src/components/Button.svelte'
  import Textarea from '@hcengineering/ui/src/components/Textarea.svelte'
  import Icon from '@hcengineering/ui/src/components/Icon.svelte'
  import Spinner from '@hcengineering/ui/src/components/Spinner.svelte'
  import { unholyAi, unholyAiId } from '@hcengineering/unholy-ai'
  import type { AITaskCreationRequest, AITaskCreationResponse } from '@hcengineering/unholy-ai'

  export let projectId: string | undefined
  export let parentTaskId: string | undefined
  export let onCreateTask: (response: AITaskCreationResponse) => void

  let prompt = ''
  let isGenerating = false
  let generatedResponse: AITaskCreationResponse | null = null
  let popup: Popup | undefined

  async function generateTask() {
    if (!prompt.trim()) {
      showMessage('Please describe what you want to create', 'error')
      return
    }

    isGenerating = true
    generatedResponse = null

    try {
      const request: AITaskCreationRequest = {
        prompt,
        projectId,
        parentTaskId,
        contextData: {
          // Add workspace context here
        }
      }

      // This will call our AI service
      generatedResponse = await fetch('/api/ai/create-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      }).then(res => res.json())

    } catch (error) {
      showMessage('Failed to generate task: ' + error.message, 'error')
    } finally {
      isGenerating = false
    }
  }

  function createTask() {
    if (!generatedResponse) return

    onCreateTask(generatedResponse)
    popup?.hide()
  }

  function openPopup() {
    prompt = ''
    generatedResponse = null

    popup = showPopup({
      title: 'Create Task with AI',
      content: AITaskCreator,
      props: {
        projectId,
        parentTaskId,
        onCreateTask
      },
      actions: [],
      closable: true
    })
  }
</script>

<div class="ai-task-creator">
  <div class="prompt-section">
    <h4>
      <Icon icon={unholyAi.icon.Sparkles} />
      Describe what you need
    </h4>
    <Textarea
      bind:value={prompt}
      placeholder="Example: Build user authentication with Google OAuth, including email verification, password reset, and user profile management. Should be secure and follow OWASP guidelines."
      rows={4}
      disabled={isGenerating}
    />

    <div class="actions">
      <Button
        variant="primary"
        on:click={generateTask}
        disabled={isGenerating || !prompt.trim()}
      >
        {#if isGenerating}
          <Spinner size="small" />
          Generating...
        {:else}
          <Icon icon={unholyAi.icon.AI} />
          Generate Task
        {/if}
      </Button>
    </div>
  </div>

  {#if generatedResponse}
    <div class="response-section">
      <h4>Generated Task</h4>

      <div class="task-preview">
        <div class="task-title">
          <strong>Title:</strong> {generatedResponse.title}
        </div>

        <div class="task-description">
          <strong>Description:</strong>
          <div class="description-content">{generatedResponse.description}</div>
        </div>

        {#if generatedResponse.acceptanceCriteria && generatedResponse.acceptanceCriteria.length > 0}
          <div class="acceptance-criteria">
            <strong>Acceptance Criteria:</strong>
            <ul>
              {#each generatedResponse.acceptanceCriteria as criteria}
                <li>{criteria}</li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if generatedResponse.subtasks && generatedResponse.subtasks.length > 0}
          <div class="subtasks">
            <strong>Subtasks:</strong>
            <ul>
              {#each generatedResponse.subtasks as subtask}
                <li>
                  <strong>{subtask.title}</strong>
                  {#if subtask.description}
                    <div class="subtask-desc">{subtask.description}</div>
                  {/if}
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if generatedResponse.estimatedHours}
          <div class="estimate">
            <strong>Estimated Hours:</strong> {generatedResponse.estimatedHours}h
          </div>
        {/if}
      </div>

      <div class="final-actions">
        <Button variant="primary" on:click={createTask}>
          <Icon icon={unholyAi.icon.AI} />
          Create Task
        </Button>
        <Button variant="outline" on:click={generateTask}>
          Regenerate
        </Button>
      </div>
    </div>
  {/if}
</div>

<style>
  .ai-task-creator {
    min-width: 600px;
    padding: 20px;
  }

  .prompt-section h4 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    color: #1f2937;
  }

  .prompt-section textarea {
    width: 100%;
    margin-bottom: 16px;
  }

  .actions {
    text-align: right;
  }

  .response-section {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #e5e7eb;
  }

  .response-section h4 {
    margin-bottom: 16px;
    color: #1f2937;
  }

  .task-preview {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .task-title {
    font-size: 1.1em;
    font-weight: 600;
    margin-bottom: 12px;
    color: #1f2937;
  }

  .task-description {
    margin-bottom: 16px;
  }

  .description-content {
    margin-top: 8px;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .acceptance-criteria, .subtasks, .estimate {
    margin-bottom: 16px;
  }

  .acceptance-criteria strong, .subtasks strong, .estimate strong {
    color: #374151;
    display: block;
    margin-bottom: 8px;
  }

  .acceptance-criteria ul, .subtasks ul {
    margin: 0;
    padding-left: 20px;
  }

  .acceptance-criteria li, .subtasks li {
    margin-bottom: 4px;
    line-height: 1.4;
  }

  .subtask-desc {
    color: #6b7280;
    font-size: 0.9em;
    margin-top: 4px;
  }

  .estimate {
    color: #059669;
    font-weight: 500;
  }

  .final-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
</style>