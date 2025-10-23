<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { showPopup, showMessage } from '@hcengineering/ui'
  import Button from '@hcengineering/ui/src/components/Button.svelte'
  import Icon from '@hcengineering/ui/src/components/Icon.svelte'
  import Spinner from '@hcengineering/ui/src/components/Spinner.svelte'
  import { unholyAi, unholyAiId, MeetingStatus, MeetingPlatform } from '@hcengineering/unholy-ai'

  const dispatch = createEventDispatcher()

  let meetings = []
  let isLoading = false
  let showScheduleForm = false
  let newMeeting = {
    title: '',
    platform: MeetingPlatform.GOOGLE_MEET,
    startTime: '',
    meetingUrl: '',
    participants: ''
  }

  // Sample data - in real app this would come from API
  meetings = [
    {
      id: '1',
      title: 'Project Kickoff Meeting',
      platform: 'Google Meet',
      startTime: Date.now() + 3600000, // 1 hour from now
      status: MeetingStatus.SCHEDULED,
      participants: ['Alice Johnson', 'Bob Smith', 'Carol White'],
      botJoined: false
    },
    {
      id: '2',
      title: 'Sprint Planning',
      platform: 'Lark',
      startTime: Date.now() - 1800000, // 30 minutes ago
      endTime: Date.now() + 2700000, // Still running
      status: MeetingStatus.IN_PROGRESS,
      participants: ['Dev Team', 'Product Manager'],
      botJoined: true,
      recordingUrl: 'https://storage.example.com/recordings/sprint-planning.mp4',
      transcriptCount: 45
    },
    {
      id: '3',
      title: 'Client Review',
      platform: 'Google Meet',
      startTime: Date.now() - 7200000, // 2 hours ago
      endTime: Date.now() - 3600000, // 1 hour ago
      status: MeetingStatus.COMPLETED,
      participants: ['Client Team', 'Project Team'],
      botJoined: true,
      recordingUrl: 'https://storage.example.com/recordings/client-review.mp4',
      actionItemsCount: 8,
      insightsAvailable: true
    }
  ]

  async function scheduleMeetingBot() {
    if (!newMeeting.title || !newMeeting.startTime || !newMeeting.meetingUrl) {
      showMessage('Please fill in all required fields', 'error')
      return
    }

    isLoading = true

    try {
      // Parse participants
      const participants = newMeeting.participants
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0)

      const meetingData = {
        title: newMeeting.title,
        platform: newMeeting.platform,
        startTime: new Date(newMeeting.startTime).getTime(),
        meetingUrl: newMeeting.meetingUrl,
        participants
      }

      // API call to schedule bot
      const response = await fetch('/api/ai/meeting-bot/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meetingData)
      })

      if (!response.ok) {
        throw new Error('Failed to schedule meeting bot')
      }

      const result = await response.json()

      // Add to local list
      meetings = [{
        id: result.meetingId,
        ...meetingData,
        status: MeetingStatus.SCHEDULED,
        botJoined: false
      }, ...meetings]

      // Reset form
      newMeeting = {
        title: '',
        platform: MeetingPlatform.GOOGLE_MEET,
        startTime: '',
        meetingUrl: '',
        participants: ''
      }
      showScheduleForm = false

      showMessage('Meeting bot scheduled successfully!', 'success')
      dispatch('meetingScheduled', result)

    } catch (error) {
      showMessage('Failed to schedule meeting bot: ' + error.message, 'error')
    } finally {
      isLoading = false
    }
  }

  async function joinMeetingNow(meetingId: string) {
    try {
      const response = await fetch(`/api/ai/meeting-bot/join/${meetingId}`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to join meeting')
      }

      // Update local state
      meetings = meetings.map(m =>
        m.id === meetingId
          ? { ...m, status: MeetingStatus.IN_PROGRESS, botJoined: true }
          : m
      )

      showMessage('Bot joined meeting successfully!', 'success')

    } catch (error) {
      showMessage('Failed to join meeting: ' + error.message, 'error')
    }
  }

  async function leaveMeeting(meetingId: string) {
    try {
      const response = await fetch(`/api/ai/meeting-bot/leave/${meetingId}`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to leave meeting')
      }

      const insights = await response.json()

      // Update local state
      meetings = meetings.map(m =>
        m.id === meetingId
          ? {
              ...m,
              status: MeetingStatus.COMPLETED,
              endTime: Date.now(),
              actionItemsCount: insights.actionItems?.length || 0,
              insightsAvailable: true
            }
          : m
      )

      showMessage('Meeting processed successfully!', 'success')
      dispatch('meetingCompleted', { meetingId, insights })

    } catch (error) {
      showMessage('Failed to leave meeting: ' + error.message, 'error')
    }
  }

  function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleString()
  }

  function getDuration(startTime: number, endTime?: number): string {
    const end = endTime || Date.now()
    const duration = Math.floor((end - startTime) / 60000) // minutes
    return `${duration}m`
  }

  function getStatusColor(status: MeetingStatus): string {
    switch (status) {
      case MeetingStatus.SCHEDULED: return '#3b82f6'
      case MeetingStatus.IN_PROGRESS: return '#10b981'
      case MeetingStatus.COMPLETED: return '#6b7280'
      case MeetingStatus.CANCELLED: return '#ef4444'
      default: return '#6b7280'
    }
  }

  function getPlatformIcon(platform: string): string {
    switch (platform) {
      case MeetingPlatform.GOOGLE_MEET: return '📹'
      case MeetingPlatform.LARK: return '💬'
      default: return '🤖'
    }
  }

  function openMeetingInsights(meetingId: string) {
    dispatch('openInsights', { meetingId })
  }

  function openTranscript(meetingId: string) {
    dispatch('openTranscript', { meetingId })
  }

  function openRecording(meeting: any) {
    window.open(meeting.recordingUrl, '_blank')
  }
