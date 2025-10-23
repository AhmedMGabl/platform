//
// Copyright © 2025 Unholy Platform Contributors.
//
// This is the UNHOLY AI Command Center - Where your words become reality!
//

import { AccountId, Doc, Ref, TxOperations, generateId, Timestamp } from '@hcengineering/server-core'
import { unholyAi, type AIChatMessage } from '@hcengineering/unholy-ai'
import { TAIChatMessage } from '@hcengineering/model-unholy-ai'
import AIService from './aiService'
import { MeetingBotService, MeetingPlatform } from './meetingBot'

/**
 * 🌟 UNHOLY AI COMMAND TYPES
 * This is where the magic happens - your words become ACTIONS!
 */
export interface UnholyCommand {
  id: string
  type: CommandType
  intent: string
  entities: CommandEntity[]
  confidence: number
  originalText: string
  userId: Ref<Doc>
  workspaceId: string
  timestamp: Timestamp
  status: CommandStatus
  result?: CommandResult
  error?: string
}

export enum CommandType {
  CREATE_TASK = 'create_task',
  CREATE_MEETING = 'create_meeting',
  SEND_MESSAGE = 'send_message',
  CREATE_PROJECT = 'create_project',
  UPDATE_STATUS = 'update_status',
  ANALYZE_DATA = 'analyze_data',
  GENERATE_REPORT = 'generate_report',
  SCHEDULE_BOT = 'schedule_bot',
  SEARCH_INFO = 'search_info',
  CREATE_DOCUMENT = 'create_document',
  ASSIGN_TASK = 'assign_task',
  DEADLINE_TASK = 'deadline_task',
  PROACTIVE_SUGGESTION = 'proactive_suggestion',
  AUTOMATE_WORKFLOW = 'automate_workflow',
  UNKNOWN = 'unknown'
}

export enum CommandStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface CommandEntity {
  type: string
  value: string
  confidence: number
  startIndex: number
  endIndex: number
}

export interface CommandResult {
  action: string
  resourceId?: string
  data?: any
  message: string
  success: boolean
  followUpActions?: string[]
}

/**
 * 🤖 THE UNHOLY AI COMMAND CENTER
 * This AI doesn't just talk - it ACTS!
 */
export class UnholyCommandCenter {
  private aiService: AIService
  private meetingBotService: MeetingBotService
  private commandHistory: Map<string, UnholyCommand[]> = new Map()
  private proactiveAI: ProactiveAI

  constructor (private tx: TxOperations) {
    this.aiService = new AIService(tx)
    this.meetingBotService = new MeetingBotService(tx)
    this.proactiveAI = new ProactiveAI(tx, this.aiService)
  }

  /**
   * 🗣️ Process natural language command and TAKE ACTION!
   */
  async processCommand (
    text: string,
    userId: Ref<Doc>,
    workspaceId: string,
    context?: any
  ): Promise<UnholyCommand> {
    console.log(`🌟 UNHOLY AI Processing: "${text}"`)

    const command: UnholyCommand = {
      id: generateId(),
      type: CommandType.UNKNOWN,
      intent: '',
      entities: [],
      confidence: 0,
      originalText: text,
      userId,
      workspaceId,
      timestamp: Date.now(),
      status: CommandStatus.PROCESSING
    }

    try {
      // 🧠 Understand what the human wants
      const analysis = await this.analyzeIntent(text, context)
      command.type = analysis.type
      command.intent = analysis.intent
      command.entities = analysis.entities
      command.confidence = analysis.confidence

      // 🚀 EXECUTE THE COMMAND!
      const result = await this.executeCommand(command, context)
      command.result = result
      command.status = result.success ? CommandStatus.COMPLETED : CommandStatus.FAILED

      // 📚 Learn from this interaction
      await this.learnFromCommand(command, result)

      console.log(`✅ UNHOLY Command Completed: ${command.type} - ${result.message}`)

    } catch (error) {
      console.error(`❌ UNHOLY Command Failed:`, error)
      command.status = CommandStatus.FAILED
      command.error = error.message
    }

    // 💾 Store command in history
    this.storeCommand(command)

    return command
  }

