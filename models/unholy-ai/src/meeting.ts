//
// Copyright © 2025 Unholy Platform Contributors.
//

import { type Builder, Model, Prop, TypeString, TypeNumber, TypeBoolean, TypeRef, TypeDate, Index, Hidden, TypeArray } from '@hcengineering/model'
import core, { type Class, type Doc, type Domain, type Ref, type Timestamp, IndexKind } from '@hcengineering/core'
import { TDoc } from '@hcengineering/model-core'
import unholyAi, { AIProvider } from '@hcengineering/unholy-ai'

export { unholyAiId } from '@hcengineering/unholy-ai'

/**
 * Meeting metadata document
 */
@Model(unholyAi.class.Meeting, core.class.Doc, DOMAIN_UNHOLY_AI)
export class TMeeting extends TDoc implements Meeting {
  @Prop(TypeString(), core.string.Title)
    title!: string

  @Prop(TypeString(), unholyAi.string.MeetingPlatform)
    platform!: string

  @Prop(TypeDate(), core.string.CreatedDate)
    startTime!: Timestamp

  @Prop(TypeDate(), core.string.ModifiedDate)
    endTime?: Timestamp

  @Prop(TypeNumber(), unholyAi.string.MeetingDuration)
    duration?: number

  @Prop(TypeArray(TypeString()), unholyAi.string.MeetingParticipants)
    participants!: string[]

  @Prop(TypeString(), unholyAi.string.MeetingUrl)
    meetingUrl?: string

  @Prop(TypeString(), unholyAi.string.RecordingUrl)
    recordingUrl?: string

  @Prop(TypeString(), unholyAi.string.TranscriptUrl)
    transcriptUrl?: string

  @Prop(TypeString(), core.string.Description)
    summary?: string

  @Prop(TypeArray(TypeString()), unholyAi.string.ActionItems)
    actionItems?: string[]

  @Prop(TypeString(), unholyAi.string.MeetingStatus)
    status!: MeetingStatus

  @Prop(TypeRef(core.class.Doc), core.string.CreatedBy)
    createdBy!: Ref<Doc>

  @Prop(TypeString(), core.string.Workspace)
    workspaceId!: string

  @Prop(TypeBoolean(), unholyAi.string.BotJoined)
    botJoined!: boolean
}

/**
 * Meeting transcript document
 */
@Model(unholyAi.class.MeetingTranscript, core.class.Doc, DOMAIN_UNHOLY_AI)
export class TMeetingTranscript extends TDoc implements MeetingTranscript {
  @Prop(TypeRef(core.class.Doc), core.string.AttachedTo)
    meetingId!: Ref<Doc>

  @Prop(TypeDate(), core.string.CreatedDate)
    timestamp!: Timestamp

  @Prop(TypeString(), core.string.Title)
    speaker!: string

  @Prop(TypeString(), core.string.String)
    speakerId?: string

  @Prop(TypeString(), core.string.Description)
    text!: string

  @Prop(TypeNumber(), unholyAi.string.Confidence)
    confidence?: number

  @Prop(TypeBoolean(), unholyAi.string.IsActionItem)
    isAction?: boolean

  @Prop(TypeArray(TypeString()), unholyAi.string.Tags)
    tags?: string[]

  @Prop(TypeNumber(), unholyAi.string.WordCount)
    wordCount?: number

  @Prop(TypeString(), unholyAi.string.Sentiment)
    sentiment?: string
}

/**
 * Meeting action item document
 */
@Model(unholyAi.class.MeetingActionItem, core.class.Doc, DOMAIN_UNHOLY_AI)
export class TMeetingActionItem extends TDoc implements MeetingActionItem {
  @Prop(TypeRef(core.class.Doc), core.string.AttachedTo)
    meetingId!: Ref<Doc>

  @Prop(TypeString(), core.string.Title)
    description!: string

  @Prop(TypeString(), core.string.String)
    assignee?: string

  @Prop(TypeString(), unholyAi.string.Priority)
    priority!: 'low' | 'medium' | 'high'

  @Prop(TypeString(), unholyAi.string.DueDate)
    dueDate?: string

