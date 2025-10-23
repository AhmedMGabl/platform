<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { Ref, Doc } from '@hcengineering/core'
  import type { Asset, IntlString, Resource } from '@hcengineering/platform'
  import type { AnyComponent } from '@hcengineering/ui'
  import { Button, Card, Select, Input, TextArea, ProgressRing, Icon } from '@hcengineering/ui'

  const dispatch = createEventDispatcher()

  export let meetingConfig = {
    platforms: ['zoom', 'teams', 'google-meet', 'slack'],
    language: 'en',
    recording: true,
    transcription: true,
    aiModeration: true,
    smartActionItems: true,
    realTimeSummaries: true,
    autoJoin: false,
    earlyJoinMinutes: 5
  }

  export let isJoined = false
  export let isRecording = false
  export let isTranscribing = false
  export let currentMeeting = null as Meeting | null
  export let transcriptionProgress = 0
  export let activeTab = 'config'

  // Enhanced meeting bot functionality
  async function startMeeting() {
    const platform = meetingConfig.platform
    const response = await fetch('/api/v1/unholy-ai/meeting-bot/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAPIKey()}`
      },
      body: JSON.stringify({
        platform,
        language: meetingConfig.language,
        features: {
          recording: meetingConfig.recording,
          transcription: meetingConfig.transcription,
          aiModeration: meetingConfig.aiModeration,
          smartActionItems: meetingConfig.smartActionItems,
          realTimeSummaries: meetingConfig.realTimeSummaries,
          autoJoin: meetingConfig.autoJoin,
          earlyJoinMinutes: meetingConfig.earlyJoinMinutes
        }
      })
    }).then(r => r.json()).then(data => {
      if (data.success) {
        currentMeeting = data.data.meeting
        isJoined = true

        dispatch('meetingStarted', {
          meeting: currentMeeting,
          platform: platform
        })

        // Update UI state
        document.title = `🤖 Meeting Bot - ${platform.charAt(0).toUpperCase()}${platform.slice(1)}`
      }
    })

    return data.data
  }

  function stopMeeting() {
    isRecording = false
    isTranscribing = false
    isJoined = false
    currentMeeting = null

    if (currentMeeting) {
      dispatch('meetingEnded', {
        meetingId: currentMeeting.meetingId,
        duration: Date.now() - currentMeeting.startTime,
        summary: 'Meeting ended by user'
      })
    }
  }

  function toggleRecording() {
    isRecording = !isRecording

    if (isRecording && currentMeeting) {
      dispatch('recordingToggled', {
        meetingId: currentMeeting.meetingId,
        isRecording: true
      })
    }
  }

  function startTranscription() {
    if (currentMeeting && !isTranscribing) {
      isTranscribing = true
      transcriptionProgress = 0

      // Simulate transcription progress
      const interval = setInterval(() => {
        transcriptionProgress = Math.min(transcriptionProgress + 10, 100)
        dispatch('transcriptionProgress', { progress: transcriptionProgress })

        if (transcriptionProgress >= 100) {
          clearInterval(interval)
          isTranscribing = false
          dispatch('transcriptionComplete', {
            meetingId: currentMeeting.meetingId,
            transcript: 'Transcription completed successfully'
          })
        }
      }, 500)
    }
  }

  function sendBotMessage(message: string) {
    if (currentMeeting) {
      dispatch('botMessage', {
        meetingId: currentMeeting.meetingId,
        message,
        sender: 'AI Assistant',
        timestamp: Date.now()
      })
    }
  }

  function generateSmartActionItems() {
    if (!currentMeeting) return

    dispatch('smartActionItemsGenerated', {
      meetingId: currentMeeting.meetingId,
      actionItems: [
        {
          type: 'task',
          title: 'Review meeting notes',
          assignee: 'Meeting organizer',
          priority: 'high',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'follow_up',
          title: 'Send meeting summary',
          description: 'Email meeting summary and action items to all participants',
          assignee: 'All participants',
          priority: 'medium'
        }
      ]
    })
  }

  function getMeetingStatusClass(status: string): string {
    switch (status) {
      case 'scheduled': return 'scheduled'
      case 'in_progress': return 'in-progress'
      case 'completed': return 'completed'
      case 'cancelled': return 'cancelled'
      case 'failed': return 'failed'
      default: return 'unknown'
    }
  }

  function getAPIKey(): string {
    // In a real implementation, this would retrieve from secure storage
    return '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'
  }

  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  // Auto-join meetings functionality
  async function scheduleUpcomingMeetings() {
    const response = await fetch('/api/v1/unholy-ai/meeting-bot/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAPIKey()}`
      },
      body: JSON.stringify({
        workspaceId: 'current-workspace',
        autoJoin: meetingConfig.autoJoin,
        earlyJoinMinutes: meetingConfig.earlyJoinMinutes,
        lookAheadDays: 7,
        platforms: meetingConfig.platforms
      })
    }).then(r => r.json())

    dispatch('meetingsScheduled', {
      meetings: response.data.meetings || [],
      scheduledCount: response.data.meetings?.length || 0
    })
  }

  // AI-powered meeting enhancement features
  async function enhanceMeetingWithAI() {
    if (!currentMeeting) return

    const response = await fetch('/api/v1/unholy-ai/meeting-enhancement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAPIKey()}`
      },
      body: JSON.stringify({
        meetingId: currentMeeting.meetingId,
        enhancements: {
          backgroundNoiseReduction: true,
          speakerIdentification: true,
          multiLanguageSupport: true,
          emotionalAnalysis: true,
          keyPointHighlighting: true,
          smartSummaries: true
        }
      })
    }).then(r => r.json())

    dispatch('meetingEnhanced', {
      enhancements: response.data.enhancements || {}
    })
  }
