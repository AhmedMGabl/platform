<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { Button, Input, Select, TextArea, Card } from '@hcengineering/ui'
  import type { Ref, Doc } from '@hcengineering/core'

  const dispatch = createEventDispatcher()

  export let projectName = ''
  export let projectDescription = ''
  export let projectGoals = []
  export let deadlines = []
  export let teamMembers = []

  let isGenerating = false
  let activeView = 'overview'

  // AI-powered project management features
  async function generateProjectPlan() {
    isGenerating = true

    const response = await fetch('/api/v1/unholy-ai/project-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: `Create a comprehensive project plan for: ${projectName}\n\nDescription: ${projectDescription}\n\nGoals: ${projectGoals.join(', ')}\n\nTeam Members: ${teamMembers.join(', ')}`,
        context: 'project_planning'
      })
    }).then(r => r.json())

    if (response.success) {
      projectGoals = response.data.goals || []
      deadlines = response.data.deadlines || []
      teamMembers = response.data.teamAssignments || []

      dispatch('projectPlanGenerated', {
        goals: response.data.goals,
        milestones: response.data.milestones,
        tasks: response.data.tasks,
        teamAssignments: response.data.teamAssignments,
        risks: response.data.risks
      })
    }

    isGenerating = false
  }

  async function generateSmartTasks() {
    isGenerating = true

    const response = await fetch('/api/v1/unholy-ai/smart-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectName,
        projectDescription,
        currentGoals: projectGoals,
        context: 'task_breakdown'
      })
    }).then(r => r.json())

    if (response.success) {
      dispatch('smartTasksGenerated', {
        tasks: response.data.tasks,
        priorities: response.data.priorities,
        timeline: response.data.timeline,
        dependencies: response.data.dependencies
      })
    }

    isGenerating = false
  }

  async function optimizeResources() {
    isGenerating = true

    const response = await fetch('/api/v1/unholy-ai/resource-optimization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectName,
        currentTeam: teamMembers,
        existingTasks: [], // This would come from task plugin
        context: 'resource_management'
      })
    }).then(r => r.json())

    if (response.success) {
      dispatch('resourcesOptimized', {
        recommendations: response.data.recommendations,
        allocations: response.data.allocations,
        utilization: response.data.utilization,
        costOptimization: response.data.costSavings
      })
    }

    isGenerating = false
  }
</script>

