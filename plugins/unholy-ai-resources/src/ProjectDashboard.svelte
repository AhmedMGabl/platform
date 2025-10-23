<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { Button, Card, ProgressBar, Icon } from '@hcengineering/ui'
  import type { Ref, Doc } from '@hcengineering/core'

  const dispatch = createEventDispatcher()

  export let activeView = 'overview'
  export let projects = []
  export let isLoading = false

  // Dashboard data
  interface Project {
    id: string
    name: string
    status: 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled'
    progress: number
    teamSize: number
    deadline: string
    budget: number
    createdAt: Timestamp
    updatedAt: Timestamp
    metrics: {
      tasksCompleted: number
      tasksTotal: number
      hoursSpent: number
      budgetUsed: number
      budgetRemaining: number
      riskScore: number
      teamProductivity: number
    }
  }

  async function loadProjects() {
    isLoading = true

    const response = await fetch('/api/v1/unholy-ai/projects/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAPIKey()}`
      }
    }).then(r => r.json())

    if (response.success) {
      projects = response.data.projects || []
      dispatch('projectsLoaded', { projects })
    }

    isLoading = false
  }

  function getProjectStatusIcon(status: string) {
    switch (status) {
      case 'planning': return '📝'
      case 'active': return '🚀'
      case 'completed': return '✅'
      case 'on_hold': return '⏸'
      case 'cancelled': return '❌'
      default: return '📋'
    }
  }

  function getStatusClass(status: string) {
    switch (status) {
      case 'active': return 'status-active'
      case 'completed': return 'status-completed'
      case 'at_risk': return 'status-warning'
      case 'over_budget': return 'status-danger'
      case 'on_hold': return 'status-paused'
      default: return 'status-default'
    }
  }

  function formatDate(timestamp: Timestamp): string {
    return new Date(timestamp).toLocaleDateString()
  }

  // Initialize dashboard on mount
  loadProjects()

  function createNewProject() {
    const projectName = prompt('Enter project name:')
    if (!projectName) return

    dispatch('createProject', {
      name: projectName,
      goals: [],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      budget: 0,
      teamSize: 0
      status: 'planning',
      metrics: {
        tasksCompleted: 0,
        tasksTotal: 0,
        hoursSpent: 0,
        budgetUsed: 0,
        budgetRemaining: 0,
        riskScore: 0,
        teamProductivity: 0
      }
    })
  }

  function updateProjectStatus(projectId: string, status: string) {
    projects = projects.map(p => {
      if (p.id === projectId) {
        return { ...p, status, updatedAt: Date.now() as Timestamp }
      }
      return p
    })
  }

  // Real-time dashboard updates
  const ws = new WebSocket('ws://localhost:3332')

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)

    switch (data.type) {
      case 'project_update':
        projects = projects.map(p => {
          if (p.id === data.projectId) {
            return { ...p, ...data.updates, updatedAt: Date.now() as Timestamp }
          }
          return p
        })
        break

      case 'task_created':
      case 'task_completed':
      case 'team_member_added':
        // Update project metrics
        projects = projects.map(p => {
          if (p.id === data.projectId) {
            const updatedMetrics = {
              ...p.metrics,
              tasksTotal: p.metrics.tasksTotal + 1,
              tasksCompleted: p.metrics.tasksCompleted + (data.type === 'task_completed' ? 1 : 0),
              teamSize: p.teamSize + (data.type === 'team_member_added' ? 1 : 0)
            }
            return { ...p, metrics: updatedMetrics, updatedAt: Date.now() as Timestamp }
          }
          return p
        })
        break

      case 'risk_identified':
        projects = projects.map(p => {
          if (p.id === data.projectId) {
            return {
              ...p,
              status: 'at_risk',
              riskScore: Math.max(0, p.riskScore - 20),
              updatedAt: Date.now() as Timestamp
            }
          }
          return p
        })
        break
    }
  }

  ws.onopen = () => {
    console.log('WebSocket connected for real-time updates')
  }

  ws.onclose = () => {
    console.log('WebSocket disconnected, attempting to reconnect...')
    setTimeout(loadProjects, 2000)
  }
</script>

