<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { PlatformUI, platformState } from '@hcengineering/platform'

  // Enhanced Voice Input with multiple features
  let recognition: SpeechRecognition | null = null
  let isListening = false
  let isProcessing = false
  let audioLevel = 0

  const dispatch = createEventDispatcher()

  // Enhanced voice recognition with custom commands
  function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
      recognition = new (window as any).webkitSpeechRecognition()
    } else if ('SpeechRecognition' in window) {
      recognition = new (window as any).SpeechRecognition()
    } else {
      console.warn('Speech recognition not supported')
      return
    }

    // Configure for advanced commands
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 5

    // Custom command patterns
    const advancedCommands = [
      'create task', 'schedule meeting', 'send email', 'generate report',
      'analyze document', 'assign task', 'set deadline', 'create project',
      'team standup', 'code review', 'risk assessment', 'budget analysis'
    ]

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript.toLowerCase()

      // Check for advanced commands
      for (const command of advancedCommands) {
        if (result.includes(command)) {
          processAdvancedCommand(result)
          return
        }
      }

      // Process as regular unholy command
      dispatch('voiceCommand', {
        text: result,
        timestamp: Date.now(),
        confidence: event.results[0][0].confidence
      })
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      dispatch('voiceError', { error: event.error.message })
    }

    recognition.onend = () => {
      isListening = false
      dispatch('voiceEnd', {})
    }

    return recognition
  }

  function processAdvancedCommand(command: string) {
    const parts = command.split(' ')
    const action = parts[0]
    const details = parts.slice(1).join(' ')

    switch (action) {
      case 'create task':
        if (details) {
          dispatch('advancedTaskCreation', {
            type: 'task',
            prompt: `Create task: ${details}`,
            context: 'voice_command'
          })
        }
        }
        break

      case 'schedule meeting':
        if (details) {
          dispatch('advancedMeetingScheduling', {
            type: 'meeting',
            prompt: `Schedule meeting: ${details}`,
            context: 'voice_command'
          })
        }
        }
        break

      case 'send email':
        if (details) {
          dispatch('advancedEmailDraft', {
            type: 'email',
            prompt: `Draft email: ${details}`,
            context: 'voice_command'
          })
        }
        break

      case 'generate report':
        if (details) {
          dispatch('advancedReportGeneration', {
            type: 'report',
            prompt: `Generate report: ${details}`,
            context: 'voice_command'
          })
        }
        break

      case 'analyze document':
        if (details) {
          dispatch('advancedDocumentAnalysis', {
            type: 'analysis',
            prompt: `Analyze document: ${details}`,
            context: 'voice_command'
          })
        }
        break
    }
  }

  function startListening() {
    if (!recognition) {
      recognition = initSpeechRecognition()
    }

    if (recognition && !isListening) {
      recognition.start()
      isListening = true
      dispatch('voiceStart', {})
    }
  }

  function stopListening() {
    if (recognition && isListening) {
      recognition.stop()
      isListening = false
    }
  }

  function processAudioLevel() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const audioContext = new (window as any).AudioContext()
        const analyser = audioContext.createAnalyser()
        const microphone = audioContext.createMediaStreamSource(stream)

        analyser.connect(microphone)
        analyser.fftSize = 256

        const dataArray = new Uint8Array(analyser.frequencyBinCount)

        const checkAudioLevel = () => {
          analyser.getByteFrequencyData(dataArray)
          let sum = 0
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i]
          }
          const average = sum / dataArray.length
          audioLevel = Math.min(100, Math.round((average / 128) * 100))

          if (audioLevel > 30) {
            dispatch('voiceActivity', { level: audioLevel })
          }
        }

        }

        setInterval(checkAudioLevel, 100)
      })
      .catch(err => {
        console.error('Error accessing microphone:', err)
      })
  }
</script>

