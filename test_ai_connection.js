// 🌟 UNHOLY AI CONNECTION TEST
// Test if your AI army is ready for battle!

const API_KEY = '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';

async function testOpenRouterConnection() {
  console.log('🚀 Testing UNHOLY AI Connection...');
  console.log('🔑 Using API Key: sk-p2mef3****25cKinsF');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://localhost:8080',
        'X-Title': 'UNHOLY AI'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are UNHOLY AI - the most powerful AI assistant that actually DOES THINGS instead of just talking. You help users create tasks, schedule meetings, analyze data, and take action. Be confident, proactive, and action-oriented.'
          },
          {
            role: 'user',
            content: 'Hello! I want to test if you\'re working properly. Can you create a sample task for me? Just say what task you\'d create.'
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('✅ UNHOLY AI IS ONLINE! 🌟');
    console.log('🤖 Response:', data.choices[0].message.content);
    console.log('💰 Tokens used:', data.usage?.total_tokens || 'N/A');
    console.log('📊 Model:', data.model);

    return {
      success: true,
      response: data.choices[0].message.content,
      usage: data.usage,
      model: data.model
    };

  } catch (error) {
    console.error('❌ UNHOLY AI Connection Failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testOpenRouterConnection().then(result => {
  if (result.success) {
    console.log('\n🎉 YOUR UNHOLY AI IS READY! 🚀');
    console.log('Now you can:');
    console.log('1. ✅ Build and run the Unholy application');
    console.log('2. 🤖 Find the AI widget in the sidebar');
    console.log('3. 🌟 Start commanding your AI army!');
    console.log('\n🎤 Try commands like:');
    console.log('   "Create task to review code by Friday"');
    console.log('   "Schedule meeting with Sarah tomorrow at 3pm"');
    console.log('   "Generate weekly progress report"');
    console.log('   "Assign high priority bug fix to John"');
  } else {
    console.log('\n❌ Connection failed. Check:');
    console.log('1. 🔑 API key is correct');
    console.log('2. 🌐 Internet connection is working');
    console.log('3. 💰 OpenRouter account has credits');
  }
}).catch(error => {
  console.error('🚨 Test failed:', error);
});

// Instructions for the user
console.log(`
🌟 UNHOLY AI TEST RESULTS 🌟
================================
🔑 API Key: sk-p2mef3****25cKinsF (configured)
📱 Environment: Development server environment
🚀 Status: Testing connection now...

Check above for results. If successful:
1. Run: rush build && cd dev/prod && rushx dev-server
2. Open: http://localhost:8080
3. Look for "🤖 UNHOLY AI" in left sidebar
4. Start commanding your AI army!

🎯 QUICK COMMANDS TO TRY:
- "Create task to fix the login bug"
- "Schedule meeting with dev team tomorrow"
- "Generate weekly progress report"
- "Analyze this document for action items"

🤖 YOUR AI ARMY IS WAITING! 🌟
`);