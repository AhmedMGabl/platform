//
// Copyright © 2025 Unholy Platform Contributors.
//

import { AccountId, Doc, Ref, TxOperations, generateId } from '@hcengineering/server-core'
import { AIProvider, type AITaskCreationRequest, type AITaskCreationResponse } from '@hcengineering/unholy-ai'
import { TAIConfiguration, TAIChatMessage } from '@hcengineering/model-unholy-ai'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import fetch from 'node-fetch'

/**
 * Enhanced AI Service with advanced capabilities
 */
export class AIService {
  private clients: Map<AIProvider, OpenAI | Anthropic> = new Map()
  private configs: Map<AIProvider, TAIConfiguration> = new Map()
  private usageCache: Map<string, { count: number, lastReset: number }> = new Map()

  constructor (private tx: TxOperations) {
    this.initializeClients()
  }

  /**
   * Initialize AI provider clients from saved configurations
   */
  private async initializeClients (): Promise<void> {
    try {
      const configs = await this.tx.findAll(TAIConfiguration, { isActive: true })

      for (const config of configs) {
        this.configs.set(config.provider, config)

        switch (config.provider) {
          case AIProvider.OpenAI:
            this.clients.set(config.provider, new OpenAI({
              apiKey: this.decryptApiKey(config.apiKey)
            }))
            break
          case AIProvider.Anthropic:
            // Support custom Anthropic-compatible endpoints (like Zhipu AI)
            const anthropicConfig: any = {
              apiKey: this.decryptApiKey(config.apiKey)
            }

            // Check if using Zhipu AI models or API key
            if (config.model?.includes('glm') ||
                config.apiKey?.includes('zhipu') ||
                config.apiKey?.includes('bigmodel') ||
                process.env.ANTHROPIC_BASE_URL?.includes('bigmodel')) {
              anthropicConfig.baseURL = 'https://open.bigmodel.cn/api/anthropic'
              console.log('🤖 Using Zhipu AI endpoint for Anthropic')
            }

            this.clients.set(config.provider, new Anthropic(anthropicConfig))
            break
          case AIProvider.OpenRouter:
            this.clients.set(config.provider, new OpenAI({
              apiKey: this.decryptApiKey(config.apiKey),
              baseURL: 'https://openrouter.ai/api/v1'
            }))
            break
        }
      }
    } catch (error) {
      console.error('Failed to initialize AI clients:', error)
    }
  }

  /**
   * Create task from AI prompt
   */
  async createTaskFromPrompt (request: AITaskCreationRequest): Promise<AITaskCreationResponse> {
    const prompt = this.buildTaskCreationPrompt(request)

    const response = await this.callAI(prompt, 'task_creation')
    return this.parseTaskResponse(response)
  }

  /**
   * Enhance text with AI
   */
  async enhanceText (text: string, context: string = 'general'): Promise<string> {
    const prompt = this.buildEnhancePrompt(text, context)
    return await this.callAI(prompt, 'enhance')
  }

  /**
   * Analyze document content and provide insights
   */
  async analyzeDocument (content: string, documentType: string = 'general'): Promise<{
    summary: string
    keyPoints: string[]
    actionItems: string[]
    sentiment: 'positive' | 'neutral' | 'negative'
    readability: number
    suggestions: string[]
  }> {
    const prompt = this.buildDocumentAnalysisPrompt(content, documentType)
    const response = await this.callAI(prompt, 'document_analysis')

    return this.parseDocumentAnalysis(response)
  }

  /**
   * Generate smart suggestions based on context
   */
  async generateSuggestions (context: {
    taskTitle?: string
    projectDescription?: string
    teamSkills?: string[]
    recentActivity?: string[]
    type: 'tasks' | 'features' | 'improvements' | 'risks'
  }): Promise<string[]> {
    const prompt = this.buildSuggestionsPrompt(context)
    const response = await this.callAI(prompt, 'suggestions')

    return this.parseSuggestions(response)
  }

  /**
   * Predict project risks and provide mitigation strategies
   */
  async analyzeProjectRisks (projectData: {
    description: string
    timeline?: string
    teamSize?: number
    complexity?: 'low' | 'medium' | 'high'
    dependencies?: string[]
  }): Promise<{
    risks: Array<{
      type: string
      probability: 'low' | 'medium' | 'high'
      impact: 'low' | 'medium' | 'high'
      description: string
      mitigation: string
    }>
    overallRisk: 'low' | 'medium' | 'high'
    recommendations: string[]
  }> {
    const prompt = this.buildRiskAnalysisPrompt(projectData)
    const response = await this.callAI(prompt, 'risk_analysis')

    return this.parseRiskAnalysis(response)
  }

