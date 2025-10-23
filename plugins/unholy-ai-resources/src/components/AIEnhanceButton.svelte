<script lang="ts">
  import Button from '@hcengineering/ui/src/components/Button.svelte'
  import Icon from '@hcengineering/ui/src/components/Icon.svelte'
  import Spinner from '@hcengineering/ui/src/components/Spinner.svelte'
  import { unholyAi, unholyAiId } from '@hcengineering/unholy-ai'

  export let text: string = ''
  export let onEnhance: (enhancedText: string) => void
  export let size: 'small' | 'medium' | 'large' = 'small'

  let isEnhancing = false

  async function enhanceWithAI() {
    if (!text.trim()) {
      return
    }

    isEnhancing = true

    try {
      const response = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          context: 'task_description'
        })
      })

      const result = await response.json()
      onEnhance(result.enhancedText)
    } catch (error) {
      console.error('Failed to enhance text:', error)
    } finally {
      isEnhancing = false
    }
  }
</script>

<Button
  variant="outline"
  size={size}
  on:click={enhanceWithAI}
  disabled={isEnhancing || !text.trim()}
  title="Enhance with AI"
>
  {#if isEnhancing}
    <Spinner size="small" />
  {:else}
    <Icon icon={unholyAi.icon.Sparkles} />
  {/if}
  {unholyAi.string.EnhanceWithAI}
</Button>