</script>

<div class="enhanced-meeting-bot">
  <div class="meeting-header">
    <div class="meeting-title">
      <h2>🤖 Enhanced Meeting Bot Manager</h2>
      <div class="meeting-status {getMeetingStatusClass(currentMeeting?.status || '')}">
        {#if currentMeeting}
          <Icon icon="recording" />
          <span>Meeting Active</span>
        {:else}
          <Icon icon="standby" />
          <span>Ready to Join</span>
        {/if}
      </div>
    </div>
    <p class="meeting-subtitle">AI-powered meeting management with enhanced features</p>
  </div>

  <div class="meeting-tabs">
    <button
      class="tab-btn {activeTab === 'config' ? 'active' : ''}"
      on:click={() => activeTab = 'config'}
    >
      ⚙️ Configuration
    </button>

    <button
      class="tab-btn {activeTab === 'live' ? 'active' : ''}"
      on:click={() => activeTab = 'live'}
      disabled={!currentMeeting}
    >
      🔴 Live Meeting
    </button>

    <button
      class="tab-btn {activeTab === 'analysis' ? 'active' : ''}"
      on:click={() => activeTab = 'analysis'}
      disabled={!currentMeeting}
    >
      📊 Analysis & Insights
    </button>
  </div>

  <div class="meeting-content">
    {#if activeTab === 'config'}
      <div class="config-view">
        <Card class="config-card">
          <div class="card-header">
            <h3>🔧 Meeting Bot Configuration</h3>
          </div>

          <div class="config-section">
            <div class="config-group">
              <label>Default Platform</label>
              <Select bind:value={meetingConfig.platform}>
                <option value="zoom">Zoom</option>
                <option value="teams">Microsoft Teams</option>
                <option value="google-meet">Google Meet</option>
                <option value="slack">Slack Calls</option>
              </Select>
            </div>

            <div class="config-group">
              <label>Language</label>
              <Select bind:value={meetingConfig.language}>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
              </Select>
            </div>

            <div class="config-group">
              <label>
                <input type="checkbox" bind:checked={meetingConfig.recording} />
                Enable Recording
              </label>
            </div>

            <div class="config-group">
              <label>
                <input type="checkbox" bind:checked={meetingConfig.transcription} />
                Enable Live Transcription
              </label>
            </div>

            <div class="config-group">
              <label>
                <input type="checkbox" bind:checked={meetingConfig.aiModeration} />
                Enable AI Moderation
              </label>
            </div>

            <div class="config-group">
              <label>
                <input type="checkbox" bind:checked={meetingConfig.smartActionItems} />
                Smart Action Item Detection
              </label>
            </div>

            <div class="config-group">
              <label>
                <input type="checkbox" bind:checked={meetingConfig.realTimeSummaries} />
                Real-time Meeting Summaries
              </label>
            </div>

            <div class="config-group">
              <label>
                <input type="checkbox" bind:checked={meetingConfig.autoJoin} />
                Auto-join Meetings (Early: {meetingConfig.earlyJoinMinutes}min)
              </label>
            </div>
          </div>

          <div class="config-actions">
            <Button
              type="primary"
              on:click={scheduleUpcomingMeetings}
            >
              📅 Schedule Upcoming Meetings
            </Button>
          </div>
        </Card>

        <Card class="config-card features-card">
          <div class="card-header">
            <h3>🚀 Enhanced Features</h3>
          </div>

          <div class="features-grid">
            <div class="feature-item enabled">
              <div class="feature-icon">🎯</div>
              <div class="feature-info">
                <div class="feature-title">Multi-language Support</div>
                <div class="feature-desc">Transcribe and translate in 30+ languages</div>
              </div>
            </div>

            <div class="feature-item enabled">
              <div class="feature-icon">👥</div>
              <div class="feature-info">
                <div class="feature-title">Speaker Identification</div>
                <div class="feature-desc">Automatically identify and label speakers</div>
              </div>
            </div>

            <div class="feature-item enabled">
              <div class="feature-icon">🎯</div>
              <div class="feature-info">
                <div class="feature-title">Noise Reduction</div>
                <div class="feature-desc">Advanced background noise filtering</div>
              </div>
            </div>

            <div class="feature-item enabled">
              <div class="feature-icon">💡</div>
              <div class="feature-info">
                <div class="feature-title">Emotional Analysis</div>
                <div class="feature-desc">Analyze meeting sentiment and engagement</div>
              </div>
            </div>

            <div class="feature-item enabled">
              <div class="feature-icon">🔑</div>
              <div class="feature-info">
                <div class="feature-title">Smart Summaries</div>
                <div class="feature-desc">AI-powered meeting insights and action items</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    {/if}

    {#if activeTab === 'live'}
      <div class="live-meeting-view">
        {#if currentMeeting}
          <div class="meeting-controls">
            <div class="meeting-info">
              <h3>{currentMeeting.title}</h3>
              <div class="meeting-meta">
                <span class="platform-badge">{currentMeeting.platform?.toUpperCase()}</span>
                <span class="duration">Duration: {formatDuration(Date.now() - currentMeeting.startTime)}</span>
                <span class="participants">{currentMeeting.participants.length} participants</span>
              </div>
            </div>

            <div class="control-buttons">
              <button
                class="control-btn {isRecording ? 'recording' : ''}"
                on:click={toggleRecording}
              >
                {#if isRecording}
                  <Icon icon="recording" />
                  Stop Recording
                {:else}
                  <Icon icon="record" />
                  Start Recording
                {/if}
              </button>

              <button
                class="control-btn {isTranscribing ? 'transcribing' : ''}"
                on:click={startTranscription}
                disabled={isTranscribing}
              >
                <Icon icon="transcription" />
                {#if isTranscribing}
                  Transcribing... {transcriptionProgress}%
                {:else}
                  Start Transcription
                {/if}
              </button>

              <button
                class="control-btn"
                on:click={generateSmartActionItems}
              >
                <Icon icon="smart-suggestions" />
                Smart Actions
              </button>

              <button
                class="control-btn"
                on:click={enhanceMeetingWithAI}
              >
                <Icon icon="magic" />
                AI Enhance
              </button>

              <button
                class="control-btn danger"
                on:click={stopMeeting}
              >
                <Icon icon="stop" />
                End Meeting
              </button>
            </div>

            <div class="transcription-status">
              {#if isTranscribing}
                <div class="transcription-progress">
                  <div class="progress-ring">
                    <ProgressRing progress={transcriptionProgress} />
                  </div>
                  <span class="progress-text">Transcribing... {transcriptionProgress}%</span>
                </div>
              {/if}
            </div>

            <div class="meeting-chat">
              <div class="chat-header">
                <h4>💬 AI Meeting Assistant</h4>
                <p>Ask questions or request actions during the meeting</p>
              </div>

              <div class="chat-input-area">
                <TextArea
                  placeholder="Ask the AI assistant about the meeting..."
                  rows={3}
                />
                <button on:click={() => sendBotMessage(document.querySelector('textarea')?.value)}>
                  Send
                </button>
              </div>
            </div>
        {:else}
          <div class="no-meeting-view">
            <div class="no-meeting-message">
              <Icon icon="meeting" />
              <h3>No Active Meeting</h3>
              <p>Configure a meeting or wait for a scheduled meeting to start.</p>
            </div>

            <div class="quick-actions">
              <Button
                type="primary"
                on:click={() => activeTab = 'config'}
              >
                ⚙️ Configure Meeting Bot
              </Button>

              <Button
                type="secondary"
                on:click={scheduleUpcomingMeetings}
              >
                📅 Check Scheduled Meetings
              </Button>
            </div>
          </div>
        {/if}
    {/if}

    {#if activeTab === 'analysis'}
      <div class="analysis-view">
        <Card class="analysis-card">
          <div class="card-header">
            <h3>📊 Meeting Analytics & Insights</h3>
          </div>

          <div class="metrics-overview">
            <div class="metric-item">
              <div class="metric-value">87%</div>
              <div class="metric-label">Meeting Attendance Rate</div>
            </div>

            <div class="metric-item">
              <div class="metric-value">23</div>
              <div class="metric-label">Avg Meeting Duration</div>
            </div>

            <div class="metric-item">
              <div class="metric-value">94%</div>
              <div class="metric-label">Action Item Completion</div>
            </div>
          </div>

          <div class="insights-section">
            <h4>🔍 Key Insights</h4>
            <div class="insight-list">
              <div class="insight-item">
                <span class="insight-icon">📈</span>
                <span class="insight-text">Peak productivity hours: 2-4 PM on Tuesdays</span>
              </div>
              <div class="insight-item">
                <span class="insight-icon">👥</span>
                <span class="insight-text">Most action items created during brainstorming sessions</span>
              </div>
              <div class="insight-item">
                <span class="insight-icon">⚠️</span>
                <span class="insight-text">Consider scheduling shorter meetings for better focus</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    {/if}
  </div>

<style>
  .enhanced-meeting-bot {
    background: linear-gradient(135deg, #2d3748 0%, #1a237e 100%);
    color: white;
    padding: 20px;
    border-radius: 12px;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    max-width: 1200px;
  }

  .meeting-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .meeting-title {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .meeting-title h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }

  .meeting-status {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .status.scheduled { background: #6c757d; }
  .status.in-progress { background: #03a9f4; }
  .status.completed { background: #4CAF50; }
  .status.cancelled { background: #f44336; }
  .status.failed { background: #dc2626; }
  .status.unknown { background: #6c757d; }

  .meeting-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .tab-btn {
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab-btn.active {
    background: #4CAF50;
    color: white;
    transform: translateY(-1px);
  }

  .tab-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .tab-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .meeting-content {
    display: grid;
    gap: 20px;
  }

  .config-view {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .config-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .card-header {
    margin-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 10px;
  }

  .config-section {
    margin-bottom: 15px;
  }

  .config-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .config-group label {
    flex: 1;
    font-weight: 500;
    min-width: 150px;
  }

  .config-actions {
    margin-top: 20px;
    display: flex;
    gap: 10px;
  }

  .features-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }

  .feature-item {
    display: flex;
    align-items: center;
    padding: 15px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
  }

  .feature-item.enabled {
    background: rgba(76, 175, 80, 0.1);
  }

  .feature-icon {
    font-size: 24px;
    margin-right: 10px;
  }

  .feature-info {
    flex: 1;
  }

  .feature-title {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .feature-desc {
    font-size: 13px;
    opacity: 0.9;
  }

  .live-meeting-view {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .meeting-controls {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .meeting-info {
    margin-bottom: 15px;
  }

  .meeting-info h3 {
    margin: 0 0 10px 0;
    font-size: 20px;
    font-weight: 600;
  }

  .meeting-meta {
    display: flex;
    gap: 10px;
    font-size: 14px;
    opacity: 0.8;
  }

  .platform-badge {
    background: #4CAF50;
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }

  .control-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
  }

  .control-btn {
    padding: 12px 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  .control-btn.recording {
    background: #f44336;
    color: white;
  }

  .control-btn.transcribing {
    background: #03a9f4;
    color: white;
  }

  .control-btn.danger {
    background: #dc2626;
    color: white;
  }

  .transcription-status {
    margin-top: 15px;
  }

  .transcription-progress {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .progress-text {
    font-size: 14px;
    font-weight: 500;
  }

  .meeting-chat {
    grid-column: 1;
  }

  .chat-header {
    margin-bottom: 10px;
  }

  .chat-input-area {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }

  .no-meeting-view {
    text-align: center;
    padding: 40px;
  }

  .no-meeting-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .quick-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .analysis-view {
    display: grid;
    gap: 20px;
  }

  .analysis-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .metrics-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }

  .metric-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 20px;
    text-align: center;
  }

  .metric-value {
    font-size: 24px;
    font-weight: 600;
    color: #4CAF50;
    margin-bottom: 8px;
  }

  .metric-label {
    font-size: 14px;
    opacity: 0.8;
  }

  .insights-section {
    margin-top: 20px;
  }

  .insight-list {
    display: grid;
    gap: 15px;
  }

  .insight-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .insight-icon {
    font-size: 20px;
  }

  .insight-text {
    flex: 1;
    font-size: 14px;
  }
</style>