  /**
   * Generate code suggestions and improvements
   */
  async analyzeCode (code: string, language: string, context?: string): Promise<{
    improvements: string[]
    bugs: Array<{ line: number, description: string, severity: 'low' | 'medium' | 'high' }>
    suggestions: string[]
    refactoring: string[]
    documentation: string
  }> {
    const prompt = this.buildCodeAnalysisPrompt(code, language, context)
    const response = await this.callAI(prompt, 'code_analysis')

    return this.parseCodeAnalysis(response)
  }

  /**
   * Real-time chat with AI assistant
   */
  async chatWithAI (message: string, conversationHistory: Array<{ role: 'user' | 'assistant', content: string }> = [], context?: any): Promise<{
    response: string
    suggestions: string[]
    followUpQuestions: string[]
  }> {
    const prompt = this.buildChatPrompt(message, conversationHistory, context)
    const response = await this.callAI(prompt, 'chat')

    return this.parseChatResponse(response)
  }

  /**
   * Generate meeting summaries and action items
   */
  async generateMeetingSummary (transcript: string, participants: string[]): Promise<{
    summary: string
    keyDecisions: string[]
    actionItems: Array<{
      description: string
      assignee?: string
      dueDate?: string
      priority: 'low' | 'medium' | 'high'
    }>
    nextSteps: string[]
    followUpRequired: boolean
  }> {
    const prompt = this.buildMeetingSummaryPrompt(transcript, participants)
    const response = await this.callAI(prompt, 'meeting_summary')

    return this.parseMeetingSummary(response)
  }

  /**
   * Get available AI providers
   */
  getAvailableProviders (): AIProvider[] {
    return Array.from(this.clients.keys())
  }

  /**
   * Get active configuration for provider
   */
  getConfig (provider: AIProvider): TAIConfiguration | undefined {
    return this.configs.get(provider)
  }

  /**
   * Make API call to AI provider
   */
  private async callAI (prompt: string, purpose: 'task_creation' | 'enhance'): Promise<string> {
    const availableProviders = this.getAvailableProviders()

    if (availableProviders.length === 0) {
      throw new Error('No AI providers configured')
    }

    // Try each provider in order
    for (const provider of availableProviders) {
      try {
        const client = this.clients.get(provider)
        const config = this.configs.get(provider)

        if (!client || !config) continue

        switch (provider) {
          case AIProvider.OpenAI:
          case AIProvider.OpenRouter:
            return await this.callOpenAI(client as OpenAI, prompt, config)
          case AIProvider.Anthropic:
            return await this.callAnthropic(client as Anthropic, prompt, config)
        }
      } catch (error) {
        console.warn(`Failed to call ${provider}:`, error)
        continue
      }
    }

    throw new Error('All AI providers failed')
  }

