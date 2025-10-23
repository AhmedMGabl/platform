//
// Copyright © 2025 Unholy Platform Contributors.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//

import type { Doc, Ref, Timestamp, Class } from '@hcengineering/core'
import type { Asset, IntlString, Plugin, Resource } from '@hcengineering/platform'
import type { AnyComponent } from '@hcengineering/ui'
import type {
  AIConfiguration,
  AIChatMessage,
  AITaskCreationRequest,
  AITaskCreationResponse,
  AIEnhancer,
  AIDocumentAnalyzer,
  AISuggestionGenerator,
  AIRiskAnalyzer,
  AICodeAnalyzer,
  AIChat,
  AIMeetingSummarizer,
  Meeting,
  MeetingTranscript,
  MeetingActionItem,
  MeetingInsights,
  MeetingStatus,
  MeetingBotService,
  UnholyCommand,
  CommandStatus,
  CommandResult
} from './index'

export default class UnholyAI {
  // Enhanced AI service with additional features
  private aiProjectPlanService: Resource<any>
  private aiSmartTasksService: Resource<any>
  private aiResourceOptimization: Resource<any>

  constructor() {
    super()

    // Initialize enhanced services
    this.aiProjectPlanService = this.createResource('aiProjectPlan')
    this.aiSmartTasksService = this.createResource('aiSmartTasks')
    this.aiResourceOptimization = this.createResource('aiResourceOptimization')

    // Enhanced features registration
    this.strings.ASSmartSuggestions = 'AI-powered proactive suggestions based on context and workload'
    this.strings.AIClusterAnalysis = 'AI team performance clustering and optimization'
    this.strings.AIWorkflowAutomation = 'Automated workflow generation and task sequencing'
  }