  /**
   * 🧠 Advanced intent recognition with entity extraction
   */
  private async analyzeIntent (
    text: string,
    context?: any
  ): Promise<{
    type: CommandType
    intent: string
    entities: CommandEntity[]
    confidence: number
  }> {
    // Build AI prompt for command analysis
    const analysisPrompt = this.buildCommandAnalysisPrompt(text, context)

    try {
      const response = await this.aiService.callAI(analysisPrompt, 'command_analysis')
      return this.parseCommandAnalysis(response)
    } catch (error) {
      console.warn('AI analysis failed, using fallback:', error)
      return this.fallbackIntentAnalysis(text)
    }
  }

  /**
   * 🚀 EXECUTE THE ACTUAL COMMAND - THIS IS WHERE MAGIC HAPPENS!
   */
  private async executeCommand (
    command: UnholyCommand,
    context?: any
  ): Promise<CommandResult> {
    switch (command.type) {
      case CommandType.CREATE_TASK:
        return await this.executeCreateTask(command, context)

      case CommandType.CREATE_MEETING:
        return await this.executeCreateMeeting(command, context)

      case CommandType.SCHEDULE_BOT:
        return await this.executeScheduleBot(command, context)

      case CommandType.ASSIGN_TASK:
        return await this.executeAssignTask(command, context)

      case CommandType.CREATE_PROJECT:
        return await this.executeCreateProject(command, context)

      case CommandType.SEND_MESSAGE:
        return await this.executeSendMessage(command, context)

      case CommandType.GENERATE_REPORT:
        return await this.executeGenerateReport(command, context)

      case CommandType.ANALYZE_DATA:
        return await this.executeAnalyzeData(command, context)

      case CommandType.AUTOMATE_WORKFLOW:
        return await this.executeAutomateWorkflow(command, context)

      default:
        return {
          action: 'unknown_command',
          message: `I'm not sure how to "${command.originalText}". Try rephrasing or ask for help.`,
          success: false
        }
    }
  }

  /**
   * 📋 CREATE TASK - Turn words into actual tasks!
   */
  private async executeCreateTask (
    command: UnholyCommand,
    context?: any
  ): Promise<CommandResult> {
    try {
      const entities = this.extractTaskEntities(command.entities)

      const taskData = {
        title: entities.title || 'New Task from AI',
        description: entities.description || command.originalText,
        assignee: entities.assignee,
        dueDate: entities.dueDate,
        priority: entities.priority || 'medium',
        project: entities.project,
        tags: ['ai-created', 'unholy-command'],
        workspaceId: command.workspaceId
      }

      // Create the actual task using existing AI service
      const createdTask = await this.aiService.createTaskFromPrompt({
        prompt: taskData.description,
        projectId: taskData.project,
        contextData: taskData
      })

      return {
        action: 'task_created',
        resourceId: createdTask.title,
        data: createdTask,
        message: `✅ Task created: "${createdTask.title}"`,
        success: true,
        followUpActions: [
          'Add more details to the task',
          'Set up reminders',
          'Assign to team members'
        ]
      }

    } catch (error) {
      return {
        action: 'task_creation_failed',
        message: `❌ Failed to create task: ${error.message}`,
        success: false
      }
    }
  }

  /**
   * 📅 CREATE MEETING - Schedule meetings like a boss!
   */
  private async executeCreateMeeting (
    command: UnholyCommand,
    context?: any
  ): Promise<CommandResult> {
    try {
      const entities = this.extractMeetingEntities(command.entities)

      const meetingData = {
        title: entities.title || 'AI Scheduled Meeting',
        platform: entities.platform || MeetingPlatform.GOOGLE_MEET,
        startTime: entities.startTime ? new Date(entities.startTime).getTime() : Date.now() + 3600000,
        participants: entities.participants || [],
        duration: entities.duration || 60,
        meetingUrl: '', // Will be generated by platform
        workspaceId: command.workspaceId
      }

      // Create meeting using calendar API
      const meeting = await this.createMeetingInCalendar(meetingData)

      return {
        action: 'meeting_created',
        resourceId: meeting.id,
        data: meeting,
        message: `📅 Meeting scheduled: "${meeting.title}" at ${new Date(meeting.startTime).toLocaleString()}`,
        success: true,
        followUpActions: [
          'Send meeting invitations',
          'Prepare meeting agenda',
          'Schedule AI bot to record'
        ]
      }

    } catch (error) {
      return {
        action: 'meeting_creation_failed',
        message: `❌ Failed to create meeting: ${error.message}`,
        success: false
      }
    }
  }

