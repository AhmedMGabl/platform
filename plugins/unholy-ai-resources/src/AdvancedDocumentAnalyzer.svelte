<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { Button, Card, Input, TextArea, ProgressBar } from '@hcengineering/ui'
  import type { Ref, Doc } from '@hcengineering/core'

  const dispatch = createEventDispatcher()

  export let documentContent = ''
  export let documentType = 'general'
  export let isAnalyzing = false
  export let analysisResults = {}
  export let analysisProgress = 0

  // Advanced document analysis features
  const documentTypes = [
    'contract', 'proposal', 'report', 'specification', 'manual', 'article', 'email', 'presentation'
  ]

  async function analyzeDocument() {
    if (!documentContent.trim()) {
      dispatch('analysisError', { message: 'Please provide document content for analysis' })
      return
    }

    isAnalyzing = true
    analysisProgress = 0

    dispatch('analysisStart', {})

    try {
      const response = await fetch('/api/v1/unholy-ai/advanced-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: documentContent,
          documentType,
          analysisTypes: [
            'sentiment_analysis',
            'entity_extraction',
            'topic_classification',
            'risk_assessment',
            'compliance_check',
            'action_items',
            'summary_generation',
            'readability_score',
            'keyword_extraction',
            'structure_analysis'
          ],
          context: 'document_processing'
        })
      }).then(r => r.json())

      if (response.success) {
        analysisResults = response.data
        analysisProgress = 100

        dispatch('analysisComplete', {
          results: response.data,
          metadata: {
            wordCount: response.data.wordCount,
            readingTime: response.data.estimatedReadingTime,
            complexity: response.data.complexity,
            sentiment: response.data.sentiment,
            language: response.data.detectedLanguage,
            structure: response.data.documentStructure
          }
        })
      } else {
        dispatch('analysisError', {
          message: response.error || 'Analysis failed',
          details: response.details
        })
      }
    } catch (error) {
      dispatch('analysisError', {
        message: 'Network error during analysis',
        details: error.message
      })
    }

    isAnalyzing = false
  }

  function extractKeyInsights() {
    const insights = []

    if (analysisResults.actionItems) {
      insights.push({
        type: 'action_items',
        title: '🎯 Action Items',
        count: analysisResults.actionItems.length,
        priority: 'high'
      })
    }

    if (analysisResults.risks) {
      insights.push({
        type: 'risks',
        title: '⚠️ Identified Risks',
        count: analysisResults.risks.length,
        priority: 'critical'
      })
    }

    if (analysisResults.sentiment) {
      insights.push({
        type: 'sentiment',
        title: '😊 Document Sentiment',
        value: analysisResults.sentiment.overall,
        confidence: analysisResults.sentiment.confidence
      })
    }

    return insights
  }

  function getReadabilityLevel(score: number) {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  function getComplexityLevel(score: number) {
    if (score >= 70) return 'High'
    if (score >= 40) return 'Medium'
    return 'Low'
  }
</script>

<div class="advanced-document-analyzer">
  <div class="analyzer-header">
    <div class="analyzer-title">
      <h2>📄 Advanced Document Analyzer</h2>
      <div class="status">
        {#if isAnalyzing}
          <div class="analyzing-indicator">
            <div class="spinner"></div>
            <span>Analyzing document...</span>
            <div class="progress-bar" style="width: {analysisProgress}%"></div>
          </div>
        {:else if analysisResults.sentiment}
          <div class="analysis-complete">
            <div class="status-badge {analysisResults.sentiment.overall === 'positive' ? 'positive' : analysisResults.sentiment.overall === 'negative' ? 'negative' : 'neutral'}">
              {analysisResults.sentiment.overall === 'positive' ? '😊' : analysisResults.sentiment.overall === 'negative' ? '😟' : '😐'}
              {analysisResults.sentiment.overall}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="analyzer-controls">
    <div class="document-input-section">
      <div class="input-group">
        <label>Document Content</label>
        <TextArea
          bind:value={documentContent}
          placeholder="Paste or type your document content here..."
          rows={8}
          disabled={isAnalyzing}
        />
      </div>

      <div class="input-group">
        <label>Document Type</label>
        <select bind:value={documentType} disabled={isAnalyzing}>
          <option value="general">General Document</option>
          {#each documentTypes as type}
            <option value={type}>{type}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="action-buttons">
      <Button
        type="primary"
        on:click={analyzeDocument}
        disabled={isAnalyzing || !documentContent.trim()}
      >
        {isAnalyzing ? '🔄 Analyzing...' : '🧠 Start Advanced Analysis'}
      </Button>

      <Button
        type="secondary"
        on:click={() => {
          documentContent = ''
          analysisResults = {}
          analysisProgress = 0
        }}
        disabled={isAnalyzing}
      >
        🗑️ Clear
      </Button>

      <Button
        type="secondary"
        on:click={() => dispatch('exportAnalysis', { results: analysisResults })}
        disabled={!analysisResults || Object.keys(analysisResults).length === 0}
      >
        📤 Export Results
      </Button>
    </div>
  </div>

  {#if isAnalyzing}
    <div class="analysis-progress">
      <div class="progress-steps">
        <div class="step {analysisProgress >= 20 ? 'active' : ''}">
          <div class="step-indicator">✓</div>
          <div class="step-text">Parsing document structure</div>
        </div>
        <div class="step {analysisProgress >= 40 ? 'active' : ''}">
          <div class="step-indicator">✓</div>
          <div class="step-text">Extracting entities & topics</div>
        </div>
        <div class="step {analysisProgress >= 60 ? 'active' : ''}">
          <div class="step-indicator">✓</div>
          <div class="step-text">Analyzing sentiment & tone</div>
        </div>
        <div class="step {analysisProgress >= 80 ? 'active' : ''}">
          <div class="step-indicator">✓</div>
          <div class="step-text">Generating insights & recommendations</div>
        </div>
        <div class="step {analysisProgress >= 100 ? 'active' : ''}">
          <div class="step-indicator">✓</div>
          <div class="step-text">Analysis complete</div>
        </div>
      </div>

      <div class="progress-animation">
        <div class="wave"></div>
      </div>
    </div>
  {/if}

  {#if analysisResults && Object.keys(analysisResults).length > 0}
    <div class="analysis-results">
      <div class="results-grid">
        <!-- Document Metadata -->
        <Card class="result-card">
          <div class="card-header">
            <h3>📊 Document Metrics</h3>
          </div>
          <div class="metrics">
            <div class="metric">
              <div class="metric-label">Word Count</div>
              <div class="metric-value">{analysisResults.wordCount?.toLocaleString() || 'N/A'}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Reading Time</div>
              <div class="metric-value">{analysisResults.readingTime || 'N/A'}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Complexity</div>
              <div class="metric-value complexity-{analysisResults.complexity?.toLowerCase()}">{getComplexityLevel(analysisResults.complexity)}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Readability</div>
              <div class="metric-value readability-{analysisResults.readabilityScore >= 70 ? 'good' : analysisResults.readabilityScore >= 40 ? 'fair' : 'poor'}">{getReadabilityLevel(analysisResults.readabilityScore)}</div>
            </div>
          </div>
        </Card>

        <!-- Sentiment Analysis -->
        {#if analysisResults.sentiment}
          <Card class="result-card">
            <div class="card-header">
              <h3>😊 Sentiment Analysis</h3>
            </div>
            <div class="sentiment-breakdown">
              <div class="sentiment-item">
                <div class="sentiment-label">Overall Tone</div>
                <div class="sentiment-value overall-{analysisResults.sentiment.overall}">
                  <div class="sentiment-icon">
                    {analysisResults.sentiment.overall === 'positive' ? '😊' : analysisResults.sentiment.overall === 'negative' ? '😟' : '😐'}
                  </div>
                  <span>{analysisResults.sentiment.overall}</span>
                  <div class="confidence">Confidence: {analysisResults.sentiment.confidence}%</div>
                </div>
              </div>
              <div class="sentiment-details">
                {#each analysisResults.sentiment.aspects as aspect}
                  <div class="aspect-item">
                    <div class="aspect-label">{aspect.aspect}</div>
                    <div class="aspect-value aspect-{aspect.sentiment}">
                      <div class="aspect-indicator">
                        {aspect.sentiment === 'positive' ? '▲' : aspect.sentiment === 'negative' ? '▼' : '→'}
                      {aspect.sentiment === 'positive' ? '😊' : aspect.sentiment === 'negative' ? '😟' : '😐'}
                      {aspect.sentiment}
                      {aspect.sentiment === 'positive' ? '+' : aspect.sentiment === 'negative' ? '-' : ''}
                    </div>
                    <span class="aspect-score">{aspect.score}</span>
                  </div>
                </div>
                {/each}
              </div>
            </div>
          </Card>
        {/if}

        <!-- Key Entities -->
        {#if analysisResults.entities}
          <Card class="result-card">
            <div class="card-header">
              <h3>🏷️ Key Entities</h3>
            </div>
            <div class="entities-grid">
              {#each analysisResults.entities as entity}
                <div class="entity-item">
                  <div class="entity-type">{entity.type}</div>
                  <div class="entity-text">{entity.text}</div>
                  <div class="entity-confidence">Confidence: {entity.confidence}%</div>
                </div>
              {/each}
            </div>
          </Card>
        {/if}

        <!-- Topics & Themes -->
        {#if analysisResults.topics}
          <Card class="result-card">
            <div class="card-header">
              <h3>🏷️ Topics & Themes</h3>
            </div>
            <div class="topics-list">
              {#each analysisResults.topics as topic}
                <div class="topic-item">
                  <div class="topic-name">{topic.name}</div>
                  <div class="topic-weight">Weight: {topic.weight}</div>
                  <div class="topic-relevance">Relevance: {topic.relevance}%</div>
                </div>
              {/each}
            </div>
          </Card>
        {/if}

        <!-- Structure Analysis -->
        {#if analysisResults.structure}
          <Card class="result-card">
            <div class="card-header">
              <h3>📄 Document Structure</h3>
            </div>
            <div class="structure-details">
              <div class="structure-item">
                <div class="structure-label">Sections</div>
                <div class="structure-value">{analysisResults.structure.sections?.length || 0}</div>
              </div>
              <div class="structure-item">
                <div class="structure-label">Headings</div>
                <div class="structure-value">{analysisResults.structure.headings?.length || 0}</div>
              </div>
              <div class="structure-item">
                <div class="structure-label">Paragraphs</div>
                <div class="structure-value">{analysisResults.structure.paragraphs || 0}</div>
              </div>
            </div>
          </Card>
        {/if}

        <!-- Action Items -->
        {#if analysisResults.actionItems}
          <Card class="result-card action-items-card">
            <div class="card-header">
              <h3>🎯 Action Items</h3>
              <span class="item-count">{analysisResults.actionItems.length} items</span>
            </div>
            <div class="action-items-list">
              {#each analysisResults.actionItems as item}
                <div class="action-item priority-{item.priority}">
                  <div class="action-text">
                    <div class="action-checkbox">
                      <input type="checkbox" />
                    </div>
                    <div class="action-content">
                      <div class="action-title">{item.text}</div>
                      <div class="action-meta">
                        <span class="priority">{item.priority.toUpperCase()}</span>
                        {#if item.assignee}
                          <span class="assignee">→ {item.assignee}</span>
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </Card>
        {/if}

        <!-- Risk Assessment -->
        {#if analysisResults.risks}
          <Card class="result-card risk-card">
            <div class="card-header">
              <h3>⚠️ Risk Assessment</h3>
              <span class="risk-count">{analysisResults.risks.length} risks identified</span>
            </div>
            <div class="risks-list">
              {#each analysisResults.risks as risk}
                <div class="risk-item severity-{risk.severity.toLowerCase()}">
                  <div class="risk-severity">{risk.severity.toUpperCase()}</div>
                  <div class="risk-content">
                    <div class="risk-title">{risk.title}</div>
                    <div class="risk-description">{risk.description}</div>
                    <div class="risk-mitigation">
                      <strong>Mitigation:</strong> {risk.mitigation}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </Card>
        {/if}
      </div>

      <!-- AI Recommendations -->
      <Card class="result-card recommendations-card">
        <div class="card-header">
          <h3>💡 AI Recommendations</h3>
        </div>
        <div class="recommendations-list">
          <div class="recommendation-item">
            <div class="rec-icon">📈</div>
            <div class="rec-text">Improve readability by simplifying complex sentences</div>
          </div>
          <div class="recommendation-item">
            <div class="rec-icon">🎯</div>
            <div class="rec-text">Add specific action items for better task tracking</div>
          </div>
          <div class="recommendation-item">
            <div class="rec-icon">📊</div>
            <div class="rec-text">Include data visualizations for better comprehension</div>
          </div>
          <div class="recommendation-item">
            <div class="rec-icon">⚖️</div>
            <div class="rec-text">Consider adding compliance checks for regulatory requirements</div>
          </div>
        </div>
      </Card>
    </div>
  </div>
{/if}
</div>

<style>
  .advanced-document-analyzer {
    background: linear-gradient(135deg, #1e3a8a 0%, #2d5f8b 100%);
    color: white;
    padding: 20px;
    border-radius: 12px;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    max-width: 1000px;
  }

  .analyzer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
  }

  .analyzer-title {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .analyzer-title h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }

  .analysis-complete {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-badge.positive {
    background: #4CAF50;
    color: white;
  }

  .status-badge.negative {
    background: #f44336;
    color: white;
  }

  .status-badge.neutral {
    background: #6c757d;
    color: white;
  }

  .analyzer-controls {
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 8px;
  }

  .document-input-section {
    margin-bottom: 20px;
  }

  .input-group {
    margin-bottom: 15px;
  }

  .input-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .action-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .analysis-progress {
    background: rgba(0, 0, 0, 0.1);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .progress-steps {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 10px;
    opacity: 0.3;
    transition: opacity 0.3s;
  }

  .step.active {
    opacity: 1;
    transform: scale(1.05);
  }

  .step-indicator {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #4CAF50;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
  }

  .step-text {
    font-size: 13px;
  }

  .progress-animation {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .wave {
    width: 40px;
    height: 4px;
    background: linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.3), transparent);
    border-radius: 2px;
    animation: wave 1.5s ease-in-out infinite;
  }

  @keyframes wave {
    0% { transform: translateX(-100%) scaleY(0); }
    50% { transform: translateX(0%) scaleY(1); }
    100% { transform: translateX(100%) scaleY(0); }
  }

  .analysis-results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .result-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 10px;
  }

  .card-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .item-count {
    background: #4CAF50;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
  }

  .metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
  }

  .metric {
    text-align: center;
    padding: 10px;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.05);
  }

  .metric-label {
    font-size: 12px;
    opacity: 0.8;
    margin-bottom: 4px;
  }

  .metric-value {
    font-weight: 600;
    font-size: 16px;
  }

  .complexity-excellent { color: #4CAF50; }
  .complexity-good { color: #8BC34A; }
  .complexity-fair { color: #FFC107; }
  .complexity-poor { color: #f44336; }

  .readability-excellent { color: #4CAF50; }
  .readability-good { color: #8BC34A; }
  .readability-fair { color: #FFC107; }
  .readability-poor { color: #f44336; }

  .sentiment-breakdown {
    display: grid;
    gap: 10px;
  }

  .sentiment-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sentiment-label {
    font-weight: 500;
    min-width: 80px;
  }

  .sentiment-value {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 600;
  }

  .sentiment-value.overall-positive {
    background: #4CAF50;
    color: white;
  }

  .sentiment-value.overall-negative {
    background: #f44336;
    color: white;
  }

  .sentiment-value.overall-neutral {
    background: #6c757d;
    color: white;
  }

  .aspect-indicator {
    font-size: 16px;
    margin-right: 6px;
  }

  .confidence {
    font-size: 11px;
    opacity: 0.8;
    margin-left: 8px;
  }

  .entities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
  }

  .entity-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.05);
  }

  .entity-type {
    background: #4CAF50;
    color: white;
    padding: 2px 6px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
  }

  .entity-text {
    font-weight: 500;
  }

  .topic-weight {
    font-size: 11px;
    opacity: 0.7;
  }

  .topic-relevance {
    font-size: 11px;
    opacity: 0.7;
  }

  .structure-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 10px;
  }

  .structure-item {
    text-align: center;
    padding: 10px;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.05);
  }

  .structure-label {
    font-size: 12px;
    opacity: 0.8;
    margin-bottom: 4px;
  }

  .structure-value {
    font-weight: 600;
    font-size: 16px;
  }

  .action-items-card {
    background: rgba(76, 175, 80, 0.05);
    border: 1px solid rgba(76, 175, 80, 0.2);
  }

  .action-items-list {
    display: grid;
    gap: 10px;
  }

  .action-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
  }

  .action-item.priority-high {
    border-left: 4px solid #f44336;
  }

  .action-item.priority-medium {
    border-left: 4px solid #FFC107;
  }

  .action-item.priority-low {
    border-left: 4px solid #4CAF50;
  }

  .action-checkbox {
    margin-right: 8px;
  }

  .action-content {
    flex: 1;
  }

  .action-title {
    font-weight: 500;
    margin-bottom: 4px;
  }

  .action-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }

  .priority {
    padding: 2px 6px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 600;
  }

  .priority.HIGH {
    background: #f44336;
    color: white;
  }

  .priority.MEDIUM {
    background: #FFC107;
    color: white;
  }

  .priority.LOW {
    background: #4CAF50;
    color: white;
  }

  .assignee {
    background: rgba(0, 0, 0, 0.1);
    padding: 2px 6px;
    border-radius: 12px;
    font-size: 11px;
  }

  .risk-card {
    background: rgba(244, 67, 54, 0.05);
    border: 1px solid rgba(244, 67, 54, 0.2);
  }

  .risk-count {
    background: #f44336;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
  }

  .risks-list {
    display: grid;
    gap: 10px;
  }

  .risk-item {
    padding: 15px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
  }

  .risk-severity {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .severity.CRITICAL {
    background: #f44336;
    color: white;
  }

  .severity.HIGH {
    background: #ff6b35;
    color: white;
  }

  .severity.MEDIUM {
    background: #fbbf24;
    color: #212529;
  }

  .severity.LOW {
    background: #4CAF50;
    color: #212529;
  }

  .risk-content {
    flex: 1;
  }

  .risk-title {
    font-weight: 600;
    margin-bottom: 6px;
  }

  .risk-description {
    opacity: 0.8;
    margin-bottom: 8px;
  }

  .risk-mitigation {
    background: rgba(76, 175, 80, 0.1);
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
  }

  .recommendations-card {
    background: rgba(76, 175, 80, 0.05);
    border: 1px solid rgba(76, 175, 80, 0.2);
  }

  .recommendations-list {
    display: grid;
    gap: 10px;
  }

  .recommendation-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
  }

  .rec-icon {
    font-size: 20px;
    margin-right: 8px;
  }

  .rec-text {
    flex: 1;
    font-size: 13px;
  }
</style>