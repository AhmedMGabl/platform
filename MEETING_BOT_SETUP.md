# 🤖 AI Meeting Bot Setup Guide

## Overview

The Huly AI Meeting Bot can automatically join your meetings, record conversations, transcribe audio, extract action items, and create tasks. This guide will help you set up the bot for Lark and Google Meet meetings.

## ✨ Features

### 🎥 **Recording & Transcription**
- **Automatic Meeting Joining** - Bot joins scheduled meetings automatically
- **Real-time Recording** - High-quality audio/video recording
- **Live Transcription** - Speech-to-text with speaker identification
- **Multi-language Support** - Transcribe in multiple languages

### 🧠 **AI-Powered Analysis**
- **Smart Note-Taking** - AI identifies key topics and decisions
- **Action Item Extraction** - Automatically finds tasks and assignments
- **Sentiment Analysis** - Understand meeting tone and engagement
- **Participation Tracking** - See who spoke and how much

### 📋 **Task Management**
- **Automatic Task Creation** - Convert action items to tasks
- **Smart Assignment** - Identify responsible parties
- **Due Date Suggestions** - AI recommends deadlines
- **Priority Assignment** - Automatic priority levels

### 📊 **Meeting Insights**
- **Executive Summaries** - Quick overviews of key points
- **Decision Tracking** - Important decisions and outcomes
- **Risk Identification** - Potential issues and mitigation
- **Follow-up Items** - Next steps and recommendations

## 🔧 Setup Requirements

### 1. Platform Integrations

#### **Google Meet Integration**
```bash
# Google Cloud Project Settings
1. Create Google Cloud Project
2. Enable Google Meet API
3. Enable Google Speech-to-Text API
4. Create OAuth 2.0 Credentials
5. Set up service account with appropriate permissions

# Required Scopes:
- https://www.googleapis.com/auth/meetings.space.created
- https://www.googleapis.com/auth/meetings.space.readonly
- https://www.googleapis.com/auth/calendar.events.readonly
```

#### **Lark Integration**
```bash
# Lark App Configuration
1. Create Lark App in Developer Console
2. Enable Meeting Bot permissions
3. Configure webhook endpoints
4. Generate app credentials

# Required Permissions:
- meeting:readonly
- meeting:write
- user:readonly
```

### 2. Speech Recognition Setup

#### **Google Speech-to-Text**
```bash
# Environment variables
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GOOGLE_SPEECH_LANGUAGE=en-US
GOOGLE_SPEECH_SAMPLE_RATE=16000
```

#### **Alternative: OpenAI Whisper**
```bash
# Add to .env file
WHISPER_API_KEY=your_openai_api_key
WHISPER_MODEL=whisper-1
```

### 3. Storage Configuration

#### **Audio/Video Storage**
```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=huly-meeting-recordings
AWS_S3_REGION=us-west-2

# Alternative: Google Cloud Storage
GOOGLE_STORAGE_BUCKET=huly-meeting-recordings
GOOGLE_STORAGE_KEY_FILE=/path/to/service-account.json
```

## 🚀 Installation & Configuration

### 1. Environment Setup

Add to your `dev/.env` file:

```bash
# AI Meeting Bot Configuration
MEETING_BOT_ENABLED=true
MEETING_BOT_RECORDINGS_ENABLED=true
MEETING_BOT_TRANSCRIPTION_ENABLED=true

# Google Meet Integration
GOOGLE_MEET_CLIENT_ID=your_google_client_id
GOOGLE_MEET_CLIENT_SECRET=your_google_client_secret
GOOGLE_MEET_REDIRECT_URI=http://localhost:8080/auth/google/callback

# Lark Integration
LARK_APP_ID=your_lark_app_id
LARK_APP_SECRET=your_lark_app_secret
LARK_BOT_TOKEN=your_lark_bot_token

# Speech Recognition
SPEECH_PROVIDER=google
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Storage
STORAGE_PROVIDER=aws
AWS_S3_BUCKET=huly-meeting-recordings
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

### 2. Install Dependencies

```bash
cd plugins/unholy-ai
rush update

# Install speech recognition dependencies
rush add @google-cloud/speech
rush add @google-cloud/meet
rush add @google-cloud/storage