<div class="enhanced-voice-input">
  <div class="voice-input-header">
    <div class="voice-title">
      🎤 Enhanced Voice Input
      <div class="voice-status">
        {#if isListening}
          <span class="listening-indicator">🔴 Listening...</span>
        {:else}
          <span class="ready-indicator">🎤 Ready</span>
        {/if}
      </div>
    </div>

    <div class="voice-controls">
      <button
        class="voice-btn primary"
        on:click={startListening}
        disabled={isListening || isProcessing}
      >
        🎯 Start Voice
      </button>

      <button
        class="voice-btn secondary"
        on:click={stopListening}
        disabled={!isListening}
      >
        ⏹ Stop
      </button>
    </div>

    <div class="voice-level-indicator">
      <div class="level-bar" style="width: {audioLevel}%"></div>
      <span class="level-text">Audio Level: {audioLevel}%</span>
    </div>
  </div>

  <div class="voice-input-body">
    <div class="voice-transcript">
      <h4>Voice Commands:</h4>
      <div class="command-list">
        <div class="command-category">
          <h5>🎯 Basic Commands:</h5>
          <ul>
            <li>"Create task to fix login bug"</li>
            <li>"Schedule meeting with team tomorrow"</li>
            <li>"Send email to Sarah about project"</li>
          </ul>
        </div>

        <div class="command-category">
          <h5>🚀 Advanced Commands:</h5>
          <ul>
            <li><strong>"create task"</strong> [priority high] [details]</li>
            <li><strong>"schedule meeting"</strong> [with team] [tomorrow at 2pm]</li>
            <li><strong>"send email"</strong> [to client] [subject proposal]</li>
            <li><strong>"generate report"</strong> [weekly progress] [for management]</li>
            <li><strong>"analyze document"</strong> [contract PDF] [for risks]</li>
            <li><strong>"assign task"</strong> [to developer] [due Friday]</li>
          </ul>
        </div>

        <div class="command-category">
          <h5>🎯 Smart Features:</h5>
          <ul>
            <li><strong>Context Awareness</strong> - Understands current project</li>
            <li><strong>Natural Language</strong> - Process complex commands</li>
            <li><strong>Voice Profiles</strong> - Different modes for different contexts</li>
            <li><strong>Multi-step Tasks</strong> - Break down complex requests</li>
          </ul>
        </div>
      </div>

      <div class="voice-modes">
        <h4>Voice Modes:</h4>
        <div class="mode-buttons">
          <button class="mode-btn" on:click={() => dispatch('setMode', 'work')}>
            💼 Work Mode
          </button>
          <button class="mode-btn" on:click={() => dispatch('setMode', 'meeting')}>
            🤝 Meeting Mode
          </button>
          <button class="mode-btn" on:click={() => dispatch('setMode', 'creative')}>
            💡 Creative Mode
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="voice-processing">
    {#if isProcessing}
      <div class="processing-overlay">
        <div class="spinner"></div>
        <span>Processing voice command...</span>
      </div>
    {/if}
  </div>

  <div class="voice-suggestions">
    <h4>💡 AI Suggestions:</h4>
    <div class="suggestion-list">
      <div class="suggestion-item">
        <span>Based on your current tasks, try:</span>
        <strong>"Review high-priority bugs by EOD"</strong>
      </div>
      <div class="suggestion-item">
        <span>Upcoming meetings:</span>
        <strong>"Prepare status update for tomorrow's standup"</strong>
      </div>
      <div class="suggestion-item">
        <span>Project deadline:</span>
        <strong>"Follow up with client on deliverables"</strong>
      </div>
    </div>
  </div>
</div>

<style>
  .enhanced-voice-input {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 12px;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    max-width: 500px;
  }

  .voice-input-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .voice-title {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .voice-status {
    text-align: center;
  }

  .listening-indicator {
    background: #ff4444;
    color: white;
    padding: 4px 8px;
    border-radius: 20px;
    animation: pulse 1.5s infinite;
  }

  .ready-indicator {
    background: #4CAF50;
    color: white;
    padding: 4px 8px;
    border-radius: 20px;
  }

  .voice-controls {
    display: flex;
    gap: 10px;
  }

  .voice-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  .voice-btn.primary {
    background: #4CAF50;
    color: white;
  }

  .voice-btn.secondary {
    background: #f44336;
    color: white;
  }

  .voice-btn:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .voice-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .voice-level-indicator {
    margin-top: 15px;
  }

  .level-bar {
    height: 8px;
    background: #4CAF50;
    border-radius: 4px;
    transition: width 0.1s ease-out;
  }

  .level-text {
    font-size: 12px;
    margin-left: 10px;
  }

  .voice-input-body {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .voice-transcript h4 {
    margin: 0 0 10px 0;
    color: #ffffff;
  }

  .command-category {
    background: rgba(255, 255, 255, 0.1);
    padding: 12px;
    border-radius: 8px;
  margin-bottom: 12px;
  }

  .command-category h5 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 600;
  }

  .command-category ul {
    margin: 0;
    padding-left: 20px;
  font-size: 13px;
  }

  .command-category li {
    margin: 4px 0;
    padding: 2px 0;
  }

  .voice-modes {
    margin-top: 20px;
  }

  .mode-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .mode-btn {
    padding: 6px 12px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
  transition: all 0.2s;
  }

  .mode-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .voice-processing {
    position: relative;
    pointer-events: none;
  }

  .processing-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid white;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .voice-suggestions {
    margin-top: 20px;
    background: rgba(76, 175, 80, 0.1);
    padding: 15px;
    border-radius: 8px;
  }

  .voice-suggestions h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    font-weight: 600;
  }

  .suggestion-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .suggestion-item {
    background: rgba(255, 255, 255, 0.1);
    padding: 10px;
    border-radius: 6px;
    font-size: 13px;
  }

  .suggestion-item strong {
    color: #4CAF50;
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>