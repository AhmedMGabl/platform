//
// Copyright © 2025 Unholy Platform Contributors.
//

import { type Builder, TxOperations } from '@hcengineering/server-core'
import unholyAi, { type AIConfiguration, type AIChatMessage, AIProvider } from '@hcengineering/unholy-ai'
import { TAIConfiguration, TAIChatMessage } from '@hcengineering/model-unholy-ai'
import AIService from './aiService'
import { MeetingBotService } from './meetingBot'
import { UnholyCommandCenter } from './unholyCommandCenter'
import type { Plugin } from '@hcengineering/platform'
import { plugin } from '@hcengineering/platform'
import type { Resource } from '@hcengineering/platform'

export { AIService, MeetingBotService, UnholyCommandCenter }

export default plugin(unholyAiId, {
  function: {
    createTaskWithAI: createTaskWithAIResource,
    enhanceText: enhanceTextResource,
    analyzeDocument: analyzeDocumentResource,
    generateSuggestions: generateSuggestionsResource,
    analyzeProjectRisks: analyzeProjectRisksResource,
    analyzeCode: analyzeCodeResource,
    chatWithAI: chatWithAIResource,
    generateMeetingSummary: generateMeetingSummaryResource,
    scheduleMeetingBot: scheduleMeetingBotResource,
    joinMeetingBot: joinMeetingBotResource,
    leaveMeetingBot: leaveMeetingBotResource,
    getMeetingTranscript: getMeetingTranscriptResource,
    getMeetingInsights: getMeetingInsightsResource,
    processUnholyCommand: processUnholyCommandResource,
    getProactiveSuggestions: getProactiveSuggestionsResource,
    getCommandHistory: getCommandHistoryResource
  }
})

/**
 * @public
 */
export function createModel (builder: Builder): void {
  builder.createModel(TAIConfiguration, TAIChatMessage)

  // Register AI services
  builder.createService(AIService)
  builder.createService(MeetingBotService)
  builder.createService(UnholyCommandCenter)
}

/**
 * @public
 */
export type CreateTaskWithAI = Resource<(request: any, ctx: any) => Promise<any>>

/**
 * @public
 */
export type EnhanceText = Resource<(text: string, context: any, ctx: any) => Promise<string>>

/**
 * @public
 */
export const createTaskWithAIResource: CreateTaskWithAI = async (request: any, ctx: any) => {
  const aiService = ctx.get(AIService)
  return await aiService.createTaskFromPrompt(request)
}

/**
 * @public
 */
export const enhanceTextResource: EnhanceText = async (text: string, context: any, ctx: any) => {
  const aiService = ctx.get(AIService)
  return await aiService.enhanceText(text, context)
}

/**
 * @public
 */
export type AnalyzeDocument = Resource<(content: string, documentType: string, ctx: any) => Promise<any>>

/**
 * @public
 */
export const analyzeDocumentResource: AnalyzeDocument = async (content: string, documentType: string, ctx: any) => {
  const aiService = ctx.get(AIService)
  return await aiService.analyzeDocument(content, documentType)
}

/**
 * @public
 */
export type GenerateSuggestions = Resource<(context: any, ctx: any) => Promise<string[]>>

/**
 * @public
 */
export const generateSuggestionsResource: GenerateSuggestions = async (context: any, ctx: any) => {
  const aiService = ctx.get(AIService)
  return await aiService.generateSuggestions(context)
}

/**
 * @public
 */
export type AnalyzeProjectRisks = Resource<(projectData: any, ctx: any) => Promise<any>>

/**
 * @public
 */
export const analyzeProjectRisksResource: AnalyzeProjectRisks = async (projectData: any, ctx: any) => {
  const aiService = ctx.get(AIService)
  return await aiService.analyzeProjectRisks(projectData)
}

/**
 * @public
 */
export type AnalyzeCode = Resource<(code: string, language: string, context: string, ctx: any) => Promise<any>>

/**
 * @public
 */
export const analyzeCodeResource: AnalyzeCode = async (code: string, language: string, context: string, ctx: any) => {
  const aiService = ctx.get(AIService)
  return await aiService.analyzeCode(code, language, context)
}

/**
 * @public
 */
export type ChatWithAI = Resource<(message: string, history: any[], context: any, ctx: any) => Promise<any>>