# Install Lark SDK
rush add @larksuiteoapi/node-sdk

# Install audio processing
rush add node-record-lpcm16
rush add ffmpeg-static
```

### 3. Database Migration

```bash
# Update database with new meeting models
cd dev/tool
rushx run-local upgrade -f
```

### 4. Start Services

```bash
# Start development server
cd dev/prod
rush validate
rushx dev-server

# Start meeting bot service (separate terminal)
rushx meeting-bot-service
```

## 📱 How to Use

### 1. Schedule a Meeting Bot

#### **Via Web Interface**
1. Navigate to **Settings** → **Meeting Bot Manager**
2. Click **"Schedule Meeting Bot"**
3. Fill in meeting details:
   - **Meeting Title**: descriptive name
   - **Platform**: Google Meet or Lark
   - **Start Time**: when the bot should join
   - **Meeting URL**: the meeting link
   - **Participants**: expected attendees
4. Click **"Schedule Bot"**

#### **Via API**
```typescript
// Schedule meeting bot
const response = await fetch('/api/ai/meeting-bot/schedule', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Project Review Meeting',
    platform: 'google-meet',
    startTime: '2025-01-20T14:00:00Z',
    meetingUrl: 'https://meet.google.com/xxx-xxxx-xxx',
    participants: ['Alice', 'Bob', 'Carol'],
    workspaceId: 'your-workspace-id'
  })
})

const meeting = await response.json()
console.log('Meeting bot scheduled:', meeting.meetingId)
```

### 2. During the Meeting

#### **What the Bot Does**
- 🎥 **Records** audio/video of the meeting
- 🎙️ **Transcribes** speech in real-time
- 🧠 **Analyzes** content for action items
- 📝 **Takes notes** on key decisions
- 📊 **Tracks** participation

#### **Real-time Features**
- **Live Transcription**: See transcript as it's generated
- **Action Item Detection**: Get notified of tasks mentioned
- **Speaker Identification**: Know who is speaking
- **Recording Status**: Monitor recording progress

### 3. After the Meeting

#### **Automatic Processing**
When the meeting ends, the bot automatically:
- ⏹️ **Stops recording** and saves files
- 🧠 **Processes transcript** with AI
- 📋 **Extracts action items**
- ✅ **Creates tasks** in your workspace
- 📊 **Generates insights**

#### **Meeting Results**
```typescript
// Get meeting insights
const insights = await fetch(`/api/ai/meeting-insights/${meetingId}`)
  .then(res => res.json())

console.log('Meeting Summary:', insights.summary)
console.log('Action Items:', insights.actionItems)
console.log('Key Decisions:', insights.keyDecisions)
```

## 🎯 Advanced Features

### 1. Custom Action Item Detection

Configure custom keywords for action item detection:

```typescript
// In meeting bot configuration
const actionItemKeywords = [
  'action item', 'todo', 'task', 'follow up',
  'responsible', 'assign', 'deadline', 'due date',
  'will', 'should', 'need to', 'commit to'
]
```

### 2. Speaker Identification

Train the bot on your team's voices:

```bash
# Upload voice samples
curl -X POST /api/ai/meeting-bot/train-speakers \
  -H "Content-Type: multipart/form-data" \
  -F "speaker=Alice Johnson" \
  -F "audio=@alice-sample.wav"
```

### 3. Custom Templates

Create custom meeting templates:

```typescript
const meetingTemplates = {
  'sprint-planning': {
    actionItemCategories: ['story', 'task', 'bug'],
    defaultAssignee: 'scrum-master',
    followUpDays: 14
  },
  'client-review': {
    actionItemCategories: ['feature', 'fix', 'improvement'],
    defaultAssignee: 'project-manager',
    followUpDays: 7
  }
}
```

### 4. Integration with Task Management

Automatically sync action items with your task system:

```typescript
// Task creation from meeting
const task = {
  title: actionItem.description,
  project: context.projectId,
  assignee: actionItem.assigneeEmail,
  dueDate: calculateDueDate(actionItem.context),
  priority: mapPriority(actionItem.priority),
  tags: ['meeting-action', 'auto-generated'],
  source: 'meeting-bot',
  sourceMeetingId: meetingId
}
```

## 🔍 API Reference

### Schedule Meeting Bot
```http
POST /api/ai/meeting-bot/schedule
Content-Type: application/json