  /**
   * 🤖 SCHEDULE MEETING BOT - Deploy the AI recorder!
   */
  private async executeScheduleBot (
    command: UnholyCommand,
    context?: any
  ): Promise<CommandResult> {
    try {
      const entities = this.extractMeetingEntities(command.entities)

      const meetingId = await this.meetingBotService.scheduleMeetingBot({
        title: entities.title || 'AI Recorded Meeting',
        platform: entities.platform || MeetingPlatform.GOOGLE_MEET,
        startTime: entities.startTime ? new Date(entities.startTime).getTime() : Date.now() + 3600000,
        meetingUrl: entities.meetingUrl,
        participants: entities.participants,
        workspaceId: command.workspaceId,
        createdBy: command.userId
      })

      return {
        action: 'bot_scheduled',
        resourceId: meetingId,
        message: `🤖 AI Bot scheduled to join and record meeting!`,
        success: true,
        followUpActions: [
          'Test bot connection',
          'Prepare meeting materials',
          'Review AI settings'
        ]
      }

    } catch (error) {
      return {
        action: 'bot_scheduling_failed',
        message: `❌ Failed to schedule AI bot: ${error.message}`,
        success: false
      }
    }
  }

  /**
   * 🎯 ASSIGN TASK - Smart task assignment!
   */
  private async executeAssignTask (
    command: UnholyCommand,
    context?: any
  ): Promise<CommandResult> {
    try {
      const entities = this.extractTaskEntities(command.entities)

      if (!entities.taskId && !entities.title) {
        throw new Error('No task specified for assignment')
      }

      if (!entities.assignee) {
        throw new Error('No assignee specified')
      }

      // Find or create the task
      let task
      if (entities.taskId) {
        task = await this.findTaskById(entities.taskId)
      } else {
        // Create new task
        const createdTask = await this.aiService.createTaskFromPrompt({
          prompt: entities.title,
          contextData: entities
        })
        task = createdTask
      }

      // Assign the task
      await this.assignTaskToUser(task, entities.assignee)

      return {
        action: 'task_assigned',
        resourceId: task.title,
        message: `✅ Task "${task.title}" assigned to ${entities.assignee}`,
        success: true,
        followUpActions: [
          'Notify assignee',
          'Set deadline',
          'Add task description'
        ]
      }

    } catch (error) {
      return {
        action: 'task_assignment_failed',
        message: `❌ Failed to assign task: ${error.message}`,
        success: false
      }
    }
  }

  /**
   * 🚀 CREATE PROJECT - Start a new project!
   */
  private async executeCreateProject (
    command: UnholyCommand,
    context?: any
  ): Promise<CommandResult> {
    try {
      const entities = this.extractProjectEntities(command.entities)

      const projectData = {
        name: entities.title || 'New AI Project',
        description: entities.description || command.originalText,
        workspaceId: command.workspaceId,
        createdWith: 'unholy-ai'
      }

      const project = await this.createProject(projectData)

      return {
        action: 'project_created',
        resourceId: project.id,
        data: project,
        message: `🚀 Project created: "${project.name}"`,
        success: true,
        followUpActions: [
          'Add team members',
          'Create initial tasks',
          'Set up project timeline'
        ]
      }

    } catch (error) {
      return {
        action: 'project_creation_failed',
        message: `❌ Failed to create project: ${error.message}`,
        success: false
      }
    }
  }

