//
// Copyright © 2025 Unholy Platform Contributors.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//

import { AccountId, Doc, Ref, TxOperations, generateId, Timestamp } from '@hcengineering/server-core'
import { unholyAi, type AIChatMessage } from '@hcengineering/unholy-ai'
import { TAIChatMessage } from '@hcengineering/model-unholy-ai'
import AIService from './aiService'

/**
 * Meeting platform types
 */
export enum MeetingPlatform {
  GOOGLE_MEET = 'google-meet',
  LARK = 'lark',
  ZOOM = 'zoom',
  TEAMS = 'teams'
}

/**
 * Meeting participant information
 */
export interface MeetingParticipant {
  id: string
  name: string
  email?: string
  role: 'host' | 'co-host' | 'participant'
  joinedAt: Timestamp
  spoke?: boolean
}

/**
 * Meeting transcription data
 */
export interface MeetingTranscript {
  timestamp: Timestamp
  speaker: string
  speakerId?: string
  text: string
  confidence?: number
  isAction?: boolean
  tags?: string[]
}

/**
 * Meeting metadata
 */
export interface MeetingMetadata {
  id: string
  title: string
  platform: MeetingPlatform
  startTime: Timestamp
  endTime?: Timestamp
  duration?: number
  participants: MeetingParticipant[]
  recordingUrl?: string
  transcriptUrl?: string
  meetingUrl?: string
  workspaceId: string
  createdBy: Ref<Doc>
}

/**
 * AI-generated meeting insights
 */
export interface MeetingInsights {
  summary: string
  keyDecisions: string[]
  actionItems: Array<{
    description: string
    assignee?: string
    priority: 'low' | 'medium' | 'high'
    dueDate?: string
    context?: string
  }>
  followUpItems: string[]
  risks: Array<{
    description: string
    mitigation: string
    priority: 'low' | 'medium' | 'high'
  }>
  nextSteps: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  participation: {
    dominantSpeakers: string[]
    quietParticipants: string[]
    engagementLevel: 'high' | 'medium' | 'low'
  }
}

/**
 * AI Meeting Bot Service
 */
export class MeetingBotService {
  private activeMeetings: Map<string, MeetingSession> = new Map()
  private transcriptionQueue: Map<string, MeetingTranscript[]> = new Map()
  private aiService: AIService

  constructor (private tx: TxOperations) {
    this.aiService = new AIService(tx)
  }

  /**
   * Schedule meeting bot to join a meeting
   */
  async scheduleMeetingBot (meetingInfo: {
    title: string
    platform: MeetingPlatform
    startTime: Timestamp
    meetingUrl: string
    participants?: string[]
    workspaceId: string
    createdBy: Ref<Doc>
  }): Promise<string> {
    const meetingId = generateId()

    const metadata: MeetingMetadata = {
      id: meetingId,
      title: meetingInfo.title,
      platform: meetingInfo.platform,
      startTime: meetingInfo.startTime,
      participants: [],
      meetingUrl: meetingInfo.meetingUrl,
      workspaceId: meetingInfo.workspaceId,
      createdBy: meetingInfo.createdBy
    }

    // Schedule bot to join meeting
    await this.scheduleBotJoin(meetingId, meetingInfo.startTime, meetingInfo.platform, meetingInfo.meetingUrl)

    // Store meeting metadata
    await this.saveMeetingMetadata(metadata)

    console.log(`🤖 Meeting bot scheduled for "${meetingInfo.title}" at ${new Date(meetingInfo.startTime).toLocaleString()}`)
    return meetingId
  }

  /**
   * Join meeting with bot
   */
  async joinMeeting (meetingId: string, platform: MeetingPlatform, meetingUrl: string): Promise<void> {
    try {
      console.log(`🤖 Joining meeting ${meetingId} on ${platform}`)

      const session = new MeetingSession(meetingId, platform, meetingUrl)
      this.activeMeetings.set(meetingId, session)
      this.transcriptionQueue.set(meetingId, [])

      // Initialize platform-specific bot
      const bot = await this.initializePlatformBot(platform, meetingUrl)

      // Start recording and transcription
      await session.start(bot, this.handleTranscription.bind(this))

      // Log meeting start
      await this.logMeetingEvent(meetingId, 'meeting_started', {
        platform,
        url: meetingUrl,
        timestamp: Date.now()
      })

      console.log(`✅ Successfully joined meeting ${meetingId}`)

    } catch (error) {
      console.error(`❌ Failed to join meeting ${meetingId}:`, error)
      throw error
    }
  }

