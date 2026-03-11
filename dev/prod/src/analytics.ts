//
// Copyright © 2024 Hardcore Engineering Inc
//

// import { configureAnalyticsProviders } from '@hcengineering/analytics-providers'
import { type Config } from './platform'

export function configureAnalytics (config: Config) {
  // Temporarily disabled - analytics providers causing compilation issues
  // configureAnalyticsProviders(config)
  console.log('Analytics configuration skipped')
}