/**
 * @public
 */
export const chatWithAIResource: ChatWithAI = async (message: string, history: any[], context: any, ctx: any) => {
  const aiService = ctx.get(AIService)
  return await aiService.chatWithAI(message, history, context)
}

/**
 * @public
 */
export type GenerateMeetingSummary = Resource<(transcript: string, participants: string[], ctx: any) => Promise<any>>

/**
 * @public
 */
export const generateMeetingSummaryResource: GenerateMeetingSummary = async (transcript: string, participants: string[], ctx: any) => {
  const aiService = ctx.get(AIService)
  return await aiService.generateMeetingSummary(transcript, participants)
}

/**
 * @public
 */
export type ScheduleMeetingBot = Resource<(meetingInfo: any, ctx: any) => Promise<any>>

/**
 * @public
 */
export const scheduleMeetingBotResource: ScheduleMeetingBot = async (meetingInfo: any, ctx: any) => {
  const meetingBotService = ctx.get(MeetingBotService)
  return await meetingBotService.scheduleMeetingBot(meetingInfo)
}

/**
 * @public
 */
export type JoinMeetingBot = Resource<(meetingId: string, ctx: any) => Promise<void>>

/**
 * @public
 */
export const joinMeetingBotResource: JoinMeetingBot = async (meetingId: string, ctx: any) => {
  const meetingBotService = ctx.get(MeetingBotService)
  // Get meeting details from database
  const meeting = await ctx.get(TxOperations).findOne(unholyAi.class.Meeting, { _id: meetingId })
  if (!meeting) {
    throw new Error('Meeting not found')
  }
  await meetingBotService.joinMeeting(meetingId, meeting.platform as any, meeting.meetingUrl!)
}

/**
 * @public
 */
export type LeaveMeetingBot = Resource<(meetingId: string, ctx: any) => Promise<any>>

/**
 * @public
 */
export const leaveMeetingBotResource: LeaveMeetingBot = async (meetingId: string, ctx: any) => {
  const meetingBotService = ctx.get(MeetingBotService)
  return await meetingBotService.leaveMeeting(meetingId)
}

/**
 * @public
 */
export type GetMeetingTranscript = Resource<(meetingId: string, ctx: any) => Promise<any[]>>

/**
 * @public
 */
export const getMeetingTranscriptResource: GetMeetingTranscript = async (meetingId: string, ctx: any) => {
  const tx = ctx.get(TxOperations)
  const transcripts = await tx.findAll(unholyAi.class.MeetingTranscript, { meetingId })
  return transcripts
}

/**
 * @public
 */
export type GetMeetingInsights = Resource<(meetingId: string, ctx: any) => Promise<any>>

/**
 * @public
 */
export const getMeetingInsightsResource: GetMeetingInsights = async (meetingId: string, ctx: any) => {
  const tx = ctx.get(TxOperations)
  const insights = await tx.findOne(unholyAi.class.MeetingInsights, { meetingId })
  return insights
}

/**
 * @public
 */
export type ProcessUnholyCommand = Resource<(commandData: any, ctx: any) => Promise<any>>

/**
 * @public
 */
export const processUnholyCommandResource: ProcessUnholyCommand = async (commandData: any, ctx: any) => {
  const commandCenter = ctx.get(UnholyCommandCenter)
  return await commandCenter.processCommand(
    commandData.command,
    commandData.userId,
    commandData.workspaceId,
    commandData.context
  )
}

/**
 * @public
 */
export type GetProactiveSuggestions = Resource<(userId: string, workspaceId: string, ctx: any) => Promise<any[]>>

/**
 * @public
 */
export const getProactiveSuggestionsResource: GetProactiveSuggestions = async (userId: string, workspaceId: string, ctx: any) => {
  const commandCenter = ctx.get(UnholyCommandCenter)
  return await commandCenter.getProactiveSuggestions(userId, workspaceId)
}

/**
 * @public
 */
export type GetCommandHistory = Resource<(userId: string, ctx: any) => Promise<any[]>>

/**
 * @public
 */
export const getCommandHistoryResource: GetCommandHistory = async (userId: string, ctx: any) => {
  // Implementation would fetch command history from database
  return []
}

/**
 * @public
 */
export const unholyAiId: Plugin = 'unholy-ai' as Plugin