  @Prop(TypeString(), core.string.Description)
    context?: string

  @Prop(TypeString(), unholyAi.string.AssigneeEmail)
    assigneeEmail?: string

  @Prop(TypeString(), unholyAi.string.Status)
    status!: ActionItemStatus

  @Prop(TypeRef(core.class.Doc), core.string.CreatedBy)
    createdBy!: Ref<Doc>

  @Prop(TypeDate(), core.string.CreatedDate)
    createdAt!: Timestamp

  @Prop(TypeRef(core.class.Doc), core.string.Object)
    taskId?: Ref<Doc>
}

/**
 * Meeting insights document
 */
@Model(unholyAi.class.MeetingInsights, core.class.Doc, DOMAIN_UNHOLY_AI)
export class TMeetingInsights extends TDoc implements MeetingInsights {
  @Prop(TypeRef(core.class.Doc), core.string.AttachedTo)
    meetingId!: Ref<Doc>

  @Prop(TypeString(), core.string.Description)
    summary!: string

  @Prop(TypeArray(TypeString()), unholyAi.string.KeyDecisions)
    keyDecisions!: string[]

  @Prop(TypeArray(TypeString()), unholyAi.string.RisksIdentified)
    risks!: string[]

  @Prop(TypeArray(TypeString()), unholyAi.string.NextSteps)
    nextSteps!: string[]

  @Prop(TypeString(), unholyAi.string.OverallSentiment)
    sentiment!: 'positive' | 'neutral' | 'negative'

  @Prop(TypeString(), unholyAi.string.EngagementLevel)
    engagementLevel!: 'high' | 'medium' | 'low'

  @Prop(TypeArray(TypeString()), unholyAi.string.DominantSpeakers)
    dominantSpeakers!: string[]

  @Prop(TypeArray(TypeString()), unholyAi.string.QuietParticipants)
    quietParticipants!: string[]

  @Prop(TypeNumber(), unholyAi.string.ParticipationScore)
    participationScore?: number

  @Prop(TypeArray(TypeString()), unholyAi.string.TopicsDiscussed)
    topics!: string[]

  @Prop(TypeNumber(), unholyAi.string.ActionItemsCount)
    actionItemsCount!: number

  @Prop(TypeNumber(), unholyAi.string.DecisionsCount)
    decisionsCount!: number

  @Prop(TypeDate(), core.string.CreatedDate)
    generatedAt!: Timestamp
}

/**
 * Meeting interfaces
 */
export interface Meeting extends Doc {
  title: string
  platform: string
  startTime: Timestamp
  endTime?: Timestamp
  duration?: number
  participants: string[]
  meetingUrl?: string
  recordingUrl?: string
  transcriptUrl?: string
  summary?: string
  actionItems?: string[]
  status: MeetingStatus
  createdBy: Ref<Doc>
  workspaceId: string
  botJoined: boolean
}

export interface MeetingTranscript extends Doc {
  meetingId: Ref<Doc>
  timestamp: Timestamp
  speaker: string
  speakerId?: string
  text: string
  confidence?: number
  isAction?: boolean
  tags?: string[]
  wordCount?: number
  sentiment?: string
}

export interface MeetingActionItem extends Doc {
  meetingId: Ref<Doc>
  description: string
  assignee?: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  context?: string
  assigneeEmail?: string
  status: ActionItemStatus
  createdBy: Ref<Doc>
  createdAt: Timestamp
  taskId?: Ref<Doc>
}

export interface MeetingInsights extends Doc {
  meetingId: Ref<Doc>
  summary: string
  keyDecisions: string[]
  risks: string[]
  nextSteps: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  engagementLevel: 'high' | 'medium' | 'low'
  dominantSpeakers: string[]
  quietParticipants: string[]
  participationScore?: number
  topics: string[]
  actionItemsCount: number
  decisionsCount: number
  generatedAt: Timestamp
}

export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}

export enum ActionItemStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Update model creation function
 */
export function createMeetingModel (builder: Builder): void {
  builder.createModel(
    TMeeting,
    TMeetingTranscript,
    TMeetingActionItem,
    TMeetingInsights
  )
}