</script>

<div class="meeting-bot-manager">
  <div class="manager-header">
    <h2>
      <Icon icon={unholyAi.icon.MeetingBot} />
      AI Meeting Bot Manager
    </h2>
    <p>Schedule AI bots to join, record, and transcribe your meetings automatically</p>

    <div class="header-actions">
      <Button variant="primary" on:click={() => showScheduleForm = true}>
        <Icon icon={unholyAi.icon.Sparkles} />
        Schedule Meeting Bot
      </Button>
    </div>
  </div>

  {#if showScheduleForm}
    <div class="schedule-form">
      <h3>Schedule New Meeting Bot</h3>

      <div class="form-grid">
        <div class="form-group">
          <label>Meeting Title *</label>
          <input
            type="text"
            bind:value={newMeeting.title}
            placeholder="e.g., Project Kickoff Meeting"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Platform *</label>
          <select bind:value={newMeeting.platform} class="form-input">
            <option value={MeetingPlatform.GOOGLE_MEET}>Google Meet</option>
            <option value={MeetingPlatform.LARK}>Lark</option>
          </select>
        </div>

        <div class="form-group">
          <label>Start Time *</label>
          <input
            type="datetime-local"
            bind:value={newMeeting.startTime}
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Meeting URL *</label>
          <input
            type="url"
            bind:value={newMeeting.meetingUrl}
            placeholder="https://meet.google.com/xxx-xxxx-xxx"
            class="form-input"
          />
        </div>

        <div class="form-group full-width">
          <label>Participants (comma-separated)</label>
          <input
            type="text"
            bind:value={newMeeting.participants}
            placeholder="Alice Johnson, Bob Smith, Carol White"
            class="form-input"
          />
        </div>
      </div>

      <div class="form-actions">
        <Button variant="primary" on:click={scheduleMeetingBot} disabled={isLoading}>
          {#if isLoading}
            <Spinner size="small" />
            Scheduling...
          {:else}
            <Icon icon={unholyAi.icon.Sparkles} />
            Schedule Bot
          {/if}
        </Button>
        <Button variant="outline" on:click={() => showScheduleForm = false}>
          Cancel
        </Button>
      </div>
    </div>
  {/if}

  <div class="meetings-list">
    <h3>Scheduled & Active Meetings</h3>

    {#if meetings.length === 0}
      <div class="empty-state">
        <Icon icon={unholyAi.icon.MeetingBot} />
        <p>No meetings scheduled. Schedule your first AI-powered meeting!</p>
      </div>
    {:else}
      <div class="meetings-grid">
        {#each meetings as meeting}
          <div class="meeting-card">
            <div class="meeting-header">
              <div class="meeting-info">
                <div class="meeting-title">
                  {getPlatformIcon(meeting.platform)}
                  {meeting.title}
                </div>
                <div class="meeting-time">
                  {formatTime(meeting.startTime)}
                  {#if meeting.endTime}
                    - {formatTime(meeting.endTime)} ({getDuration(meeting.startTime, meeting.endTime)})
                  {:else if meeting.status === MeetingStatus.IN_PROGRESS}
                    (Running: {getDuration(meeting.startTime)})
                  {/if}
                </div>
              </div>
              <div class="meeting-status" style="color: {getStatusColor(meeting.status)}">
                {meeting.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            <div class="meeting-details">
              <div class="participants">
                <strong>Participants:</strong> {meeting.participants?.join(', ') || 'No participants listed'}
              </div>

              {#if meeting.botJoined}
                <div class="bot-status">
                  <span class="bot-indicator active">🤖 Bot Active</span>
                </div>
              {/if}

              {#if meeting.recordingUrl}
                <div class="recording-info">
                  <span class="recording-indicator">🔴 Recording Available</span>
                </div>
              {/if}

              {#if meeting.transcriptCount}
                <div class="transcript-info">
                  <span class="transcript-indicator">📝 {meeting.transcriptCount} transcript entries</span>
                </div>
              {/if}

              {#if meeting.actionItemsCount}
                <div class="action-items-info">
                  <span class="action-items-indicator">✅ {meeting.actionItemsCount} action items</span>
                </div>
              {/if}
            </div>

            <div class="meeting-actions">
              {#if meeting.status === MeetingStatus.SCHEDULED && !meeting.botJoined}
                <Button
                  variant="primary"
                  size="small"
                  on:click={() => joinMeetingNow(meeting.id)}
                >
                  Join Now
                </Button>
              {:else if meeting.status === MeetingStatus.IN_PROGRESS && meeting.botJoined}
                <Button
                  variant="outline"
                  size="small"
                  on:click={() => leaveMeeting(meeting.id)}
                >
                  End & Process
                </Button>
              {/if}

              {#if meeting.recordingUrl}
                <Button
                  variant="ghost"
                  size="small"
                  on:click={() => openRecording(meeting)}
                >
                  <Icon icon={unholyAi.icon.Recording} />
                  Recording
                </Button>
              {/if}

              {#if meeting.insightsAvailable}
                <Button
                  variant="ghost"
                  size="small"
                  on:click={() => openMeetingInsights(meeting.id)}
                >
                  <Icon icon={unholyAi.icon.Sparkles} />
                  Insights
                </Button>
                <Button
                  variant="ghost"
                  size="small"
                  on:click={() => openTranscript(meeting.id)}
                >
                  <Icon icon={unholyAi.icon.Transcript} />
                  Transcript
                </Button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .meeting-bot-manager {
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .manager-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .manager-header h2 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 8px;
    color: #1f2937;
    font-size: 2em;
  }

  .manager-header p {
    color: #6b7280;
    font-size: 1.1em;
    margin-bottom: 24px;
  }

  .header-actions {
    display: flex;
    justify-content: center;
  }

  .schedule-form {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 32px;
  }

  .schedule-form h3 {
    margin: 0 0 20px 0;
    color: #1f2937;
    font-size: 1.3em;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-group.full-width {
    grid-column: 1 / -1;
  }

  .form-group label {
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
  }

  .form-input {
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s ease;
  }

  .form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .meetings-list h3 {
    margin: 0 0 20px 0;
    color: #1f2937;
    font-size: 1.3em;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #6b7280;
  }

  .empty-state svg {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .meetings-grid {
    display: grid;
    gap: 20px;
  }

  .meeting-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.2s ease;
  }

  .meeting-card:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .meeting-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .meeting-title {
    font-weight: 600;
    color: #1f2937;
    font-size: 1.1em;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .meeting-time {
    color: #6b7280;
    font-size: 0.9em;
  }

  .meeting-status {
    font-weight: 600;
    font-size: 0.8em;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .meeting-details {
    margin-bottom: 16px;
  }

  .participants {
    color: #6b7280;
    font-size: 0.9em;
    margin-bottom: 8px;
  }

  .bot-status, .recording-info, .transcript-info, .action-items-info {
    margin-bottom: 6px;
  }

  .bot-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: #10b98115;
    color: #10b981;
    border-radius: 12px;
    font-size: 0.85em;
    font-weight: 500;
  }

  .recording-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: #ef444415;
    color: #ef4444;
    border-radius: 12px;
    font-size: 0.85em;
    font-weight: 500;
  }

  .transcript-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: #3b82f615;
    color: #3b82f6;
    border-radius: 12px;
    font-size: 0.85em;
    font-weight: 500;
  }

  .action-items-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: #8b5cf615;
    color: #8b5cf6;
    border-radius: 12px;
    font-size: 0.85em;
    font-weight: 500;
  }

  .meeting-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    .meeting-bot-manager {
      padding: 16px;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .meeting-header {
      flex-direction: column;
      gap: 8px;
    }

    .meeting-actions {
      justify-content: center;
    }
  }
</style>