  /**
   * 💬 SEND MESSAGE - AI communicates for you!
   */
  private async executeSendMessage (
    command: UnholyCommand,
    context?: any
  ): Promise<CommandResult> {
    try {
      const entities = this.extractMessageEntities(command.entities)

      const messageData = {
        recipient: entities.recipient,
        subject: entities.subject,
        content: entities.content,
        channel: entities.channel || 'chat',
        workspaceId: command.workspaceId
      }

      await this.sendMessageToUser(messageData)

      return {
        action: 'message_sent',
        message: `💬 Message sent to ${entities.recipient}`,
        success: true,
        followUpActions: [
          'Follow up if no response',
          'Schedule meeting to discuss',
          'Save important information'
        ]
      }

    } catch (error) {
      return {
        action: 'message_send_failed',
        message: `❌ Failed to send message: ${error.message}`,
        success: false
      }
    }
  }

  /**
   * 📊 GENERATE REPORT - AI creates reports automatically!
   */
  private async executeGenerateReport (
    command: UnholyCommand,
    context?: any
  ): Promise<CommandResult> {
    try {
      const entities = this.extractReportEntities(command.entities)

      const reportData = {
        type: entities.reportType,
        timeframe: entities.timeframe,
        data: await this.gatherReportData(entities.reportType, entities.timeframe),
        workspaceId: command.workspaceId
      }

      const report = await this.generateReport(reportData)

      return {
        action: 'report_generated',
        resourceId: report.id,
        data: report,
        message: `📊 ${entities.reportType} report generated for ${entities.timeframe}`,
        success: true,
        followUpActions: [
          'Share with team',
          'Schedule review meeting',
          'Export to different formats'
        ]
      }

    } catch (error) {
      return {
        action: 'report_generation_failed',
        message: `❌ Failed to generate report: ${error.message}`,
        success: false
      }
    }
  }

  /**
   * 🔍 ANALYZE DATA - AI analyzes your data!
   */
  private async executeAnalyzeData (
    command: UnholyCommand,
    context?: any
  ): Promise<CommandResult> {
    try {
      const entities = this.extractAnalysisEntities(command.entities)

      const analysisData = {
        type: entities.analysisType,
        dataSource: entities.dataSource,
        parameters: entities.parameters,
        workspaceId: command.workspaceId
      }

      const analysis = await this.performDataAnalysis(analysisData)

      return {
        action: 'data_analyzed',
        data: analysis,
        message: `🔍 Data analysis completed for ${entities.analysisType}`,
        success: true,
        followUpActions: [
          'Create action items from insights',
          'Share findings with team',
          'Schedule follow-up analysis'
        ]
      }

    } catch (error) {
      return {
        action: 'data_analysis_failed',
        message: `❌ Failed to analyze data: ${error.message}`,
        success: false
      }
    }
  }

  /**
   * ⚡ AUTOMATE WORKFLOW - AI builds automation!
   */
  private async executeAutomateWorkflow (
    command: UnholyCommand,
    context?: any
  ): Promise<CommandResult> {
    try {
      const entities = this.extractWorkflowEntities(command.entities)

      const workflowData = {
        trigger: entities.trigger,
        actions: entities.actions,
        conditions: entities.conditions,
        name: entities.workflowName,
        workspaceId: command.workspaceId
      }

      const workflow = await this.createWorkflow(workflowData)

      return {
        action: 'workflow_created',
        resourceId: workflow.id,
        data: workflow,
        message: `⚡ Workflow "${workflow.name}" created and activated!`,
        success: true,
        followUpActions: [
          'Test the workflow',
          'Monitor execution',
          'Refine conditions'
        ]
      }

    } catch (error) {
      return {
        action: 'workflow_creation_failed',
        message: `❌ Failed to create workflow: ${error.message}`,
        success: false
      }
    }
  }

  /**
   * 🤖 PROACTIVE AI - Suggests things you should do!
   */
  async getProactiveSuggestions (userId: Ref<Doc>, workspaceId: string): Promise<UnholyCommand[]> {
    return await this.proactiveAI.generateSuggestions(userId, workspaceId)
  }

  /**
   * 🧠 Learn from every interaction to get smarter!
   */
  private async learnFromCommand (command: UnholyCommand, result: CommandResult): Promise<void> {
    // Store interaction for learning
    await this.storeInteraction(command, result)

    // Update AI models based on feedback
    await this.updateAIModels(command, result)
  }

