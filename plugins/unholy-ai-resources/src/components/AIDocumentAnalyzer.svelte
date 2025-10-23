<script lang="ts">
  import { showPopup, showMessage, type Popup } from '@hcengineering/ui'
  import Button from '@hcengineering/ui/src/components/Button.svelte'
  import Textarea from '@hcengineering/ui/src/components/Textarea.svelte'
  import Icon from '@hcengineering/ui/src/components/Icon.svelte'
  import Spinner from '@hcengineering/ui/src/components/Spinner.svelte'
  import { unholyAi, unholyAiId } from '@hcengineering/unholy-ai'

  export let content: string = ''
  export let documentType: string = 'general'
  export let onAnalyze: (analysis: any) => void

  let isAnalyzing = false
  let analysis: any = null
  let popup: Popup | undefined

  async function analyzeDocument() {
    if (!content.trim()) {
      showMessage('Please provide content to analyze', 'error')
      return
    }

    isAnalyzing = true
    analysis = null

    try {
      const response = await fetch('/api/ai/analyze-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, documentType })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      analysis = await response.json()

    } catch (error) {
      showMessage('Failed to analyze document: ' + error.message, 'error')
    } finally {
      isAnalyzing = false
    }
  }

  function applyAnalysis() {
    if (!analysis) return
    onAnalyze(analysis)
    popup?.hide()
  }

  function openPopup() {
    analysis = null
    popup = showPopup({
      title: 'AI Document Analysis',
      content: AIDocumentAnalyzer,
      props: {
        content,
        documentType,
        onAnalyze
      },
      actions: [],
      closable: true
    })
  }

  function getSentimentColor(sentiment: string): string {
    switch (sentiment) {
      case 'positive': return '#10b981'
      case 'negative': return '#ef4444'
      default: return '#6b7280'
    }
  }

  function getReadabilityColor(score: number): string {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }
</script>

<div class="ai-document-analyzer">
  <div class="input-section">
    <h4>
      <Icon icon={unholyAi.icon.Sparkles} />
      Document Content
    </h4>

    <div class="document-type-selector">
      <label>Document Type:</label>
      <select bind:value={documentType}>
        <option value="general">General</option>
        <option value="requirement">Requirements</option>
        <option value="meeting">Meeting Notes</option>
        <option value="proposal">Proposal</option>
        <option value="report">Report</option>
        <option value="email">Email</option>
        <option value="specification">Specification</option>
      </select>
    </div>

    <Textarea
      bind:value={content}
      placeholder="Paste your document content here for AI analysis..."
      rows={8}
      disabled={isAnalyzing}
    />

    <div class="actions">
      <Button
        variant="primary"
        on:click={analyzeDocument}
        disabled={isAnalyzing || !content.trim()}
      >
        {#if isAnalyzing}
          <Spinner size="small" />
          Analyzing...
        {:else}
          <Icon icon={unholyAi.icon.AI} />
          Analyze Document
        {/if}
      </Button>
    </div>
  </div>

  {#if analysis}
    <div class="analysis-results">
      <h4>📊 Analysis Results</h4>

      <div class="result-grid">
        <!-- Summary -->
        <div class="result-card summary">
          <h5>📝 Summary</h5>
          <p>{analysis.summary}</p>
        </div>

        <!-- Sentiment & Readability -->
        <div class="result-card metrics">
          <h5>📈 Metrics</h5>
          <div class="metric">
            <span>Sentiment:</span>
            <span class="sentiment" style="color: {getSentimentColor(analysis.sentiment)}">
              {analysis.sentiment?.toUpperCase() || 'NEUTRAL'}
            </span>
          </div>
          <div class="metric">
            <span>Readability:</span>
            <span class="readability" style="color: {getReadabilityColor(analysis.readability || 0)}">
              {analysis.readability || 0}/100
            </span>
          </div>
        </div>

        <!-- Key Points -->
        {#if analysis.keyPoints && analysis.keyPoints.length > 0}
          <div class="result-card key-points">
            <h5>🎯 Key Points</h5>
            <ul>
              {#each analysis.keyPoints as point}
                <li>{point}</li>
              {/each}
            </ul>
          </div>
        {/if}

        <!-- Action Items -->
        {#if analysis.actionItems && analysis.actionItems.length > 0}
          <div class="result-card action-items">
            <h5>✅ Action Items</h5>
            <ul>
              {#each analysis.actionItems as item}
                <li class="action-item">{item}</li>
              {/each}
            </ul>
          </div>
        {/if}

        <!-- Suggestions -->
        {#if analysis.suggestions && analysis.suggestions.length > 0}
          <div class="result-card suggestions">
            <h5>💡 Suggestions</h5>
            <ul>
              {#each analysis.suggestions as suggestion}
                <li class="suggestion">{suggestion}</li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>

      <div class="final-actions">
        <Button variant="primary" on:click={applyAnalysis}>
          <Icon icon={unholyAi.icon.Sparkles} />
          Apply Insights
        </Button>
        <Button variant="outline" on:click={analyzeDocument}>
          Reanalyze
        </Button>
      </div>
    </div>
  {/if}
</div>

<style>
  .ai-document-analyzer {
    min-width: 700px;
    max-width: 900px;
    padding: 24px;
  }

  .input-section h4 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    color: #1f2937;
  }

  .document-type-selector {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .document-type-selector label {
    font-weight: 500;
    color: #374151;
  }

  .document-type-selector select {
    padding: 6px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    color: #374151;
  }

  .input-section textarea {
    width: 100%;
    margin-bottom: 16px;
    font-family: inherit;
  }

  .actions {
    text-align: right;
  }

  .analysis-results {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e5e7eb;
  }

  .analysis-results h4 {
    margin-bottom: 20px;
    color: #1f2937;
    font-size: 1.2em;
  }

  .result-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }

  .result-card {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
  }

  .result-card.summary {
    grid-column: 1 / -1;
  }

  .result-card h5 {
    margin-bottom: 12px;
    color: #374151;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .result-card p {
    line-height: 1.6;
    color: #4b5563;
    margin: 0;
  }

  .metrics {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .metric {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .metric:last-child {
    border-bottom: none;
  }

  .metric span:first-child {
    color: #6b7280;
    font-weight: 500;
  }

  .metric span:last-child {
    font-weight: 600;
  }

  .result-card ul {
    margin: 0;
    padding-left: 20px;
  }

  .result-card li {
    margin-bottom: 8px;
    line-height: 1.5;
    color: #4b5563;
  }

  .action-item {
    position: relative;
    padding-left: 8px;
  }

  .action-item::before {
    content: '✅';
    position: absolute;
    left: -20px;
  }

  .suggestion {
    position: relative;
    padding-left: 8px;
  }

  .suggestion::before {
    content: '💡';
    position: absolute;
    left: -20px;
  }

  .final-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
  }

  @media (max-width: 768px) {
    .ai-document-analyzer {
      min-width: auto;
      padding: 16px;
    }

    .result-grid {
      grid-template-columns: 1fr;
    }
  }
</style>