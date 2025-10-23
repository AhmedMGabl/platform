<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { showPopup, showMessage, type Popup } from '@hcengineering/ui'
  import Button from '@hcengineering/ui/src/components/Button.svelte'
  import Icon from '@hcengineering/ui/src/components/Icon.svelte'
  import Spinner from '@hcengineering/ui/src/components/Spinner.svelte'
  import { unholyAi, unholyAiId } from '@hcengineering/unholy-ai'

  export let context: any = {}
  export let onSuggestionSelect: (suggestion: string) => void

  const dispatch = createEventDispatcher()

  let isLoading = false
  let suggestions: string[] = []
  let suggestionType: 'tasks' | 'features' | 'improvements' | 'risks' = 'tasks'
  let popup: Popup | undefined

  async function generateSuggestions() {
    isLoading = true
    suggestions = []

    try {
      const response = await fetch('/api/ai/generate-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...context,
          type: suggestionType
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate suggestions')
      }

      suggestions = await response.json()

    } catch (error) {
      showMessage('Failed to generate suggestions: ' + error.message, 'error')
    } finally {
      isLoading = false
    }
  }

  function selectSuggestion(suggestion: string) {
    onSuggestionSelect(suggestion)
    dispatch('suggestionSelected', { suggestion, type: suggestionType })
    popup?.hide()
  }

  function openPopup() {
    suggestions = []
    popup = showPopup({
      title: 'AI Smart Suggestions',
      content: AISmartSuggestions,
      props: {
        context,
        onSuggestionSelect
      },
      actions: [],
      closable: true
    })
  }

  function getSuggestionIcon(type: string): string {
    switch (type) {
      case 'tasks': return '✅'
      case 'features': return '🚀'
      case 'improvements': return '🔧'
      case 'risks': return '⚠️'
      default: return '💡'
    }
  }

  function getSuggestionDescription(type: string): string {
    switch (type) {
      case 'tasks': return 'Get actionable task suggestions for your project'
      case 'features': return 'Discover new features to enhance your product'
      case 'improvements': => 'Find ways to optimize existing processes'
      case 'risks': return 'Identify potential risks before they become problems'
      default: return 'Get smart AI-powered suggestions'
    }
  }
</script>

<div class="ai-smart-suggestions">
  <div class="suggestion-header">
    <h4>
      <Icon icon={unholyAi.icon.Sparkles} />
      AI Smart Suggestions
    </h4>
    <p>Get intelligent suggestions powered by AI to improve your project</p>
  </div>

  <div class="suggestion-types">
    <h5>What would you like suggestions for?</h5>
    <div class="type-grid">
      {#each ['tasks', 'features', 'improvements', 'risks'] as type}
        <button
          class="type-card {suggestionType === type ? 'active' : ''}"
          on:click={() => { suggestionType = type; suggestions = [] }}
        >
          <div class="type-icon">{getSuggestionIcon(type)}</div>
          <div class="type-info">
            <h6>{type.charAt(0).toUpperCase() + type.slice(1)}</h6>
            <p>{getSuggestionDescription(type)}</p>
          </div>
        </button>
      {/each}
    </div>
  </div>

  <div class="generate-section">
    <div class="context-info">
      {#if context.taskTitle}
        <span class="context-item">📝 {context.taskTitle}</span>
      {/if}
      {#if context.projectDescription}
        <span class="context-item">📁 {context.projectDescription.substring(0, 50)}...</span>
      {/if}
      {#if context.teamSkills && context.teamSkills.length > 0}
        <span class="context-item">👥 {context.teamSkills.length} skills</span>
      {/if}
    </div>

    <Button
      variant="primary"
      on:click={generateSuggestions}
      disabled={isLoading}
      class="generate-btn"
    >
      {#if isLoading}
        <Spinner size="small" />
        Generating...
      {:else}
        <Icon icon={unholyAi.icon.AI} />
        Generate Suggestions
      {/if}
    </Button>
  </div>

  {#if suggestions.length > 0}
    <div class="suggestions-results">
      <h5>
        {getSuggestionIcon(suggestionType)}
        {suggestionType.charAt(0).toUpperCase() + suggestionType.slice(1)} Suggestions
      </h5>
      <div class="suggestions-list">
        {#each suggestions as suggestion, index}
          <div class="suggestion-item" transition:slide={{ delay: index * 50 }}>
            <div class="suggestion-content">
              <p>{suggestion}</p>
            </div>
            <div class="suggestion-actions">
              <Button
                variant="outline"
                size="small"
                on:click={() => selectSuggestion(suggestion)}
              >
                <Icon icon={unholyAi.icon.Sparkles} />
                Use This
              </Button>
            </div>
          </div>
        {/each}
      </div>

      <div class="results-actions">
        <Button variant="outline" on:click={generateSuggestions}>
          <Icon icon={unholyAi.icon.Sparkles} />
          Generate More
        </Button>
        <Button variant="ghost" size="small" on:click={() => suggestions = []}>
          Clear
        </Button>
      </div>
    </div>
  {/if}
</div>

<style>
  .ai-smart-suggestions {
    min-width: 600px;
    max-width: 800px;
    padding: 24px;
  }

  .suggestion-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .suggestion-header h4 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 8px;
    color: #1f2937;
    font-size: 1.3em;
  }

  .suggestion-header p {
    color: #6b7280;
    margin: 0;
  }

  .suggestion-types h5 {
    margin-bottom: 16px;
    color: #374151;
    font-weight: 600;
  }

  .type-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 32px;
  }

  .type-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #f9fafb;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .type-card:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
    transform: translateY(-1px);
  }

  .type-card.active {
    background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .type-icon {
    font-size: 1.5em;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .type-info h6 {
    margin: 0 0 4px 0;
    color: #374151;
    font-weight: 600;
    font-size: 0.95em;
  }

  .type-info p {
    margin: 0;
    color: #6b7280;
    font-size: 0.85em;
    line-height: 1.4;
  }

  .generate-section {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .context-info {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .context-item {
    background: white;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 0.85em;
    color: #64748b;
    border: 1px solid #e2e8f0;
  }

  .generate-btn {
    width: 100%;
    justify-content: center;
  }

  .suggestions-results {
    margin-top: 24px;
  }

  .suggestions-results h5 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    color: #374151;
    font-size: 1.1em;
  }

  .suggestions-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .suggestion-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .suggestion-item:hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .suggestion-content {
    flex: 1;
  }

  .suggestion-content p {
    margin: 0;
    line-height: 1.5;
    color: #374151;
  }

  .suggestion-actions {
    flex-shrink: 0;
  }

  .results-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 20px;
  }

  /* Custom animations */
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

  @media (max-width: 768px) {
    .ai-smart-suggestions {
      min-width: auto;
      padding: 16px;
    }

    .type-grid {
      grid-template-columns: 1fr;
    }

    .suggestion-item {
      flex-direction: column;
      align-items: stretch;
    }

    .suggestion-actions {
      display: flex;
      justify-content: center;
      margin-top: 12px;
    }
  }
</style>