  /**
   * Leave meeting and process recording
   */
  async leaveMeeting (meetingId: string): Promise<MeetingInsights> {
    const session = this.activeMeetings.get(meetingId)
    if (!session) {
      throw new Error(`Meeting ${meetingId} not found`)
    }

    try {
      console.log(`🤖 Leaving meeting ${meetingId}`)

      // Stop recording
      const recordingData = await session.stop()

      // Get transcription
      const transcript = this.transcriptionQueue.get(meetingId) || []

      // Process with AI
      const insights = await this.processMeetingWithAI(meetingId, transcript, session.metadata)

      // Create tasks from action items
      await this.createTasksFromActionItems(meetingId, insights.actionItems)

      // Save results
      await this.saveMeetingResults(meetingId, {
        transcript,
        insights,
        recordingUrl: recordingData.recordingUrl,
        duration: session.getDuration()
      })

      // Clean up
      this.activeMeetings.delete(meetingId)
      this.transcriptionQueue.delete(meetingId)

      console.log(`✅ Meeting ${meetingId} processed successfully`)
      return insights

    } catch (error) {
      console.error(`❌ Failed to process meeting ${meetingId}:`, error)
      throw error
    }
  }

  /**
   * Handle real-time transcription
   */
  private async handleTranscription (meetingId: string, transcript: MeetingTranscript): Promise<void> {
    const queue = this.transcriptionQueue.get(meetingId)
    if (queue) {
      queue.push(transcript)

      // Check for action items in real-time
      if (this.isActionItem(transcript.text)) {
        transcript.isAction = true
        transcript.tags = ['action-item']

        // Send real-time notification
        await this.sendActionItemNotification(meetingId, transcript)
      }
    }
  }

  /**
   * Process meeting transcript with AI
   */
  private async processMeetingWithAI (
    meetingId: string,
    transcript: MeetingTranscript[],
    metadata: MeetingMetadata
  ): Promise<MeetingInsights> {
    try {
      // Format transcript for AI
      const transcriptText = this.formatTranscriptForAI(transcript)

      // Get AI analysis
      const aiResponse = await this.aiService.generateMeetingSummary(
        transcriptText,
        metadata.participants.map(p => p.name)
      )

      // Add participation analysis
      const participation = this.analyzeParticipation(transcript, metadata.participants)

      return {
        ...aiResponse,
        participation
      }

    } catch (error) {
      console.error(`❌ AI processing failed for meeting ${meetingId}:`, error)
      return this.getFallbackInsights(transcript)
    }
  }

  /**
   * Create tasks from action items
   */
  private async createTasksFromActionItems (meetingId: string, actionItems: any[]): Promise<void> {
    for (const item of actionItems) {
      try {
        const taskData = {
          title: item.description,
          description: `Action item from meeting: ${item.description}`,
          assignee: item.assignee,
          priority: item.priority,
          dueDate: item.dueDate,
          tags: ['meeting-action', 'auto-generated'],
          meetingId
        }

        // Create task using existing AI task creation
        await this.createTask(taskData)

        console.log(`✅ Created task: "${item.description}"`)

      } catch (error) {
        console.error(`❌ Failed to create task from action item:`, error)
      }
    }
  }

  /**
   * Initialize platform-specific bot
   */
  private async initializePlatformBot (platform: MeetingPlatform, meetingUrl: string): Promise<MeetingBot> {
    switch (platform) {
      case MeetingPlatform.GOOGLE_MEET:
        return new GoogleMeetBot(meetingUrl)
      case MeetingPlatform.LARK:
        return new LarkBot(meetingUrl)
      default:
        throw new Error(`Platform ${platform} not supported`)
    }
  }

  /**
   * Schedule bot to join meeting
   */
  private async scheduleBotJoin (
    meetingId: string,
    startTime: Timestamp,
    platform: MeetingPlatform,
    meetingUrl: string
  ): Promise<void> {
    const delay = startTime - Date.now()

    if (delay <= 0) {
      // Join immediately if meeting is starting now
      await this.joinMeeting(meetingId, platform, meetingUrl)
    } else {
      // Schedule for future
      setTimeout(async () => {
        try {
          await this.joinMeeting(meetingId, platform, meetingUrl)
        } catch (error) {
          console.error(`❌ Scheduled meeting join failed for ${meetingId}:`, error)
        }
      }, delay)
    }
  }

  /**
   * Format transcript for AI processing
   */
  private formatTranscriptForAI (transcript: MeetingTranscript[]): string {
    return transcript
      .map(t => `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.speaker}: ${t.text}`)
      .join('\n')
  }

  /**
   * Check if text contains action items
   */
  private isActionItem (text: string): boolean {
    const actionKeywords = [
      'action item', 'todo', 'task', 'follow up', 'need to', 'will', 'should',
      'responsible', 'assign', 'deadline', 'due date', 'complete', 'finish'
    ]

    const lowerText = text.toLowerCase()
    return actionKeywords.some(keyword => lowerText.includes(keyword))
  }

