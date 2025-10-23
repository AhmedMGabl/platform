# 🤖 Unholy AI Setup Guide

## Quick Start with Zhipu AI (智谱清言)

Your Zhipu AI configuration is ready! Here's how to use it:

### 1. Set Environment Variables

Create a `.env` file in your Huly installation or set these environment variables:

```bash
# Zhipu AI Configuration
ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
ANTHROPIC_API_KEY=bb17c0773b8a4effb0f42c4418addcc5.JhWuEIijoNxQdqY5
```

### 2. Configure in Huly

**Option A: Zhipu AI (Chinese AI)**
1. Start Huly
2. Go to **Settings** → **AI Configuration**
3. Click **Add Configuration**
4. Select **Anthropic (Claude)**
5. Enter your API key: `bb17c0773b8a4effb0f42c4418addcc5.JhWuEIijoNxQdqY5`
6. Select **glm-4** model (or glm-4-plus, glm-4-air)
7. Set temperature to 0.7 and max tokens to 2000
8. Save

**Option B: OpenRouter (Multi-Provider)**
1. Start Huly
2. Go to **Settings** → **AI Configuration**
3. Click **Add Configuration**
4. Select **OpenRouter**
5. Enter your API key: `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`
6. Select model (e.g., `anthropic/claude-3-opus` or `openai/gpt-4-turbo-preview`)
7. Set temperature to 0.7 and max tokens to 2000
8. Save

**Pro Tip:** Configure both! Unholy AI will auto-fallback between providers.

### 3. Test It!

Try creating a task with AI:

```
"Build user authentication with OAuth2 support for Google and GitHub, including email verification and password reset functionality"
```

## Available Models

**Zhipu AI Models:**
- `glm-4` - Standard model (recommended)
- `glm-4-plus` - Enhanced capabilities
- `glm-4-air` - Lightweight and fast

**Other Providers:**
- OpenAI: GPT-4, GPT-3.5
- Anthropic: Claude 3 Opus, Sonnet, Haiku
- OpenRouter: Access to multiple models

## Features

### ✅ What You Can Do Now:

1. **AI Task Creation** - Write a prompt, get a detailed task
2. **Voice Input** - Speak to create tasks
3. **Text Enhancement** - Improve task descriptions
4. **Multi-Provider** - Switch between AI providers
5. **Cost Tracking** - Monitor usage

### 🔥 Advanced Features:

1. **Meeting → Tasks** - Paste meeting notes, get action items
2. **Epic Breakdown** - Describe project, get 20+ tasks
3. **Smart Estimates** - AI estimates based on your patterns
4. **Auto-Documentation** - Generate docs from code

## Troubleshooting

### Issues with Zhipu AI:

1. **API Key Invalid**: Make sure your key is active
2. **Model Not Found**: Use `glm-4`, `glm-4-plus`, or `glm-4-air`
3. **Rate Limits**: Zhipu AI has rate limits, check your usage
4. **Endpoint Issues**: Ensure the base URL is correct

### Debug Logs:

Check your Huly logs for:
- `🤖 Using Zhipu AI endpoint for Anthropic`
- `🌐 Using OpenRouter endpoint`
- API response details
- Error messages
- Fallback behavior when one provider fails

## Environment Variables Guide

```bash
# For development
export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
export ANTHROPIC_API_KEY=bb17c0773b8a4effb0f42c4418addcc5.JhWuEIijoNxQdqY5
export OPENROUTER_API_KEY=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

# For production (add to your .env file)
ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
ANTHROPIC_API_KEY=your-zhipu-production-key
OPENROUTER_API_KEY=your-openrouter-production-key
```

## Ready to Go! 🚀

Your Zhipu AI integration is now part of Huly. You can:
- Create tasks from simple descriptions
- Use voice input (Ctrl+Shift+Space)
- Enhance any text with AI
- Track your AI usage and costs

The AI will automatically detect you're using Zhipu AI and route requests appropriately.

---

**Need help?** Check the logs or create an issue!