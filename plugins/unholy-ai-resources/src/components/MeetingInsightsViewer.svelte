<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { showPopup, showMessage } from '@hcengineering/ui'
  import Button from '@hcengineering/ui/src/components/Button.svelte'
  import Icon from '@hcengineering/ui/src/components/Icon.svelte'
  import { unholyAi, unholyAiId } from '@hcengineering/unholy-ai'

  export let meetingId: string
  export let insights: any = null
  export let transcript: any[] = []
  export let onClose: () => void

  const dispatch = createEventDispatcher()

  let activeTab = 'insights'
  let isLoading = false
  let searchTerm = ''

  async function loadMeetingData() {
    if (!meetingId) return

    isLoading = true

    try {
      // Load insights
      const insightsResponse = await fetch(`/api/ai/meeting-insights/${meetingId}`)
      if (insightsResponse.ok) {
        insights = await insightsResponse.json()
      }

      // Load transcript
      const transcriptResponse = await fetch(`/api/ai/meeting-transcript/${meetingId}`)
      if (transcriptResponse.ok) {
        transcript = await transcriptResponse.json()
      }

    } catch (error) {
      showMessage('Failed to load meeting data: ' + error.message, 'error')
    } finally {
      isLoading = false
    }
  }

  function filterTranscript() {
    if (!searchTerm) return transcript

    const lowerSearch = searchTerm.toLowerCase()
    return transcript.filter(item =>
      item.text.toLowerCase().includes(lowerSearch) ||
      item.speaker.toLowerCase().includes(lowerSearch) ||
      item.tags?.some(tag => tag.toLowerCase().includes(lowerSearch))
    )
  }

  function createTaskFromActionItem(actionItem: any) {
    dispatch('createTask', actionItem)
    showMessage('Task created from action item!', 'success')
  }

  function exportTranscript() {
    const transcriptText = transcript
      .map(t => `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.speaker}: ${t.text}`)
      .join('\n')

    const blob = new Blob([transcriptText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meeting-${meetingId}-transcript.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function getSentimentColor(sentiment: string): string {
    switch (sentiment) {
      case 'positive': return '#10b981'
      case 'negative': return '#ef4444'
      default: return '#6b7280'
    }
  }

  function getEngagementColor(level: string): string {
    switch (level) {
      case 'high': return '#10b981'
      case 'low': return '#ef4444'
      default: return '#f59e0b'
    }
  }

  function getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return '#ef4444'
      case 'medium': return '#f59e0b'
      default: return '#10b981'
    }
  }

  // Load data when component mounts
  $: if (meetingId) {
    loadMeetingData()
  }

  const filteredTranscript = $: searchTerm ? filterTranscript() : transcript
</script>

<div class="meeting-insights-viewer">
  <div class="viewer-header">
    <h2>
      <Icon icon={unholyAi.icon.Sparkles} />
      Meeting Insights
    </h2>
    <div class="header-actions">
      <Button variant="outline" size="small" on:click={exportTranscript}>
        <Icon icon={unholyAi.icon.Transcript} />
        Export Transcript
      </Button>
      <Button variant="ghost" size="small" on:click={onClose}>
        ✕
      </Button>
    </div>
  </div>

  {#if isLoading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading meeting insights...</p>
    </div>
  {:else}
    <div class="viewer-tabs">
      <button
        class="tab-button {activeTab === 'insights' ? 'active' : ''}"
        on:click={() => activeTab = 'insights'}
      >
        📊 Insights
      </button>
      <button
        class="tab-button {activeTab === 'transcript' ? 'active' : ''}"
        on:click={() => activeTab = 'transcript'}
      >
        📝 Transcript ({transcript.length})
      </button>
      <button
        class="tab-button {activeTab === 'action-items' ? 'active' : ''}"
        on:click={() => activeTab = 'action-items'}
      >
        ✅ Action Items ({insights?.actionItems?.length || 0})
      </button>
    </div>

    <div class="viewer-content">
      {#if activeTab === 'insights' && insights}
        <div class="insights-panel">
          <!-- Meeting Summary -->
          <div class="insight-section summary">
            <h3>📋 Meeting Summary</h3>
            <p class="summary-text">{insights.summary}</p>
          </div>

          <!-- Key Metrics -->
          <div class="insight-section metrics">
            <h3>📈 Meeting Metrics</h3>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-label">Sentiment</div>
                <div class="metric-value" style="color: {getSentimentColor(insights.sentiment)}">
                  {insights.sentiment?.toUpperCase() || 'NEUTRAL'}
                </div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Engagement</div>
                <div class="metric-value" style="color: {getEngagementColor(insights.engagementLevel)}">
                  {insights.engagementLevel?.toUpperCase() || 'MEDIUM'}
                </div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Action Items</div>
                <div class="metric-value">{insights.actionItemsCount || 0}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Decisions</div>
                <div class="metric-value">{insights.decisionsCount || 0}</div>
              </div>
            </div>
          </div>

          <!-- Key Decisions -->
          {#if insights.keyDecisions && insights.keyDecisions.length > 0}
            <div class="insight-section decisions">
              <h3>🎯 Key Decisions</h3>
              <ul class="decision-list">
                {#each insights.keyDecisions as decision}
                  <li class="decision-item">{decision}</li>
                {/each}
              </ul>
            </div>
          {/if}

          <!-- Participation Analysis -->
          <div class="insight-section participation">
            <h3>👥 Participation Analysis</h3>
            <div class="participation-grid">
              <div class="participation-column">
                <h4>Most Active</h4>
                <div class="speaker-list">
                  {#each insights.dominantSpeakers || [] as speaker}
                    <div class="speaker-item dominant">
                      <span class="speaker-icon">🎤</span>
                      {speaker}
                    </div>
                  {/each}
                </div>
              </div>
              <div class="participation-column">
                <h4>Less Active</h4>
                <div class="speaker-list">
                  {#each insights.quietParticipants || [] as speaker}
                    <div class="speaker-item quiet">
                      <span class="speaker-icon">🔇</span>
                      {speaker}
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>

          <!-- Next Steps -->
          {#if insights.nextSteps && insights.nextSteps.length > 0}
            <div class="insight-section next-steps">
              <h3>➡️ Next Steps</h3>
              <ul class="next-steps-list">
                {#each insights.nextSteps as step}
                  <li class="step-item">{step}</li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      {:else if activeTab === 'transcript'}
        <div class="transcript-panel">
          <div class="transcript-header">
            <h3>📝 Meeting Transcript</h3>
            <div class="search-box">
              <input
                type="text"
                placeholder="Search transcript..."
                bind:value={searchTerm}
                class="search-input"
              />
            </div>
          </div>

          <div class="transcript-content">
            {#if filteredTranscript.length === 0}
              <div class="empty-transcript">
                <p>{searchTerm ? 'No matching entries found' : 'No transcript available'}</p>
              </div>
            {:else}
              <div class="transcript-list">
                {#each filteredTranscript as entry}
                  <div class="transcript-entry">
                    <div class="entry-header">
                      <span class="entry-time">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                      <span class="entry-speaker">{entry.speaker}</span>
                      {#if entry.isAction}
                        <span class="action-badge">ACTION</span>
                      {/if}
                    </div>
                    <div class="entry-text">{entry.text}</div>
                    {#if entry.confidence}
                      <div class="entry-confidence">
                        Confidence: {Math.round(entry.confidence * 100)}%
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {:else if activeTab === 'action-items'}
        <div class="action-items-panel">
          <h3>✅ Action Items</h3>

          {#if insights?.actionItems && insights.actionItems.length > 0}
            <div class="action-items-list">
              {#each insights.actionItems as item}
                <div class="action-item-card">
                  <div class="action-header">
                    <div class="action-priority" style="color: {getPriorityColor(item.priority)}">
                      {item.priority.toUpperCase()}
                    </div>
                    {#if item.dueDate}
                      <div class="action-due">📅 {item.dueDate}</div>
                    {/if}
                  </div>
                  <div class="action-description">{item.description}</div>
                  {#if item.assignee}
                    <div class="action-assignee">👤 {item.assignee}</div>
                  {/if}
                  {#if item.context}
                    <div class="action-context">
                      <strong>Context:</strong> {item.context}
                    </div>
                  {/if}
                  <div class="action-actions">
                    <Button
                      variant="primary"
                      size="small"
                      on:click={() => createTaskFromActionItem(item)}
                    >
                      <Icon icon={unholyAi.icon.Sparkles} />
                      Create Task
                    </Button>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="empty-action-items">
              <p>No action items were identified in this meeting.</p>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .meeting-insights-viewer {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    max-width: 900px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .viewer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #e5e7eb;
    background: linear-gradient(135deg, #667eea05 0%, #764ba205 100%);
  }

  .viewer-header h2 {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    color: #1f2937;
    font-size: 1.5em;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
    color: #6b7280;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .viewer-tabs {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    background: #f8fafc;
  }

  .tab-button {
    padding: 12px 24px;
    border: none;
    background: none;
    cursor: pointer;
    font-weight: 500;
    color: #6b7280;
    transition: all 0.2s ease;
    border-bottom: 2px solid transparent;
  }

  .tab-button:hover {
    color: #374151;
    background: rgba(0, 0, 0, 0.05);
  }

  .tab-button.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
    background: white;
  }

  .viewer-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  .insight-section {
    margin-bottom: 32px;
  }

  .insight-section h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    color: #1f2937;
    font-size: 1.2em;
  }

  .summary-text {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    line-height: 1.6;
    color: #374151;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .metric-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
  }

  .metric-label {
    font-size: 0.9em;
    color: #6b7280;
    margin-bottom: 8px;
  }

  .metric-value {
    font-size: 1.4em;
    font-weight: 600;
  }

  .decision-list, .next-steps-list {
    list-style: none;
    padding: 0;
  }

  .decision-item, .step-item {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 8px;
    position: relative;
    padding-left: 32px;
  }

  .decision-item::before {
    content: '🎯';
    position: absolute;
    left: 12px;
    top: 12px;
  }

  .step-item::before {
    content: '➡️';
    position: absolute;
    left: 12px;
    top: 12px;
  }

  .participation-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .participation-column h4 {
    margin-bottom: 12px;
    color: #374151;
    font-size: 1em;
  }

  .speaker-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-radius: 6px;
    margin-bottom: 6px;
  }

  .speaker-item.dominant {
    background: #10b98115;
    color: #10b981;
  }

  .speaker-item.quiet {
    background: #ef444415;
    color: #ef4444;
  }

  .transcript-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .transcript-header h3 {
    margin: 0;
    color: #1f2937;
  }

  .search-box {
    width: 300px;
  }

  .search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
  }

  .transcript-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .transcript-entry {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
  }

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .entry-time {
    color: #6b7280;
    font-size: 0.9em;
  }

  .entry-speaker {
    font-weight: 600;
    color: #374151;
  }

  .action-badge {
    background: #3b82f6;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75em;
    font-weight: 600;
  }

  .entry-text {
    color: #1f2937;
    line-height: 1.5;
    margin-bottom: 8px;
  }

  .entry-confidence {
    color: #6b7280;
    font-size: 0.85em;
    font-style: italic;
  }

  .action-items-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .action-item-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    border-left: 4px solid #3b82f6;
  }

  .action-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .action-priority {
    font-weight: 600;
    font-size: 0.9em;
  }

  .action-due {
    color: #6b7280;
    font-size: 0.9em;
  }

  .action-description {
    color: #1f2937;
    line-height: 1.5;
    margin-bottom: 12px;
    font-weight: 500;
  }

  .action-assignee {
    color: #6b7280;
    margin-bottom: 8px;
  }

  .action-context {
    color: #6b7280;
    font-size: 0.9em;
    margin-bottom: 12px;
  }

  .action-actions {
    display: flex;
    gap: 8px;
  }

  .empty-transcript, .empty-action-items {
    text-align: center;
    padding: 40px;
    color: #6b7280;
  }

  @media (max-width: 768px) {
    .meeting-insights-viewer {
      max-height: 90vh;
    }

    .viewer-header {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }

    .participation-grid {
      grid-template-columns: 1fr;
    }

    .search-box {
      width: 100%;
    }

    .transcript-header {
      flex-direction: column;
      gap: 12px;
    }
  }
</style>