  /**
   * Analyze participation patterns
   */
  private analyzeParticipation (transcript: MeetingTranscript[], participants: MeetingParticipant[]) {
    const speakingTime: Record<string, number> = {}
    const wordCount: Record<string, number> = {}

    // Calculate speaking metrics
    transcript.forEach(t => {
      if (!speakingTime[t.speaker]) {
        speakingTime[t.speaker] = 0
        wordCount[t.speaker] = 0
      }
      speakingTime[t.speaker] += 1
      wordCount[t.speaker] += t.text.split(' ').length
    })

    const totalWords = Object.values(wordCount).reduce((sum, count) => sum + count, 0)

    const dominantSpeakers = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name]) => name)

    const quietParticipants = participants
      .filter(p => !wordCount[p.name] || wordCount[p.name] < totalWords * 0.05)
      .map(p => p.name)

    const engagementLevel = quietParticipants.length > participants.length * 0.5 ? 'low' :
                           quietParticipants.length > participants.length * 0.25 ? 'medium' : 'high'

    return {
      dominantSpeakers,
      quietParticipants,
      engagementLevel
    }
  }

  /**
   * Get fallback insights if AI fails
   */
  private getFallbackInsights (transcript: MeetingTranscript[]): MeetingInsights {
    const actionItems = transcript
      .filter(t => t.isAction)
      .map(t => ({
        description: t.text,
        priority: 'medium' as const,
        assignee: t.speaker
      }))

    return {
      summary: 'Meeting discussion recorded. AI processing temporarily unavailable.',
      keyDecisions: [],
      actionItems,
      followUpItems: [],
      risks: [],
      nextSteps: ['Review transcript manually for key decisions'],
      sentiment: 'neutral',
      participation: {
        dominantSpeakers: [],
        quietParticipants: [],
        engagementLevel: 'medium'
      }
    }
  }

  // Additional helper methods would be implemented here
  private async saveMeetingMetadata (metadata: MeetingMetadata): Promise<void> {
    // Implementation to save meeting metadata
  }

  private async logMeetingEvent (meetingId: string, event: string, data: any): Promise<void> {
    // Implementation to log meeting events
  }

  private async sendActionItemNotification (meetingId: string, transcript: MeetingTranscript): Promise<void> {
    // Implementation to send real-time notifications
  }

  private async saveMeetingResults (meetingId: string, results: any): Promise<void> {
    // Implementation to save meeting results
  }

  private async createTask (taskData: any): Promise<void> {
    // Implementation to create tasks in the system
  }
}

/**
 * Meeting session management
 */
class MeetingSession {
  private startTime: number = Date.now()
  private bot?: MeetingBot
  private isRecording: boolean = false

  constructor (
    public readonly meetingId: string,
    public readonly platform: MeetingPlatform,
    public readonly meetingUrl: string,
    public readonly metadata: MeetingMetadata = {} as MeetingMetadata
  ) {}

  async start (bot: MeetingBot, onTranscript: (meetingId: string, transcript: MeetingTranscript) => Promise<void>): Promise<void> {
    this.bot = bot
    this.isRecording = true

    await this.bot.join()
    await this.bot.startRecording(onTranscript)
  }

  async stop (): Promise<{ recordingUrl: string }> {
    if (!this.bot) {
      throw new Error('Bot not initialized')
    }

    this.isRecording = false
    const recordingUrl = await this.bot.stopRecording()
    await this.bot.leave()

    return { recordingUrl }
  }

  getDuration (): number {
    return Date.now() - this.startTime
  }

  isActive (): boolean {
    return this.isRecording
  }
}

/**
 * Abstract meeting bot interface
 */
abstract class MeetingBot {
  constructor (protected meetingUrl: string) {}

  abstract join (): Promise<void>
  abstract leave (): Promise<void>
  abstract startRecording (onTranscript: (transcript: MeetingTranscript) => Promise<void>): Promise<void>
  abstract stopRecording (): Promise<string>
}

/**
 * Google Meet bot implementation
 */
class GoogleMeetBot extends MeetingBot {
  async join (): Promise<void> {
    // Implementation for joining Google Meet
    console.log('🤖 Joining Google Meet meeting...')
  }

  async leave (): Promise<void> {
    // Implementation for leaving Google Meet
    console.log('🤖 Leaving Google Meet meeting...')
  }

  async startRecording (onTranscript: (transcript: MeetingTranscript) => Promise<void>): Promise<void> {
    // Implementation for starting recording and transcription
    console.log('🎙️ Starting recording and transcription...')
  }

  async stopRecording (): Promise<string> {
    // Implementation for stopping recording and getting URL
    console.log('⏹️ Stopping recording...')
    return 'https://storage.example.com/recordings/meeting.mp4'
  }
}

/**
 * Lark bot implementation
 */
class LarkBot extends MeetingBot {
  async join (): Promise<void> {
    // Implementation for joining Lark meeting
    console.log('🤖 Joining Lark meeting...')
  }

  async leave (): Promise<void> {
    // Implementation for leaving Lark meeting
    console.log('🤖 Leaving Lark meeting...')
  }

  async startRecording (onTranscript: (transcript: MeetingTranscript) => Promise<void>): Promise<void> {
    // Implementation for starting recording and transcription
    console.log('🎙️ Starting recording and transcription...')
  }

  async stopRecording (): Promise<string> {
    // Implementation for stopping recording and getting URL
    console.log('⏹️ Stopping recording...')
    return 'https://storage.example.com/recordings/meeting.mp4'
  }
}