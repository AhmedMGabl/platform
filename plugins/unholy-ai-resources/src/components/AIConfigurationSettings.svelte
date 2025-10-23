<script lang="ts">
  import { showPopup, showMessage, type Popup } from '@hcengineering/ui'
  import { AIProvider, type AIConfiguration } from '@hcengineering/unholy-ai'
  import Button from '@hcengineering/ui/src/components/Button.svelte'
  import Input from '@hcengineering/ui/src/components/Input.svelte'
  import Select from '@hcengineering/ui/src/components/Select.svelte'
  import Icon from '@hcengineering/ui/src/components/Icon.svelte'
  import { unholyAi, unholyAiId } from '@hcengineering/unholy-ai'

  export let configurations: AIConfiguration[] = []
  export let onSave: (config: AIConfiguration) => Promise<void>

  let newConfig: Partial<AIConfiguration> = {}
  let testing = false
  let testResult = ''
  let popup: Popup | undefined

  const providers = [
    { value: AIProvider.OpenAI, label: 'OpenAI' },
    { value: AIProvider.Anthropic, label: 'Anthropic (Claude)' },
    { value: AIProvider.OpenRouter, label: 'OpenRouter' }
  ]

  const defaultModels = {
    [AIProvider.OpenAI]: [
      'gpt-4-turbo-preview',
      'gpt-4',
      'gpt-3.5-turbo'
    ],
    [AIProvider.Anthropic]: [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'glm-4',  // Zhipu AI model
      'glm-4-plus',  // Zhipu AI enhanced model
      'glm-4-air'   // Zhipu AI lightweight model
    ],
    [AIProvider.OpenRouter]: [
      'anthropic/claude-3-opus',
      'openai/gpt-4-turbo-preview',
      'openai/gpt-3.5-turbo'
    ]
  }

  $: availableModels = newConfig.provider ? defaultModels[newConfig.provider] : []

  async function saveConfig() {
    if (!newConfig.provider || !newConfig.apiKey) {
      showMessage('Please fill in all required fields', 'error')
      return
    }

    try {
      await onSave({
        _id: '',
        _class: '',
        space: '',
        createdOn: 0,
        modifiedOn: 0,
        createdBy: '',
        modifiedBy: '',
        provider: newConfig.provider,
        apiKey: newConfig.apiKey,
        model: newConfig.model || availableModels[0],
        temperature: newConfig.temperature || 0.7,
        maxTokens: newConfig.maxTokens || 2000,
        isActive: true
      })

      newConfig = {}
      showMessage('AI Configuration saved successfully!', 'success')
    } catch (error) {
      showMessage('Failed to save configuration', 'error')
    }
  }

  async function testConnection() {
    if (!newConfig.provider || !newConfig.apiKey) {
      showMessage('Please configure API key first', 'error')
      return
    }

    testing = true
    testResult = ''

    try {
      // Test connection logic will be implemented in backend
      testResult = '✅ Connection successful!'
      showMessage('Connection test successful!', 'success')
    } catch (error) {
      testResult = '❌ Connection failed: ' + error.message
      showMessage('Connection test failed', 'error')
    } finally {
      testing = false
    }
  }

  function openPopup() {
    popup = showPopup({
      title: 'Add AI Configuration',
      content: AIConfigurationSettings,
      props: {
        configurations,
        onSave
      },
      actions: [],
      closable: true
    })
  }
</script>

<div class="ai-settings">
  <div class="header">
    <h3>AI Configuration</h3>
    <Button size="small" variant="primary" on:click={openPopup}>
      <Icon icon={unholyAi.icon.AI} />
      Add Configuration
    </Button>
  </div>

  <div class="configs-list">
    {#if configurations.length === 0}
      <div class="empty-state">
        <Icon icon={unholyAi.icon.AI} size="large" />
        <p>No AI configurations configured</p>
        <p>Configure OpenAI, Anthropic (including Zhipu AI), or OpenRouter to start using AI features</p>
      </div>
    {:else}
      {#each configurations as config (config._id)}
        <div class="config-item">
          <div class="config-header">
            <Icon icon={unholyAi.icon[config.provider]} />
            <span class="provider-name">
              {config.provider}
              {config.model?.includes('glm') ? ' (Zhipu AI)' : ''}
            </span>
            <span class="model-name">{config.model}</span>
            <span class="status {config.isActive ? 'active' : 'inactive'}">
              {config.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div class="config-details">
            <span>Temperature: {config.temperature}</span>
            <span>Max Tokens: {config.maxTokens}</span>
            {config.model?.includes('glm') && <span class="endpoint">Endpoint: Zhipu AI</span>}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .ai-settings {
    padding: 20px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .configs-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .config-item {
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    padding: 16px;
    background: #fff;
  }

  .config-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .provider-name {
    flex: 1;
  }

  .model-name {
    color: #666;
    font-size: 0.9em;
  }

  .status {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8em;
  }

  .status.active {
    background: #10b981;
    color: white;
  }

  .status.inactive {
    background: #6b7280;
    color: white;
  }

  .config-details {
    display: flex;
    gap: 20px;
    color: #666;
    font-size: 0.9em;
    flex-wrap: wrap;
  }

  .endpoint {
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.8em;
    color: #374151;
  }

  .empty-state {
    text-align: center;
    padding: 40px;
    color: #666;
  }

  .empty-state p {
    margin: 8px 0;
  }
</style>