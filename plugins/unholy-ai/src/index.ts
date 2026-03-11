//
// Copyright © 2025 Unholy Platform Contributors.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//

import type { Metadata, Plugin } from '@hcengineering/platform'
import { plugin } from '@hcengineering/platform'

export const unholyAiId = 'unholy-ai' as Plugin

const unholyAi = plugin(unholyAiId, {
  metadata: {
    OpenRouterAPIKey: '' as Metadata<string>,
    OpenRouterModel: '' as Metadata<string>,
    OpenRouterTemperature: '' as Metadata<number>,
    OpenRouterMaxTokens: '' as Metadata<number>,
    OpenAIAPIKey: '' as Metadata<string>,
    AnthropicAPIKey: '' as Metadata<string>,
    ZhipuAPIKey: '' as Metadata<string>
  }
})

export default unholyAi
