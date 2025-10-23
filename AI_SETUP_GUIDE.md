# 🤖 Enhanced Huly AI Setup Guide

## Overview

Huly now includes **enhanced AI capabilities** powered by OpenRouter and multiple AI providers. This guide will help you set up and configure the AI features.

## ✨ New AI Features

### Core AI Capabilities
- ✅ **Task Creation** - Generate detailed tasks from natural language
- ✅ **Text Enhancement** - Improve writing quality and clarity
- ✅ **Document Analysis** - Analyze documents and extract insights
- ✅ **Smart Suggestions** - Get contextual recommendations
- ✅ **Risk Analysis** - Identify and mitigate project risks
- ✅ **Code Analysis** - Review code and suggest improvements
- ✅ **AI Chat Assistant** - Real-time conversational AI
- ✅ **Meeting Summaries** - Generate meeting insights and action items

### AI Providers Supported
- **OpenRouter** (Recommended) - Access to multiple models
- **OpenAI** - GPT models
- **Anthropic** - Claude models
- **Zhipu AI** - GLM models

## 🔧 Setup Instructions

### 1. Configure OpenRouter API Key

#### Option A: Using Environment Variables (Recommended)

Add to your `.env` file in the `dev/` directory:

```bash
# OpenRouter Configuration
OPENROUTER_API_KEY=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
OPENROUTER_MODEL="anthropic/claude-3.5-sonnet"
OPENROUTER_TEMPERATURE=0.7
OPENROUTER_MAX_TOKENS=2000
```

#### Option B: Using the AI Configuration UI

1. Navigate to **Settings** → **AI Configuration**
2. Select **OpenRouter** as the provider
3. Enter your API key: `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`
4. Configure model settings:
   - **Model**: `anthropic/claude-3.5-sonnet` (recommended) or any OpenRouter model
   - **Temperature**: `0.7` (balanced creativity)
   - **Max Tokens**: `2000` (sufficient length)
5. Click **Test Connection** to verify
6. Save configuration

### 2. Recommended OpenRouter Models

| Model | Best For | Cost | Performance |
|-------|----------|------|-------------|
| `anthropic/claude-3.5-sonnet` | General tasks, analysis | Medium | Excellent |
| `openai/gpt-4o` | Complex reasoning | High | Excellent |
| `anthropic/claude-3-haiku` | Quick responses | Low | Good |
| `google/gemini-pro-1.5` | Multimodal tasks | Medium | Very Good |
| `meta-llama/llama-3.1-405b-instruct` | Advanced reasoning | High | Excellent |

### 3. Enable AI Features

The AI features are now available throughout Huly:

#### In Task Management
- **Create Task with AI** - Natural language to structured tasks
- **Enhance Description** - Improve task clarity and detail

#### In Documents
- **Analyze Document** - Extract insights and action items
- **Smart Suggestions** - Contextual recommendations

#### In Chat
- **AI Assistant** - Conversational help for projects
- **Voice Input** - Speech-to-text functionality

#### In Project Management
- **Risk Analysis** - Identify potential project risks
- **Meeting Summary** - Automated meeting insights

## 🚀 Usage Examples

### Task Creation with AI
```
Prompt: "Build user authentication with Google OAuth, including email verification, password reset, and user profile management. Should be secure and follow OWASP guidelines."

AI Generates:
- Title: "Implement Google OAuth Authentication System"
- Description with technical requirements
- Acceptance criteria
- Subtasks for implementation
- Estimated hours
- Security considerations
```

### Document Analysis
```
Input: Project requirements document
AI Provides:
- Executive summary
- Key requirements extraction
- Action items
- Risk identification
- Clarity suggestions
- Readability score
```

### Smart Suggestions
```
Context: Mobile app development project
AI Suggests:
- Set up CI/CD pipeline
- Implement automated testing
- Create deployment strategy
- Plan analytics integration
```

## 🔒 Security & Privacy

### Data Protection
- API keys are encrypted in the database
- AI requests are logged for usage tracking
- No sensitive data is stored with third-party services
- Fallback mechanisms prevent service interruption

### Usage Monitoring
- Track token usage and costs
- Monitor API call patterns
- Set usage limits per workspace
- Audit trail for AI interactions

## ⚙️ Advanced Configuration

### Custom AI Prompts
You can customize AI behavior by modifying prompts in:
- `server-plugins/unholy-ai/src/aiService.ts`

### Rate Limiting
Configure request limits in:
```typescript
// Example: Rate limiting configuration
const rateLimits = {
  requestsPerMinute: 60,
  tokensPerHour: 100000
}
```

### Model Fallback Chain
Set up fallback providers:
```typescript
const providerPriority = [
  AIProvider.OpenRouter,
  AIProvider.OpenAI,
  AIProvider.Anthropic
]
```

## 🛠️ Development Guide

### Adding New AI Features

1. **Extend AI Service** (`aiService.ts`):
```typescript
async newAIFeature(input: any): Promise<any> {
  const prompt = this.buildPrompt(input)
  const response = await this.callAI(prompt, 'new_feature')
  return this.parseResponse(response)
}
```

2. **Add Resource Handler** (`index.ts`):
```typescript
export const newAIResource: NewAIType = async (input, ctx) => {
  const aiService = ctx.get(AIService)
  return await aiService.newAIFeature(input)
}
```

3. **Create Frontend Component** (`.svelte`):
```svelte
<script>
  // Component logic
</script>

<!-- UI elements -->
<style>
  /* Styling */
</style>
```

### Testing AI Features
```bash
# Run tests
rush test

# Test AI integration locally
cd dev/prod
rush validate
rushx dev-server
```

## 📊 Monitoring & Analytics

### Usage Metrics
- Total API calls per provider
- Token consumption
- Cost tracking
- Response times
- Error rates

### Available Reports
- Usage by workspace
- Cost breakdown
- Feature utilization
- Performance metrics

## 🔧 Troubleshooting

### Common Issues

#### API Key Not Working
1. Verify the API key is correct
2. Check OpenRouter account status
3. Ensure sufficient credits
4. Test with a different model

#### Slow Response Times
1. Check model availability
2. Reduce `max_tokens` setting
3. Try a faster model (like Haiku)
4. Check network connectivity

#### Low Quality Responses
1. Increase temperature for more creativity
2. Improve prompt specificity
3. Add more context
4. Try a more capable model

### Getting Help
- Check logs in `server-plugins/unholy-ai/`
- Review AI usage metrics
- Test API connection in settings
- Consult documentation at `/docs/ai`

## 🎯 Best Practices

### For Best Results
1. **Be Specific** - Provide detailed context
2. **Set Appropriate Temperature** - Lower for factual, higher for creative
3. **Choose Right Model** - Match model to task complexity
4. **Monitor Usage** - Track costs and tokens
5. **Validate Output** - Review AI-generated content

### Prompt Engineering Tips
- Include clear objectives
- Provide relevant context
- Specify output format
- Use examples when helpful
- Iterate and refine

## 📈 Future Enhancements

### Coming Soon
- Custom model fine-tuning
- Advanced analytics dashboard
- Workflow automation
- Multi-language support
- Voice interactions
- Image analysis
- Code generation

### Roadmap
- Q1 2025: Advanced analytics
- Q2 2025: Custom training
- Q3 2025: Workflow automation
- Q4 2025: Enterprise features

---

## 🎉 Ready to Go!

Your Huly platform is now equipped with powerful AI capabilities! Start exploring the new features and let AI enhance your productivity.

**Need help?** Check the documentation or reach out to the community.

**Enjoy your enhanced AI-powered Huly experience!** 🚀