<div class="project-dashboard">
  <div class="dashboard-header">
    <div class="dashboard-title">
      <h1>📊 AI Project Dashboard</h1>
      <div class="dashboard-actions">
        <Button type="primary" on:click={createNewProject}>
          ➕ New Project
        </Button>
        <Button type="secondary" on:click={loadProjects} disabled={isLoading}>
          {isLoading ? '🔄 Refreshing...' : '🔄 Refresh'}
        </Button>
      </div>
    </div>
  </div>

  <div class="dashboard-filters">
    <div class="filter-group">
      <label>Filter by Status:</label>
      <select bind:value={activeView}>
        <option value="all">All Projects</option>
        <option value="planning">Planning</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="at_risk">At Risk</option>
      </select>
    </div>
  </div>

  <div class="projects-grid">
    {#each projects.filter(p => activeView === 'all' || p.status === activeView)}
      <Card class="project-card {getStatusClass(p.status)}">
        <div class="card-header">
          <div class="project-title">{p.name}</div>
          <div class="project-status">
            <span class="status-icon">{getProjectStatusIcon(p.status)}</span>
            <span class="status-text">{p.status.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div class="project-meta">
            <span class="meta-item">👥 {p.teamSize} members</span>
            <span class="meta-item">📅 Deadline: {formatDate(p.deadline)}</span>
            <span class="meta-item">💰 Budget: ${p.budget.toLocaleString()}</span>
          </div>
        </div>

        <div class="card-content">
          <div class="metrics-section">
            <h4>📈 Project Metrics</h4>
            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-label">Progress</div>
                <div class="metric-value">{p.metrics.tasksCompleted}/{p.metrics.tasksTotal}</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Team Size</div>
                <div class="metric-value">{p.teamSize}</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Budget Used</div>
                <div class="metric-value">${p.metrics.budgetUsed.toLocaleString()}</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Hours Spent</div>
                <div class="metric-value">{p.metrics.hoursSpent}h</div>
              </div>
            </div>
          </div>

          <div class="progress-section">
            <h4>🎯 Project Status</h4>
            <ProgressBar progress={p.metrics.tasksCompleted / p.metrics.tasksTotal} />
            <div class="risk-score">
              Risk Score: <span class="risk-{p.riskScore <= 30 ? 'low' : p.riskScore <= 60 ? 'medium' : 'high'}">{p.riskScore}</span>
            </div>
        </div>

        <div class="card-footer">
          <div class="project-dates">
            <span class="date-label">Created:</span>
            <span class="date-value">{formatDate(p.createdAt)}</span>
            <span class="date-label">Updated:</span>
            <span class="date-value">{formatDate(p.updatedAt)}</span>
          </div>
        </div>
      </Card>
    {/each}
  </div>

  {#if projects.length === 0}
    <div class="empty-state">
      <Icon icon="folder-open" />
      <h3>No projects yet</h3>
      <p>Create your first AI-enhanced project to get started!</p>
      <Button type="primary" on:click={createNewProject}>
        🚀 Create First Project
      </Button>
    </div>
  {/if}
</div>

<style>
  .project-dashboard {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 12px;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    max-width: 1200px;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
  }

  .dashboard-title {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .dashboard-title h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
  }

  .dashboard-actions {
    display: flex;
    gap: 10px;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
  }

  .project-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: transform 0.2s;
  }

  .project-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 10px;
  }

  .project-title {
    font-size: 18px;
    font-weight: 600;
    margin-right: 10px;
  }

  .project-status {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-icon {
    font-size: 16px;
  }

  .status-text {
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
  }

  .project-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
  }

  .meta-item {
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
  }

  .card-content {
    margin-top: 15px;
  }

  .metrics-section {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 10px;
  }

  .metric-item {
    text-align: center;
    padding: 10px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
  }

  .metric-label {
    font-size: 12px;
    opacity: 0.8;
    margin-bottom: 4px;
  }

  .metric-value {
    font-size: 16px;
    font-weight: 600;
    color: #4CAF50;
  }

  .progress-section {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 15px;
  }

  .risk-score {
    text-align: center;
    font-size: 14px;
    font-weight: 600;
  }

  .risk-score.low {
    color: #4CAF50;
  }

  .risk-score.medium {
    color: #FFC107;
  }

  .risk-score.high {
    color: #f44336;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
    font-size: 12px;
    opacity: 0.7;
  }

  .project-dates {
    display: flex;
    gap: 20px;
  }

  .date-label {
    font-weight: 500;
  }

  .date-value {
    opacity: 0.8;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
  }

  .empty-state h3 {
    font-size: 24px;
    margin-bottom: 10px;
  }

  .empty-state p {
    font-size: 14px;
    opacity: 0.7;
  }

  .dashboard-filters {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
  }

  .filter-group {
    margin-bottom: 10px;
  }

  .filter-group label {
    font-weight: 500;
    margin-right: 10px;
  }
</style>