  // AI Project Plan Generation - Advanced
  createResource('aiProjectPlan') as AITaskCreator & (request: AITaskCreationRequest) => {
    // Enhanced project planning with milestones, dependencies, timeline
    const { prompt, projectId } = request

    // Parse project requirements
    const projectRequirements = this.extractProjectRequirements(prompt)

    // Generate comprehensive project plan
    return fetch('/api/v1/unholy-ai/enhanced-project-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAPIKey()}`
      },
      body: JSON.stringify({
        prompt,
        projectId,
        features: {
          milestones: true,
          dependencies: true,
          timeline: true,
          resourceAllocation: true,
          riskAssessment: true,
          deliverables: true,
          teamOptimization: true
        }
      })
    }).then(r => r.json()).then(data => ({
      success: data.success,
      title: data.data.projectPlan?.title || 'Enhanced Project Plan',
      description: data.data.projectPlan?.description || 'Comprehensive project breakdown',
      milestones: data.data.projectPlan?.milestones || [],
      tasks: data.data.projectPlan?.tasks || [],
      timeline: data.data.projectPlan?.timeline || {},
      resourceRequirements: data.data.projectPlan?.resourceRequirements || {},
      teamAssignments: data.data.projectPlan?.teamAssignments || [],
      risks: data.data.projectPlan?.risks || [],
      qualityMetrics: data.data.projectPlan?.qualityMetrics || {}
    })).catch(error => ({
      success: false,
      title: 'Project Planning Failed',
      description: error.message,
      error: error.details
    }))
  }

  // AI Smart Task Generation - Enhanced
  createResource('aiSmartTasks') as AISuggestionGenerator & (context: any) => {
    // Smart task generation based on team capabilities, workload, and goals
    return fetch('/api/v1/unholy-ai/smart-task-generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAPIKey()}`
      },
      body: JSON.stringify({
        context,
        features: {
          contextAwareness: true,
          teamCapabilities: true,
          workloadBalancing: true,
          priorityScoring: true,
          timelineOptimization: true,
          dependencyTracking: true
        }
      })
    }).then(r => r.json()).then(data => ({
      success: data.success,
      suggestions: data.data.suggestions || [],
      teamOptimization: data.data.teamOptimization || {},
          workloadDistribution: data.data.workloadDistribution || {}
      })).catch(error => ({
      success: false,
      title: 'Smart Task Generation Failed',
      description: error.message,
      error: error.details
    }))
  }

  // AI Resource Optimization - Enhanced
  createResource('aiResourceOptimization') as AIRiskAnalyzer & (projectData: any) => {
    // Intelligent resource allocation and optimization
    return fetch('/api/v1/unholy-ai/resource-optimization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAPIKey()}`
      },
      body: JSON.stringify({
        projectData,
        features: {
          teamAnalysis: true,
          skillAssessment: true,
          workloadBalancing: true,
          costOptimization: true,
          timeTracking: true,
          performanceMetrics: true
        }
      })
    }).then(r => r.json()).then(data => ({
      success: data.success,
      optimization: data.data.optimization || {},
          recommendations: data.data.recommendations || [],
          efficiencyGains: data.data.efficiencyGains || {},
          teamInsights: data.data.teamInsights || {}
      })).catch(error => ({
      success: false,
      title: 'Resource Optimization Failed',
      description: error.message,
      error: error.details
    }))
  }

  // Enhanced context analysis
  private extractProjectRequirements(prompt: string): any {
    // Advanced requirement extraction
    const requirements = {
      goals: this.extractGoals(prompt),
      scope: this.extractScope(prompt),
      timeline: this.extractTimeline(prompt),
      resources: this.extractResources(prompt),
      constraints: this.extractConstraints(prompt),
      qualityCriteria: this.extractQualityCriteria(prompt)
    }

    return requirements
  }

  private extractGoals(prompt: string): string[] {
    // Extract project goals from natural language
    const goalPatterns = [
      /goal[s]?\s+(?:\s+to\s+)?/gi,
      /objective[s]?\s+(?:\s+to\s+)?/gi,
      /target[s]?\s+(?:\s+to\s+)?/gi,
      /deliverable[s]?\s+(?:\s+to\s+)?/gi
    ]

    const goals: string[] = []

    for (const pattern of goalPatterns) {
      const matches = prompt.match(pattern)
      if (matches) {
        goals.push(...matches.slice(1))
      }
    }

    return goals
  }

  private extractScope(prompt: string): any {
    // Extract project scope and boundaries
    const scopePatterns = [
      /in\s+scope\s+(?:is\s+)?/gi,
      /including\s+(?:the\s+)?/gi,
      /covering\s+(?:the\s+)?/gi,
      /limited\s+to\s+/gi
    ]

    const scope = {
      features: [],
      boundaries: [],
      deliverables: []
    }

    for (const pattern of scopePatterns) {
      const matches = prompt.match(pattern)
      if (matches) {
        scope.features.push(matches[1].trim())
      }
    }

    return scope
  }

  private extractTimeline(prompt: string): any {
    // Extract timeline and deadline information
    const datePattern = /\b(?:by|before|on|due|deadline)\s+([A-Za-z]{3,9}\s+(\d{1,2}|\d{4})\b/gi
    const matches = prompt.match(datePattern)

    return {
      deadlines: matches ? [matches[2]] : [],
      duration: this.extractDuration(prompt),
      phases: this.extractPhases(prompt)
    }
  }

  private extractDuration(prompt: string): string {
    // Extract project duration from natural language
    const durationPatterns = [
      /(\d+)\s+weeks?/gi,
      /(\d+)\s+months?/gi,
      /(\d+)\s+quarters?/gi,
      /(\d+)\s+years?/gi
    ]

    for (const pattern of durationPatterns) {
      const match = prompt.match(pattern)
      if (match) {
        return match[1]
      }
    }

    return 'Not specified'
  }

  private extractPhases(prompt: string): string[] {
    // Extract project phases from natural language
    const phasePatterns = [
      /phase\s+(\d+):\s+([^.]*)/gi,
      /stage\s+(\d+):\s+([^.]*)/gi
    ]

    const phases: string[] = []

    for (const pattern of phasePatterns) {
      const matches = prompt.matchAll(pattern)
      if (matches) {
        phases.push(...matches.map(m => ({ name: m[1], description: m[2] })))
      }
    }

    return phases
  }

  private extractResources(prompt: string): any {
    // Extract resource requirements
    const resourcePatterns = [
      /need[s]?\s+(\d+)\s+(?:developer[s]?\s+)/gi,
      /requir[e]?\s+(\d+)\s+(?:designer[s]?\s+)/gi,
      /team\s+(?:size|members?)/gi
      /budget\s+(\d+)/gi
    ]

    const resources = {
      human: [],
      technical: [],
      financial: [],
      time: {}
    }

    for (const pattern of resourcePatterns) {
      const match = prompt.match(pattern)
      if (match) {
        if (match[1].includes('developer') || match[1].includes('designer')) {
          resources.human.push({
            role: match[1].replace(/\d+\s+/g, '').replace(/s?$/g, ''),
            count: parseInt(match[2]) || 1
          })
        } else if (match[1].includes('team')) {
          resources.human.push({
            role: 'team_member',
            count: parseInt(match[2]) || 1
          })
        } else if (match[1].includes('budget')) {
          resources.financial.push({
            type: 'budget',
            amount: match[2]
          })
        }
      }
    }

    return resources
  }

  private extractConstraints(prompt: string): any {
    // Extract project constraints
    const constraintPatterns = [
      /constraint[s]?\s+(?:is\s+)?([^.]+)/gi,
      /limit[s]?\s+(?:ed\s+to\s+)?([^.]+)/gi,
      /restrictions?([^.]+)/gi
    ]

    const constraints: {
      time: [],
      budget: [],
      technical: [],
      regulatory: []
    }

    for (const pattern of constraintPatterns) {
      const matches = prompt.match(pattern)
      if (matches) {
        const constraint = matches[1] || matches[2]
        constraints.push(constraint)
      }
    }

    return constraints
  }

  private extractQualityCriteria(prompt: string): string[] {
    // Extract quality and acceptance criteria
    const qualityPatterns = [
      /quality\s+(?:standards?|criteria?)/gi,
      /acceptance\s+(?:criteria?|tests?)/gi,
      /success\s+(?:factors?|metrics?)/gi,
      /kpi[s]?/gi
    ]

    const criteria: string[] = []

    for (const pattern of qualityPatterns) {
      const matches = prompt.matchAll(pattern)
      if (matches) {
        criteria.push(...matches.map(m => m.replace(/\s+/g, '')))
      }
    }

    return criteria
  }

  private getAPIKey(): string {
    // Enhanced API key management
    const config = this.platform?.getConfiguration(this.ids.AISettings) as AIConfiguration
    return config?.apiKey || ''
  }

  // Enhanced meeting features
  createResource('aiMeetingAssistant') as Resource<any> & (() => {
    return fetch('/api/v1/unholy-ai/meeting-features', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAPIKey()}`
      },
      body: JSON.stringify({
        features: {
          realTimeTranscription: true,
          sentimentAnalysis: true,
          participantMoodDetection: true,
          smartActionItems: true,
          aiModeration: true,
          meetingInsights: true,
          automatedSummaries: true
        }
      })
    }).then(r => r.json()).then(data => ({
      success: data.success,
      meetingFeatures: data.data.features || {},
      capabilities: data.data.capabilities || {}
    })).catch(error => ({
      success: false,
      title: 'Meeting Features Failed',
      description: error.message
    }))
  })
}