  // Helper methods for entity extraction
  private extractTaskEntities (entities: CommandEntity[]): any {
    return {
      title: entities.find(e => e.type === 'task_title')?.value,
      description: entities.find(e => e.type === 'task_description')?.value,
      assignee: entities.find(e => e.type === 'assignee')?.value,
      dueDate: entities.find(e => e.type === 'due_date')?.value,
      priority: entities.find(e => e.type === 'priority')?.value,
      project: entities.find(e => e.type === 'project')?.value,
      taskId: entities.find(e => e.type === 'task_id')?.value
    }
  }

  private extractMeetingEntities (entities: CommandEntity[]): any {
    return {
      title: entities.find(e => e.type === 'meeting_title')?.value,
      platform: entities.find(e => e.type === 'platform')?.value as MeetingPlatform,
      startTime: entities.find(e => e.type === 'start_time')?.value,
      participants: entities.filter(e => e.type === 'participant').map(e => e.value),
      duration: parseInt(entities.find(e => e.type === 'duration')?.value) || 60,
      meetingUrl: entities.find(e => e.type === 'meeting_url')?.value
    }
  }

  private extractProjectEntities (entities: CommandEntity[]): any {
    return {
      title: entities.find(e => e.type === 'project_title')?.value,
      description: entities.find(e => e.type === 'project_description')?.value,
      team: entities.filter(e => e.type === 'team_member').map(e => e.value)
    }
  }

  private extractMessageEntities (entities: CommandEntity[]): any {
    return {
      recipient: entities.find(e => e.type === 'recipient')?.value,
      subject: entities.find(e => e.type === 'subject')?.value,
      content: entities.find(e => e.type === 'message_content')?.value,
      channel: entities.find(e => e.type === 'channel')?.value
    }
  }

  private extractReportEntities (entities: CommandEntity[]): any {
    return {
      reportType: entities.find(e => e.type === 'report_type')?.value,
      timeframe: entities.find(e => e.type === 'timeframe')?.value
    }
  }

  private extractAnalysisEntities (entities: CommandEntity[]): any {
    return {
      analysisType: entities.find(e => e.type === 'analysis_type')?.value,
      dataSource: entities.find(e => e.type === 'data_source')?.value,
      parameters: entities.filter(e => e.type === 'parameter').map(e => ({ name: e.type, value: e.value }))
    }
  }

  private extractWorkflowEntities (entities: CommandEntity[]): any {
    return {
      workflowName: entities.find(e => e.type === 'workflow_name')?.value,
      trigger: entities.find(e => e.type === 'trigger')?.value,
      actions: entities.filter(e => e.type === 'action').map(e => e.value),
      conditions: entities.filter(e => e.type === 'condition').map(e => e.value)
    }
  }

  private buildCommandAnalysisPrompt (text: string, context?: any): string {
    return `Analyze this command and extract structured information:

Command: "${text}"
Context: ${context ? JSON.stringify(context) : 'No specific context'}

Please respond with a JSON object containing:
{
  "type": "create_task|create_meeting|schedule_bot|assign_task|create_project|send_message|generate_report|analyze_data|automate_workflow",
  "intent": "Brief description of what the user wants to accomplish",
  "entities": [
    {
      "type": "task_title|assignee|due_date|meeting_title|start_time|participant|project_title|etc",
      "value": "extracted value",
      "confidence": 0.95,
      "startIndex": 0,
      "endIndex": 10
    }
  ],
  "confidence": 0.85
}

Focus on identifying concrete actions the user wants to take.`
  }

  private parseCommandAnalysis (response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.warn('Failed to parse command analysis:', error)
    }

