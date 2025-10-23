//
// Copyright © 2025 Unholy Platform Contributors.
//

import unholyAi, { unholyAiId } from '@hcengineering/unholy-ai'
import { loadLocale } from '@hcengineering/platform'

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

// Export Svelte components for UI build
export { default as AIConfigurationSettings } from './components/AIConfigurationSettings.svelte'
export { default as AITaskCreator } from './components/AITaskCreator.svelte'
export { default as AIEnhanceButton } from './components/AIEnhanceButton.svelte'
export { default as VoiceInputButton } from './components/VoiceInputButton.svelte'
export { default as AIChatAssistant } from './components/AIChatAssistant.svelte'
export { default as AICockpit } from './components/AICockpit.svelte'
export { default as AIDocumentAnalyzer } from './components/AIDocumentAnalyzer.svelte'
export { default as AISmartSuggestions } from './components/AISmartSuggestions.svelte'
export { default as AINavigation } from './components/AINavigation.svelte'
export { default as UnholyCommandCenter } from './components/UnholyCommandCenter.svelte'
export { default as MeetingBotManager } from './components/MeetingBotManager.svelte'
export { default as MeetingInsightsViewer } from './components/MeetingInsightsViewer.svelte'

// Export plugin as default
export { default } from './plugin'