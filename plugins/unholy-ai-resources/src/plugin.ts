//
// Copyright © 2025 Unholy Platform Contributors.
//

import unholyAi, { unholyAiId } from '@hcengineering/unholy-ai'
import { plugin } from '@hcengineering/platform'
import type { AnyComponent } from '@hcengineering/ui'

import AIConfigurationSettings from './components/AIConfigurationSettings.svelte'
import AITaskCreator from './components/AITaskCreator.svelte'
import AIEnhanceButton from './components/AIEnhanceButton.svelte'
import VoiceInputButton from './components/VoiceInputButton.svelte'

export default plugin(unholyAiId, {
  component: {
    AIConfigurationSettings: AIConfigurationSettings as AnyComponent,
    AITaskCreator: AITaskCreator as AnyComponent,
    AIEnhanceButton: AIEnhanceButton as AnyComponent,
    VoiceInputButton: VoiceInputButton as AnyComponent
  }
})