    return this.fallbackIntentAnalysis(response)
  }

  private fallbackIntentAnalysis (text: string): any {
    const lowerText = text.toLowerCase()

    // Simple keyword matching for fallback
    if (lowerText.includes('create task') || lowerText.includes('add task')) {
      return {
        type: CommandType.CREATE_TASK,
        intent: 'Create a new task',
        entities: [],
        confidence: 0.6
      }
    }

    if (lowerText.includes('meeting') || lowerText.includes('schedule')) {
      return {
        type: CommandType.CREATE_MEETING,
        intent: 'Schedule a meeting',
        entities: [],
        confidence: 0.6
      }
    }

    return {
      type: CommandType.UNKNOWN,
      intent: 'Unknown command',
      entities: [],
      confidence: 0.1
    }
  }

  private storeCommand (command: UnholyCommand): void {
    const userCommands = this.commandHistory.get(command.userId) || []
    userCommands.push(command)

    // Keep only last 100 commands per user
    if (userCommands.length > 100) {
      userCommands.splice(0, userCommands.length - 100)
    }

    this.commandHistory.set(command.userId, userCommands)
  }

  // Placeholder implementations for actual platform integrations
  private async createMeetingInCalendar (meetingData: any): Promise<any> {
    // Implementation would integrate with Google Calendar, Lark, etc.
    return {
      id: generateId(),
      ...meetingData,
      meetingUrl: 'https://meet.google.com/generated'
    }
  }

  private async findTaskById (taskId: string): Promise<any> {
    // Implementation would find task in the system
    return { title: 'Found Task' }
  }

  private async assignTaskToUser (task: any, assignee: string): Promise<void> {
    // Implementation would assign task to user
    console.log(`Assigning task "${task.title}" to ${assignee}`)
  }

  private async createProject (projectData: any): Promise<any> {
    // Implementation would create project
    return {
      id: generateId(),
      ...projectData
    }
  }

  private async sendMessageToUser (messageData: any): Promise<void> {
    // Implementation would send message
    console.log(`Sending message to ${messageData.recipient}`)
  }

  private async gatherReportData (reportType: string, timeframe: string): Promise<any> {
    // Implementation would gather data for report
    return {}
  }

  private async generateReport (reportData: any): Promise<any> {
    // Implementation would generate report
    return {
      id: generateId(),
      ...reportData,
      generatedAt: Date.now()
    }
  }

  private async performDataAnalysis (analysisData: any): Promise<any> {
    // Implementation would perform data analysis
    return {
      insights: [],
      recommendations: []
    }
  }

  private async createWorkflow (workflowData: any): Promise<any> {
    // Implementation would create workflow
    return {
      id: generateId(),
      ...workflowData,
      active: true
    }
  }

  private async storeInteraction (command: UnholyCommand, result: CommandResult): Promise<void> {
    // Implementation would store interaction for learning
  }

  private async updateAIModels (command: UnholyCommand, result: CommandResult): Promise<void> {
    // Implementation would update AI models based on feedback
  }
}

/**
 * 🤖 PROACTIVE AI - Suggests things you should do before you even ask!
 */
class ProactiveAI {
  constructor (
    private tx: TxOperations,
    private aiService: AIService
  ) {}

  async generateSuggestions (userId: Ref<Doc>, workspaceId: string): Promise<UnholyCommand[]> {
    const suggestions: UnholyCommand[] = []

    try {
      // Analyze user's current context and patterns
      const context = await this.analyzeUserContext(userId, workspaceId)

      // Generate proactive suggestions based on context
      const aiSuggestions = await this.aiService.generateSuggestions({
        ...context,
        type: 'proactive_suggestions'
      })

      // Convert AI suggestions to commands
      for (const suggestion of aiSuggestions) {
        suggestions.push({
          id: generateId(),
          type: CommandType.PROACTIVE_SUGGESTION,
          intent: suggestion,
          entities: [],
          confidence: 0.8,
          originalText: suggestion,
          userId,
          workspaceId,
          timestamp: Date.now(),
          status: CommandStatus.PENDING
        })
      }

    } catch (error) {
      console.warn('Proactive suggestions failed:', error)
    }

    return suggestions
  }

  private async analyzeUserContext (userId: Ref<Doc>, workspaceId: string): Promise<any> {
    // Implementation would analyze user's current work, habits, patterns
    return {
      recentActivity: [],
      currentProjects: [],
      upcomingDeadlines: [],
      teamMembers: []
    }
  }
}