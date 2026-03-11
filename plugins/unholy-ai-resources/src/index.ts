//
// Copyright © 2025 Unholy Platform Contributors.
//

import { type Resources } from '@hcengineering/platform'
import { unholyAiId } from '@hcengineering/unholy-ai'
import { loadLocale } from '@hcengineering/platform'

import AIConfigurationSettings from './components/AIConfigurationSettings.svelte'
import AITaskCreator from './components/AITaskCreator.svelte'
import AIEnhanceButton from './components/AIEnhanceButton.svelte'
import VoiceInputButton from './components/VoiceInputButton.svelte'

// Load AI resources locale
loadLocale(unholyAiId, {
  AIAssistant: 'AI Assistant',
  AIConfiguration: 'AI Configuration',
  AIProvider: 'AI Provider',
  APIKey: 'API Key',
  Model: 'Model',
  Temperature: 'Temperature',
  MaxTokens: 'Max Tokens',
  TestConnection: 'Test Connection',
  CreateWithAI: 'Create with AI',
  EnhanceWithAI: 'Enhance with AI',
  VoiceInput: 'Voice Input',
  Processing: 'Processing...',
  AIGenerating: 'AI Generating...',
  ConfigureAI: 'Configure AI',
  NoAPIKey: 'No API key configured',
  SelectProvider: 'Select Provider',
  UsageTracking: 'Usage Tracking',
  TokensUsed: 'Tokens Used',
  EstimatedCost: 'Estimated Cost'
})

export default async (): Promise<Resources> => ({
  component: {
    AIConfigurationSettings,
    AITaskCreator,
    AIEnhanceButton,
    VoiceInputButton
  }
})