<div class="ai-project-manager">
  <div class="project-header">
    <div class="project-title">
      <h2>🚀 AI-Powered Project Manager</h2>
      <div class="project-status">
        <span class="status-indicator active"></span>
        <span>Live AI Analysis</span>
      </div>
    </div>
    <p class="project-subtitle">Intelligent project planning and resource allocation</p>
  </div>

  <div class="project-controls">
    <div class="view-switcher">
      <button
        class="view-btn {activeView === 'overview' ? 'active' : ''}"
        on:click={() => activeView = 'overview'}
      >
        📊 Overview
      </button>
      <button
        class="view-btn {activeView === 'planning' ? 'active' : ''}"
        on:click={() => activeView = 'planning'}
      >
        🎯 Planning
      </button>
      <button
        class="view-btn {activeView === 'resources' ? 'active' : ''}"
        on:click={() => activeView = 'resources'}
      >
        👥 Resources
      </button>
      <button
        class="view-btn {activeView === 'insights' ? 'active' : ''}"
        on:click={() => activeView = 'insights'}
      >
        📈 Insights
      </button>
    </div>

    <div class="ai-actions">
      <Button
        type="primary"
        on:click={generateProjectPlan}
        disabled={isGenerating}
      >
        {isGenerating ? '🔄 Generating...' : '🧠 Generate AI Project Plan'}
      </Button>

      <Button
        type="secondary"
        on:click={generateSmartTasks}
        disabled={isGenerating}
      >
        {isGenerating ? '🔄 Breaking down...' : '🔨 Generate Smart Tasks'}
      </Button>

      <Button
        type="secondary"
        on:click={optimizeResources}
        disabled={isGenerating}
      >
        {isGenerating ? '🔄 Optimizing...' : '⚡ Optimize Resources'}
      </Button>
    </div>
  </div>

  <div class="project-content">
    {#if activeView === 'overview'}
      <div class="overview-view">
        <div class="ai-suggestions">
          <h3>💡 AI Recommendations</h3>
          <div class="suggestion-grid">
            <Card class="suggestion-card">
              <h4>🎯 Goal Alignment</h4>
              <p>Align project goals with team capabilities and timeline constraints</p>
              <div class="confidence">85% Match</div>
            </Card>

            <Card class="suggestion-card">
              <h4>⏰ Resource Balance</h4>
              <p>Distribute workload evenly and identify bottlenecks</p>
              <div class="confidence">92% Optimal</div>
            </Card>

            <Card class="suggestion-card">
              <h4>📅 Timeline Optimization</h4>
              <p>Adjust milestones based on team velocity and dependencies</p>
              <div class="confidence">78% Feasible</div>
            </Card>
          </div>
        </div>

        <div class="project-metrics">
          <h3>📊 Project Metrics</h3>
          <div class="metrics-grid">
            <div class="metric-item">
              <div class="metric-label">Team Productivity</div>
              <div class="metric-value">87%</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">On-Time Delivery</div>
              <div class="metric-value">94%</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">Resource Utilization</div>
              <div class="metric-value">76%</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">Risk Score</div>
              <div class="metric-value">Low</div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if activeView === 'planning'}
      <div class="planning-view">
        <div class="project-input-section">
          <h3>📝 Project Details</h3>
          <div class="input-group">
            <label>Project Name</label>
            <Input
              bind:value={projectName}
              placeholder="Enter project name..."
            />
          </div>

          <div class="input-group">
            <label>Project Description</label>
            <TextArea
              bind:value={projectDescription}
              placeholder="Describe the project goals and requirements..."
              rows={4}
            />
          </div>

          <div class="input-group">
            <label>Project Goals</label>
            <div class="goals-input">
              {#each projectGoals as goal, i (goal)}
                <div class="goal-item">
                  <Input
                    bind:value={goal}
                    placeholder="Enter a goal..."
                  />
                  <button on:click={() => projectGoals = projectGoals.filter(g => g !== goal)}>
                    ❌
                  </button>
                </div>
              {/each}
              <button on:click={() => projectGoals = [...projectGoals, '']} class="add-btn">
                ➕ Add Goal
              </button>
            </div>
          </div>

          <div class="input-group">
            <label>Team Members</label>
            <div class="team-input">
              {#each teamMembers as member, i (member)}
                <div class="member-item">
                  <Input
                    bind:value={member}
                    placeholder="Team member name..."
                  />
                  <button on:click={() => teamMembers = teamMembers.filter(m => m !== member)}>
                    ❌
                  </button>
                </div>
              {/each}
              <button on:click={() => teamMembers = [...teamMembers, '']} class="add-btn">
                ➕ Add Member
              </button>
            </div>
          </div>

          <div class="milestone-section">
            <h3>📅 Key Milestones</h3>
            <div class="deadline-input">
              {#each deadlines as deadline, i (deadline)}
                <div class="deadline-item">
                  <Input
                    bind:value={deadline}
                    placeholder="Milestone name..."
                  />
                  <button on:click={() => deadlines = deadlines.filter(d => d !== deadline)}>
                    ❌
                  </button>
                </div>
              {/each}
              <button on:click={() => deadlines = [...deadlines, '']} class="add-btn">
                ➕ Add Milestone
              </button>
            </div>
          </div>
        </div>

        <div class="ai-suggestions">
          <h3>🤖 AI-Powered Suggestions</h3>
          <div class="suggestion-list">
            <div class="suggestion-item">
              <div class="suggestion-header">
                <span class="suggestion-icon">🎯</span>
                <span class="suggestion-title">SMART Goals</span>
                <span class="suggestion-confidence">95% Match</span>
              </div>
              <p class="suggestion-desc">Break down large goals into Specific, Measurable, Achievable, Relevant, Time-bound objectives</p>
            </div>

            <div class="suggestion-item">
              <div class="suggestion-header">
                <span class="suggestion-icon">⏰</span>
                <span class="suggestion-title">Timeline Estimation</span>
                <span class="suggestion-confidence">87% Accuracy</span>
              </div>
              <p class="suggestion-desc">AI estimates project duration based on team size and complexity</p>
            </div>

            <div class="suggestion-item">
              <div class="suggestion-header">
                <span class="suggestion-icon">👥</span>
                <span class="suggestion-title">Task Dependencies</span>
                <span class="suggestion-confidence">92% Detection</span>
              </div>
              <p class="suggestion-desc">Automatically identify task dependencies and critical path</p>
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if activeView === 'resources'}
      <div class="resources-view">
        <div class="team-analysis">
          <h3>👥 Team Resource Analysis</h3>
          <div class="resource-cards">
            <Card class="resource-card">
              <h4>🔥 Workload Balance</h4>
              <div class="workload-chart">
                <div class="team-member">
                  <div class="member-avatar">JD</div>
                  <div class="member-info">
                    <div class="member-name">John Doe</div>
                    <div class="workload">85% allocated</div>
                  </div>
                </div>
                <div class="team-member">
                  <div class="member-avatar">AS</div>
                  <div class="member-info">
                    <div class="member-name">Alice Smith</div>
                    <div class="workload">60% allocated</div>
                  </div>
                </div>
                <div class="team-member">
                  <div class="member-avatar">BJ</div>
                  <div class="member-info">
                    <div class="member-name">Bob Johnson</div>
                    <div class="workload">75% allocated</div>
                  </div>
                </div>
              </div>
              <p>AI suggests reallocating 15% from Bob to Alice for optimal balance</p>
            </Card>

            <Card class="resource-card">
              <h4>⚡ Skill Optimization</h4>
              <div class="skill-tags">
                <span class="skill-tag">Frontend: Expert</span>
                <span class="skill-tag">Backend: Intermediate</span>
                <span class="skill-tag">Testing: Novice</span>
              </div>
              <p>Assign tasks based on team skill matrix and current workload</p>
            </Card>
          </div>
        </div>
      </div>
    {/if}

    {#if activeView === 'insights'}
      <div class="insights-view">
        <div class="insights-grid">
          <Card class="insight-card">
            <h4>📈 Performance Trends</h4>
            <div class="trend-chart">
              <div class="trend-line up"></div>
              <span>+23% Productivity this month</span>
            </div>
          </Card>

          <Card class="insight-card">
            <h4>🎯 Goal Progress</h4>
            <div class="progress-list">
              <div class="progress-item">
                <div class="progress-bar" style="width: 75%"></div>
                <span>UI Redesign: 75%</span>
              </div>
              <div class="progress-item">
                <div class="progress-bar" style="width: 90%"></div>
                <span>API Integration: 90%</span>
              </div>
              <div class="progress-bar" style="width: 45%"></div>
                <span>Testing Phase: 45%</span>
              </div>
            </div>
          </Card>

          <Card class="insight-card">
            <h4>⚠ Risk Analysis</h4>
            <div class="risk-list">
              <div class="risk-item high">
                <span class="risk-icon">🔴</span>
                <span>Timeline Risk: Complex dependencies</span>
              </div>
              <div class="risk-item medium">
                <span class="risk-icon">🟡</span>
                <span>Resource Risk: Limited team availability</span>
              </div>
              <div class="risk-item low">
                <span class="risk-icon">🟢</span>
                <span>Technical Risk: Well-understood requirements</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .ai-project-manager {
    background: linear-gradient(135deg, #1e3a8a 0%, #2d5f8b 100%);
    color: white;
    padding: 20px;
    border-radius: 12px;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    max-width: 1200px;
  }

  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .project-title {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .project-title h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }

  .project-status {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-indicator {
    width: 10px;
    height: 10px;
    background: #4CAF50;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  .status-indicator.active {
    background: #ff4444;
    animation: pulse 1s infinite;
  }

  .project-subtitle {
    margin: 0;
    opacity: 0.9;
    font-size: 14px;
  }

  .project-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
  }

  .view-switcher {
    display: flex;
    gap: 8px;
  }

  .view-btn {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .view-btn.active {
    background: #4CAF50;
    color: white;
    transform: translateY(-1px);
  }

  .ai-actions {
    display: flex;
    gap: 10px;
  }

  .project-content {
    margin-top: 20px;
  }

  .overview-view {
    display: grid;
    gap: 20px;
  }

  .ai-suggestions {
    background: rgba(0, 0, 0, 0.1);
    padding: 15px;
    border-radius: 8px;
  }

  .suggestion-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 15px;
  }

  .suggestion-card {
    background: rgba(255, 255, 255, 0.05);
    padding: 15px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .suggestion-card h4 {
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: 600;
  }

  .suggestion-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .suggestion-icon {
    font-size: 20px;
    margin-right: 8px;
  }

  .suggestion-title {
    font-weight: 600;
  }

  .suggestion-confidence {
    background: #4CAF50;
    color: white;
    padding: 2px 6px;
    border-radius: 12px;
    font-size: 11px;
  }

  .suggestion-desc {
    margin: 0;
    opacity: 0.9;
    line-height: 1.4;
  }

  .project-metrics {
    background: rgba(0, 0, 0, 0.1);
    padding: 15px;
    border-radius: 8px;
  }

  .project-metrics h3 {
    margin: 0 0 15px 0;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }

  .metric-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 15px;
    border-radius: 8px;
    text-align: center;
  }

  .metric-label {
    font-size: 12px;
    opacity: 0.8;
    margin-bottom: 5px;
  }

  .metric-value {
    font-size: 20px;
    font-weight: 600;
    color: #4CAF50;
  }

  .planning-view {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .project-input-section {
    background: rgba(0, 0, 0, 0.05);
    padding: 20px;
    border-radius: 8px;
  }

  .project-input-section h3 {
    margin: 0 0 15px 0;
    font-size: 18px;
    font-weight: 600;
  }

  .input-group {
    margin-bottom: 20px;
  }

  .input-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    }

  .goals-input {
    display: grid;
    gap: 10px;
  }

  .goal-item {
    display: flex;
    gap: 8px;
  }

  .team-input {
    display: grid;
    gap: 10px;
  }

  .member-item {
    display: flex;
    gap: 8px;
  }

  .add-btn {
    padding: 6px 12px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 10px;
  }

  .deadline-input {
    display: grid;
    gap: 10px;
  }

  .deadline-item {
    display: flex;
    gap: 8px;
  }

  .milestone-section {
    margin-top: 20px;
  }

  .deadline-input {
    display: grid;
    gap: 10px;
  }

  .resources-view {
    background: rgba(0, 0, 0, 0.05);
    padding: 20px;
    border-radius: 8px;
  }

  .team-analysis {
    margin-bottom: 20px;
  }

  .resource-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 15px;
  }

  .workload-chart {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
  }

  .team-member {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .member-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 14px;
  }

  .member-info {
    flex: 1;
  }

  .member-name {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .workload {
    font-size: 12px;
    opacity: 0.9;
  }

  .skill-tags {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }

  .skill-tag {
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
  }

  .insights-view {
    background: rgba(0, 0, 0, 0.05);
    padding: 20px;
    border-radius: 8px;
  }

  .insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 15px;
  }

  .trend-chart {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .trend-line {
    height: 4px;
    width: 60px;
    background: #4CAF50;
    border-radius: 2px;
    position: relative;
  }

  .trend-line.up::after {
    content: '▲';
    position: absolute;
    top: -12px;
    right: -15px;
    color: #4CAF50;
    font-size: 12px;
  }

  .progress-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .progress-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .progress-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    position: relative;
  }

  .risk-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .risk-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    border-radius: 6px;
  }

  .risk-item.high {
    background: rgba(244, 67, 54, 0.1);
  }

  .risk-item.medium {
    background: rgba(251, 191, 36, 0.1);
  }

  .risk-item.low {
    background: rgba(34, 197, 94, 0.1);
  }

  .risk-icon {
    font-size: 18px;
    width: 20px;
    text-align: center;
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  }
</style>