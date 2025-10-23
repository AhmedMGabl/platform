<script lang="ts">
  import Button from '@hcengineering/ui/src/components/Button.svelte'
  import Icon from '@hcengineering/ui/src/components/Icon.svelte'
  import { unholyAi, unholyAiId } from '@hcengineering/unholy-ai'

  export let onTranscript: (text: string) => void
  export let size: 'small' | 'medium' | 'large' = 'small'

  let isRecording = false
  let recognition: any = null

  // Check if browser supports speech recognition
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

  function startRecording() {
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
      return
    }

    recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      isRecording = true
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onTranscript(transcript)
      isRecording = false
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      isRecording = false
    }

    recognition.onend = () => {
      isRecording = false
    }

    recognition.start()
  }

  function stopRecording() {
    if (recognition) {
      recognition.stop()
      isRecording = false
    }
  }

  function toggleRecording() {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }
</script>

{#if SpeechRecognition}
  <Button
    variant="outline"
    size={size}
    on:click={toggleRecording}
    title="Voice input"
    class:recording={isRecording}
  >
    <Icon icon={unholyAi.icon.Voice} />
    {unholyAi.string.VoiceInput}
  </Button>
{:else}
  <Button
    variant="outline"
    size={size}
    disabled={true}
    title="Voice input not supported in this browser"
  >
    <Icon icon={unholyAi.icon.Voice} />
    Voice Not Supported
  </Button>
{/if}

<style>
  :global(.recording) {
    background-color: #ef4444 !important;
    border-color: #ef4444 !important;
    color: white !important;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
    }
  }
</style>