{
  "title": "Project Review",
  "platform": "google-meet",
  "startTime": "2025-01-20T14:00:00Z",
  "meetingUrl": "https://meet.google.com/xxx",
  "participants": ["Alice", "Bob"],
  "workspaceId": "workspace-123"
}
```

### Join Meeting
```http
POST /api/ai/meeting-bot/join/{meetingId}
```

### Leave Meeting
```http
POST /api/ai/meeting-bot/leave/{meetingId}
```

### Get Transcript
```http
GET /api/ai/meeting-transcript/{meetingId}
```

### Get Insights
```http
GET /api/ai/meeting-insights/{meetingId}
```

## 🛠️ Troubleshooting

### Common Issues

#### **Bot Cannot Join Meeting**
1. Verify meeting URL is correct
2. Check platform credentials
3. Ensure bot has permissions
4. Confirm meeting is public or accessible

#### **Poor Transcription Quality**
1. Check audio quality settings
2. Verify speech recognition API access
3. Adjust language settings
4. Test with different audio formats

#### **Missing Action Items**
1. Review action item keywords
2. Check speaker identification
3. Adjust AI prompt settings
4. Verify participant list accuracy

### Debug Mode

Enable debug logging:
```bash
# Add to .env
MEETING_BOT_DEBUG=true
MEETING_BOT_LOG_LEVEL=verbose
```

### Health Checks

Monitor bot status:
```bash
# Check bot service status
curl /api/ai/meeting-bot/health

# Check active meetings
curl /api/ai/meeting-bot/active-meetings

# Check system resources
curl /api/ai/meeting-bot/system-status
```

## 🔒 Security & Privacy

### Data Protection
- **Encryption**: All recordings and transcripts are encrypted at rest
- **Access Control**: Only authorized users can access meeting data
- **Data Retention**: Configurable retention policies for recordings
- **Compliance**: GDPR and CCPA compliant data handling

### Privacy Features
- **Opt-out Options**: Participants can request not to be recorded
- **Data Anonymization**: Option to anonymize speaker identities
- **Secure Storage**: Encrypted storage with access controls
- **Audit Trail**: Complete audit log of all meeting activities

## 📈 Monitoring & Analytics

### Usage Metrics
- **Meeting Count**: Total meetings processed
- **Recording Duration**: Total hours recorded
- **Transcription Accuracy**: Speech-to-text accuracy rates
- **Action Item Rate**: Percentage of meetings with action items

### Performance Metrics
- **Bot Uptime**: Service availability percentage
- **Join Success Rate**: Percentage of successful meeting joins
- **Processing Time**: Time from meeting end to insights available
- **Error Rates**: Frequency of bot errors

### Cost Tracking
- **API Usage**: Speech recognition API costs
- **Storage Costs**: Recording storage expenses
- **Processing Costs**: AI processing costs
- **Platform Fees**: Meeting platform API costs

## 🎉 Best Practices

### Before the Meeting
1. **Test Setup**: Verify bot can join a test meeting
2. **Check Audio**: Ensure good microphone quality
3. **Update Participants**: Add expected attendees
4. **Set Keywords**: Configure action item keywords

### During the Meeting
1. **Clear Audio**: Speak clearly and minimize background noise
2. **Identify Speakers**: Have participants introduce themselves
3. **Action Items**: Clearly state tasks and assignments
4. **Monitor Status**: Check bot is recording properly

### After the Meeting
1. **Review Insights**: Check AI-generated summary
2. **Verify Tasks**: Ensure action items are correctly assigned
3. **Provide Feedback**: Help improve bot accuracy
4. **Archive Recordings**: Store or delete recordings as needed

---

## 🚀 Ready to Go!

Your Huly platform now has a fully functional AI Meeting Bot that can:

- ✅ **Join meetings automatically** on Google Meet and Lark
- ✅ **Record and transcribe** conversations in real-time
- ✅ **Extract action items** and create tasks automatically
- ✅ **Generate insights** and summaries with AI
- ✅ **Integrate seamlessly** with your existing workflow

Start by scheduling your first AI-powered meeting and experience the future of automated meeting management! 🎉