  /**
   * Call OpenAI/OpenRouter API
   */
  private async callOpenAI (client: OpenAI, prompt: string, config: TAIConfiguration): Promise<string> {
    const response = await client.chat.completions.create({
      model: config.model || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant specialized in project management and task creation. Always provide clear, actionable responses.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 2000
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in AI response')
    }

    return content
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic (client: Anthropic, prompt: string, config: TAIConfiguration): Promise<string> {
    // Use appropriate default model for Zhipu AI
    const defaultModel = config.model?.includes('glm') ? 'glm-4' : 'claude-3-sonnet-20240229'

    const response = await client.messages.create({
      model: config.model || defaultModel,
      max_tokens: config.maxTokens || 2000,
      temperature: config.temperature || 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const content = response.content[0]
    if (!content || content.type !== 'text') {
      throw new Error('No text content in Anthropic response')
    }

    return content.text
  }

  /**
   * Build prompt for task creation
   */
  private buildTaskCreationPrompt (request: AITaskCreationRequest): string {
    return `Based on the following prompt, create a comprehensive task with details:

Prompt: "${request.prompt}"

Please respond with a JSON object containing:
{
  "title": "Clear, concise task title",
  "description": "Detailed description of what needs to be done, including technical requirements and business context",
  "acceptanceCriteria": ["Specific criteria that must be met for the task to be considered complete"],
  "subtasks": [
    {
      "title": "Subtask title",
      "description": "Brief description of what this subtask involves"
    }
  ],
  "estimatedHours": number,
  "priority": "low|medium|high",
  "labels": ["relevant", "tags"]
}

Focus on breaking down the work into actionable steps with clear acceptance criteria. Be realistic about time estimates.`
  }

  /**
   * Build prompt for text enhancement
   */
  private buildEnhancePrompt (text: string, context: string): string {
    const contextPrompts = {
      task_description: 'Enhance this task description to be more detailed, clear, and actionable. Include specific requirements and success criteria.',
      general: 'Improve this text to be more professional, clear, and well-structured.'
    }

    const systemPrompt = contextPrompts[context] || contextPrompts.general

    return `${systemPrompt}

Original text: "${text}"

Please provide an enhanced version that is more detailed and professional.`
  }

  /**
   * Parse AI response for task creation
   */
  private parseTaskResponse (response: string): AITaskCreationResponse {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          title: parsed.title || 'New Task',
          description: parsed.description || '',
          acceptanceCriteria: parsed.acceptanceCriteria || [],
          subtasks: parsed.subtasks || [],
          estimatedHours: parsed.estimatedHours,
          priority: parsed.priority,
          labels: parsed.labels || []
        }
      }
    } catch (error) {
      console.warn('Failed to parse JSON response, using fallback:', error)
    }

    // Fallback: extract information from text
    return {
      title: 'Task from AI',
      description: response,
      acceptanceCriteria: [],
      subtasks: [],
      estimatedHours: undefined,
      priority: undefined,
      labels: []
    }
  }

  /**
   * Decrypt API key (basic encryption for demo)
   * In production, use proper encryption
   */
  private decryptApiKey (encryptedKey: string): string {
    // For now, return as-is. In production, implement proper decryption
    return encryptedKey
  }

  /**
   * Encrypt API key (basic encryption for demo)
   * In production, use proper encryption
   */
  encryptApiKey (apiKey: string): string {
    // For now, return as-is. In production, implement proper encryption
    return apiKey
  }

  /**
   * Build prompt for document analysis
   */
  private buildDocumentAnalysisPrompt (content: string, documentType: string): string {
    return `Analyze the following ${documentType} document and provide comprehensive insights:

Content: "${content.substring(0, 8000)}"

Please provide a JSON response with:
{
  "summary": "Concise summary of the main content",
  "keyPoints": ["Main points extracted from the content"],
  "actionItems": ["Specific actions that should be taken based on this content"],
  "sentiment": "positive|neutral|negative",
  "readability": score from 1-100,
  "suggestions": ["Improvements for clarity, structure, or content"]
}

Focus on extracting actionable insights and providing constructive feedback.`
  }

  /**
   * Build prompt for smart suggestions
   */
  private buildSuggestionsPrompt (context: any): string {
    return `Based on the following context, generate smart suggestions:

Context:
- Task Title: ${context.taskTitle || 'N/A'}
- Project Description: ${context.projectDescription || 'N/A'}
- Team Skills: ${context.teamSkills?.join(', ') || 'N/A'}
- Recent Activity: ${context.recentActivity?.slice(0, 5).join(', ') || 'N/A'}
- Suggestion Type: ${context.type}

Please provide 5-8 specific, actionable suggestions as a JSON array of strings.
Each suggestion should be practical and tailored to the context.`
  }

  /**
   * Build prompt for risk analysis
   */
  private buildRiskAnalysisPrompt (projectData: any): string {
    return `Analyze the following project for potential risks and provide mitigation strategies:

Project Details:
- Description: ${projectData.description}
- Timeline: ${projectData.timeline || 'Not specified'}
- Team Size: ${projectData.teamSize || 'Not specified'}
- Complexity: ${projectData.complexity || 'medium'}
- Dependencies: ${projectData.dependencies?.join(', ') || 'None specified'}

Please provide a JSON response with:
{
  "risks": [
    {
      "type": "technical|resource|timeline|scope|external",
      "probability": "low|medium|high",
      "impact": "low|medium|high",
      "description": "Clear description of the risk",
      "mitigation": "Specific steps to mitigate this risk"
    }
  ],
  "overallRisk": "low|medium|high",
  "recommendations": ["Strategic recommendations for risk management"]
}

Focus on realistic risks and practical mitigation strategies.`
  }

  /**
   * Build prompt for code analysis
   */
  private buildCodeAnalysisPrompt (code: string, language: string, context?: string): string {
    return `Analyze the following ${language} code for quality, bugs, and improvements:

Context: ${context || 'General code review'}

Code:
\`\`\`${language}
${code.substring(0, 4000)}
\`\`\`

Please provide a JSON response with:
{
  "improvements": ["Specific improvements for code quality"],
  "bugs": [
    {
      "line": number,
      "description": "Bug description",
      "severity": "low|medium|high"
    }
  ],
  "suggestions": ["General coding suggestions"],
  "refactoring": ["Refactoring recommendations"],
  "documentation": "Suggested documentation or comments"
}

Focus on best practices, security, performance, and maintainability.`
  }

  /**
   * Build prompt for chat interactions
   */
  private buildChatPrompt (message: string, history: Array<{ role: string, content: string }>, context?: any): string {
    const historyText = history.map(h => `${h.role}: ${h.content}`).join('\n')

    return `You are a helpful AI assistant for the Huly platform. You help with project management, task creation, document analysis, and team collaboration.

Context: ${context ? JSON.stringify(context) : 'No specific context'}

Conversation History:
${historyText}

Current User Message: ${message}

Please provide a helpful response and include follow-up questions and suggestions. Respond in JSON format:
{
  "response": "Your main response",
  "suggestions": ["2-4 helpful suggestions"],
  "followUpQuestions": ["1-2 relevant follow-up questions"]
}

Be conversational, helpful, and specific to the Huly platform context.`
  }

  /**
   * Build prompt for meeting summary
   */
  private buildMeetingSummaryPrompt (transcript: string, participants: string[]): string {
    return `Generate a comprehensive summary from the following meeting transcript:

Participants: ${participants.join(', ')}

Transcript:
${transcript.substring(0, 8000)}

Please provide a JSON response with:
{
  "summary": "Overall meeting summary",
  "keyDecisions": ["Important decisions made"],
  "actionItems": [
    {
      "description": "Action item description",
      "assignee": "Person responsible (if identifiable)",
      "dueDate": "Suggested due date (if mentioned)",
      "priority": "low|medium|high"
    }
  ],
  "nextSteps": ["Immediate next steps"],
  "followUpRequired": true/false
}

Focus on actionable outcomes and clear assignments.`
  }

  /**
   * Parse document analysis response
   */
  private parseDocumentAnalysis (response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.warn('Failed to parse document analysis response:', error)
    }

    // Fallback response
    return {
      summary: response.substring(0, 500),
      keyPoints: [],
      actionItems: [],
      sentiment: 'neutral',
      readability: 50,
      suggestions: []
    }
  }

