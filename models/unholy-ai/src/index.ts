//
// Copyright © 2025 Unholy Platform Contributors.
//

import { type Builder, Model, Prop, TypeString, TypeNumber, TypeBoolean, TypeRef, TypeDate, Index, Hidden } from '@hcengineering/model'
import core, { type Class, type Doc, type Domain, type Ref, type Timestamp, IndexKind, AccountRole } from '@hcengineering/core'
import { TDoc } from '@hcengineering/model-core'
import setting from '@hcengineering/model-setting'
import workbench from '@hcengineering/model-workbench'
import unholyAi, { type AIConfiguration, type AIChatMessage, AIProvider } from '@hcengineering/unholy-ai'

export { unholyAiId } from '@hcengineering/unholy-ai'

export const DOMAIN_UNHOLY_AI = 'unholy-ai' as Domain

/**
 * @public
 */
@Model(unholyAi.class.AIConfiguration, core.class.Doc, DOMAIN_UNHOLY_AI)
export class TAIConfiguration extends TDoc implements AIConfiguration {
  @Prop(TypeString(), unholyAi.string.AIProvider)
    provider!: AIProvider

  @Prop(TypeString(), unholyAi.string.APIKey)
  @Hidden()
    apiKey!: string

  @Prop(TypeString(), unholyAi.string.Model)
    model?: string

  @Prop(TypeNumber(), unholyAi.string.Temperature)
    temperature?: number

  @Prop(TypeNumber(), unholyAi.string.MaxTokens)
    maxTokens?: number

  @Prop(TypeBoolean(), core.string.IsActive)
    isActive!: boolean
}

/**
 * @public
 */
@Model(unholyAi.class.AIChatMessage, core.class.Doc, DOMAIN_UNHOLY_AI)
export class TAIChatMessage extends TDoc implements AIChatMessage {
  @Prop(TypeRef(core.class.Doc), core.string.User)
  @Index(IndexKind.Indexed)
    userId!: Ref<Doc>

  @Prop(TypeString(), core.string.Workspace)
  @Index(IndexKind.Indexed)
    workspaceId!: string

  @Prop(TypeString(), unholyAi.string.AIProvider)
    provider!: AIProvider

  @Prop(TypeString(), unholyAi.string.Model)
    model!: string

  @Prop(TypeString(), core.string.String)
    prompt!: string

  @Prop(TypeString(), core.string.String)
    response!: string

  @Prop(TypeNumber(), unholyAi.string.TokensUsed)
    tokensUsed?: number

  @Prop(TypeNumber(), unholyAi.string.EstimatedCost)
    cost?: number

  @Prop(TypeDate(), core.string.ModifiedDate)
  @Index(IndexKind.Indexed)
    timestamp!: Timestamp

  @Prop(TypeString(), core.string.String)
    contextType?: string

  @Prop(TypeRef(core.class.Doc), core.string.AttachedTo)
    contextRef?: Ref<Doc>
}

export function createModel (builder: Builder): void {
  builder.createModel(TAIConfiguration, TAIChatMessage)

  // Import meeting models
  const { createMeetingModel } = require('./meeting')
  createMeetingModel(builder)

  // Add AI widget for sidebar
  builder.createDoc(
    workbench.class.Widget,
    core.space.Model,
    {
      _class: workbench.class.Widget,
      label: unholyAi.string.AIAssistant,
      icon: unholyAi.icon.AI,
      type: workbench.WidgetType.Configurable,
      component: unholyAi.component.AINavigation,
      accessLevel: AccountRole.User
    },
    'unholy-ai-widget' as any
  )

  // Add AI settings category
  builder.createDoc(
    setting.class.SettingsCategory,
    core.space.Model,
    {
      name: 'ai-configuration',
      label: unholyAi.string.AIConfiguration,
      icon: unholyAi.icon.AI,
      component: unholyAi.component.AIConfigurationSettings,
      group: 'settings',
      order: 3000,
      role: AccountRole.User,
      expandable: false,
      adminOnly: false
    },
    unholyAi.ids.AISettings
  )

  // Add Meeting Bot settings category
  builder.createDoc(
    setting.class.SettingsCategory,
    core.space.Model,
    {
      name: 'meeting-bot',
      label: unholyAi.string.MeetingBot,
      icon: unholyAi.icon.MeetingBot,
      component: unholyAi.component.MeetingBotManager,
      group: 'settings',
      order: 3100,
      role: AccountRole.User,
      expandable: false,
      adminOnly: false
    },
    'meeting-bot-settings' as any
  )
}

export default unholyAi