  /**
   * Parse suggestions response
   */
  private parseSuggestions (response: string): string[] {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.warn('Failed to parse suggestions response:', error)
    }

    // Fallback: extract bullet points or numbered items
    const suggestions = response.split('\n')
      .filter(line => line.match(/^[-*]\s|^\d+\.\s/))
      .map(line => line.replace(/^[-*]\s|^\d+\.\s/, '').trim())
      .filter(line => line.length > 0)

    return suggestions.slice(0, 8)
  }

  /**
   * Parse risk analysis response
   */
  private parseRiskAnalysis (response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.warn('Failed to parse risk analysis response:', error)
    }

    // Fallback response
    return {
      risks: [],
      overallRisk: 'medium',
      recommendations: []
    }
  }

  /**
   * Parse code analysis response
   */
  private parseCodeAnalysis (response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.warn('Failed to parse code analysis response:', error)
    }

    // Fallback response
    return {
      improvements: [],
      bugs: [],
      suggestions: [],
      refactoring: [],
      documentation: ''
    }
  }

  /**
   * Parse chat response
   */
  private parseChatResponse (response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.warn('Failed to parse chat response:', error)
    }

    // Fallback response
    return {
      response: response,
      suggestions: [],
      followUpQuestions: []
    }
  }

  /**
   * Parse meeting summary response
   */
  private parseMeetingSummary (response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.warn('Failed to parse meeting summary response:', error)
    }

    // Fallback response
    return {
      summary: response.substring(0, 1000),
      keyDecisions: [],
      actionItems: [],
      nextSteps: [],
      followUpRequired: false
    }
  }
}