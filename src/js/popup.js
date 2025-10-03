// Popup script for Salesforce AI Assistant
class SalesforceAssistantPopup {
  constructor() {
    this.contextInfo = document.getElementById('contextInfo');
    this.promptInput = document.getElementById('promptInput');
    this.analyzeBtn = document.getElementById('analyzeBtn');
    this.responseArea = document.getElementById('responseArea');

    this.init();
  }

  async init() {
    await this.loadContext();
    this.setupEventListeners();
    this.loadSettings();
  }

  async loadContext() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!this.isSalesforceTab(tab.url)) {
        this.contextInfo.textContent = 'Not on a Salesforce page';
        this.analyzeBtn.disabled = true;
        return;
      }

      // Get context from content script
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getContext' });

      if (response) {
        this.displayContext(response.context);
        this.pageContent = response.content;
      }
    } catch (error) {
      console.error('Error loading context:', error);
      this.contextInfo.textContent = 'Error loading page context';
    }
  }

  isSalesforceTab(url) {
    return url && (
      url.includes('salesforce.com') ||
      url.includes('force.com') ||
      url.includes('lightning.force.com')
    );
  }

  displayContext(context) {
    const contextText = `📍 ${context.pageType}${context.currentObject ? ` - ${context.currentObject}` : ''}
🖥️ ${context.userInterface} Experience
${context.errors.length > 0 ? `⚠️ ${context.errors.length} error(s) detected` : '✅ No errors detected'}`;

    this.contextInfo.textContent = contextText;
  }

  setupEventListeners() {
    // Quick action buttons
    document.querySelectorAll('.quick-action').forEach(btn => {
      btn.addEventListener('click', () => {
        this.promptInput.value = btn.dataset.prompt;
        this.promptInput.focus();
      });
    });

    // Analyze button
    this.analyzeBtn.addEventListener('click', () => {
      this.analyzeWithAI();
    });

    // Enter key in textarea
    this.promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        this.analyzeWithAI();
      }
    });
  }

  async analyzeWithAI() {
    const prompt = this.promptInput.value.trim();
    if (!prompt) {
      this.showResponse('Please enter a question or describe what you need help with.');
      return;
    }

    this.setLoading(true);

    try {
      // Get current tab context
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const contextResponse = await chrome.tabs.sendMessage(tab.id, { action: 'getContext' });

      // Prepare AI prompt
      const aiPrompt = this.buildAIPrompt(prompt, contextResponse);

      // Call AI API
      const aiResponse = await this.callAI(aiPrompt);

      this.showResponse(aiResponse);
    } catch (error) {
      console.error('AI Analysis error:', error);
      this.showResponse('Sorry, I encountered an error while analyzing. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  buildAIPrompt(userPrompt, contextData) {
    const context = contextData?.context || {};
    const content = contextData?.content || {};

    return `You are a Salesforce expert assistant. Help the user with their Salesforce question.

CURRENT CONTEXT:
- Page Type: ${context.pageType || 'Unknown'}
- Object: ${context.currentObject || 'Not detected'}
- Interface: ${context.userInterface || 'Unknown'}
- URL: ${context.url || 'Not available'}
- Errors: ${context.errors?.length || 0} detected

${context.errors?.length > 0 ? `
DETECTED ERRORS:
${context.errors.map(err => `- ${err.type}: ${err.message}`).join('\n')}
` : ''}

${content.fields?.length > 0 ? `
VISIBLE FIELDS:
${content.fields.map(field => `- ${field.label} (${field.type}${field.required ? ', required' : ''})`).join('\n')}
` : ''}

${content.buttons?.length > 0 ? `
AVAILABLE ACTIONS:
${content.buttons.map(btn => `- ${btn.text}`).join('\n')}
` : ''}

USER QUESTION: ${userPrompt}

Please provide a helpful, specific response that:
1. Addresses their question directly
2. Takes into account the current Salesforce context
3. Suggests specific next steps if applicable
4. Includes relevant Salesforce documentation links when helpful
5. Keeps the response concise but actionable

Response:`;
  }

  async callAI(prompt) {
    const settings = await this.getSettings();

    if (!settings.aiApiKey) {
      return `🔧 AI Integration Setup Required

To use AI analysis, you need to configure an API key:

1. Right-click the extension icon → Options
2. Add your OpenRouter API key
3. Select Grok or other preferred model

For now, here's some general help based on your context:

${this.generateContextualHelp(prompt)}`;
    }

    try {
      // OpenRouter API Integration (default - supports Grok and many other models)
      if (settings.aiProvider === 'openrouter' || !settings.aiProvider) {
        const headers = {
          'Authorization': `Bearer ${settings.aiApiKey}`,
          'Content-Type': 'application/json'
        };

        // Add optional headers for OpenRouter rankings
        if (settings.siteUrl) {
          headers['HTTP-Referer'] = settings.siteUrl;
        }
        if (settings.siteName) {
          headers['X-Title'] = settings.siteName;
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            model: settings.aiModel || 'x-ai/grok-4-fast:free',
            messages: [
              {
                role: 'system',
                content: 'You are a Salesforce expert assistant. Provide helpful, specific, and actionable advice. Keep responses concise but comprehensive. Include relevant Salesforce documentation links when helpful.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 800,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || `OpenRouter API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
      }

      // OpenAI Direct API Integration (fallback)
      else if (settings.aiProvider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.aiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: settings.aiModel || 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a Salesforce expert assistant. Provide helpful, specific, and actionable advice. Keep responses concise but comprehensive. Include relevant Salesforce documentation links when helpful.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 800,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || `OpenAI API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
      }

      // Azure OpenAI Integration
      else if (settings.aiProvider === 'azure') {
        const response = await fetch(`${settings.azureEndpoint}/openai/deployments/${settings.azureDeployment}/chat/completions?api-version=2024-02-15-preview`, {
          method: 'POST',
          headers: {
            'api-key': settings.aiApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: 'You are a Salesforce expert assistant. Provide helpful, specific, and actionable advice.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 800,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          throw new Error(`Azure API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
      }

    } catch (error) {
      console.error('AI API Error:', error);

      // Fallback to rule-based help with error info
      return `⚠️ AI Service Error: ${error.message}

Here's some contextual help while we resolve the AI connection:

${this.generateContextualHelp(prompt)}

💡 Tip: Check your API key and internet connection, then try again.`;
    }

    // Fallback if no provider configured
    return this.generateContextualHelp(prompt);
  }

  generateContextualHelp(prompt) {
    // Simple rule-based responses for MVP
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('error') || lowerPrompt.includes('debug')) {
      return `🔍 Debugging Help:

1. Check the browser console (F12) for JavaScript errors
2. Look for validation errors on required fields
3. Verify user permissions for this object/action
4. Check field-level security settings
5. Review any custom validation rules

Common fixes:
- Refresh the page and try again
- Clear browser cache
- Check if you have the necessary permissions`;
    }

    if (lowerPrompt.includes('permission') || lowerPrompt.includes('access')) {
      return `🔐 Permission Troubleshooting:

1. Check your Profile permissions
2. Review Permission Sets assigned to you
3. Verify Object-level permissions (CRUD)
4. Check Field-level security
5. Look for IP restrictions or login hours

Ask your Salesforce admin to review these settings if needed.`;
    }

    if (lowerPrompt.includes('flow') || lowerPrompt.includes('automation')) {
      return `⚡ Flow & Automation Help:

1. Check if the Flow is Active
2. Verify entry criteria are met
3. Review debug logs for the Flow
4. Check user permissions for Flow execution
5. Validate all required fields are populated

Use Flow Builder's Debug feature to trace execution.`;
    }

    return `💡 General Salesforce Help:

Based on your question, here are some suggestions:

1. Check Salesforce Help & Training for documentation
2. Review Setup Audit Trail for recent changes
3. Use Developer Console for debugging
4. Check System Overview for any issues
5. Consider reaching out to your Salesforce admin

Need more specific help? Try describing your exact issue or what you're trying to accomplish.`;
  }

  showResponse(text) {
    this.responseArea.textContent = text;
    this.responseArea.scrollTop = 0;
  }

  setLoading(isLoading) {
    if (isLoading) {
      this.analyzeBtn.disabled = true;
      this.analyzeBtn.textContent = 'Analyzing...';
      this.responseArea.innerHTML = '<div class="loading">🤔 Analyzing your Salesforce context...</div>';
    } else {
      this.analyzeBtn.disabled = false;
      this.analyzeBtn.textContent = 'Analyze & Suggest';
    }
  }

  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get([
        'aiApiKey',
        'aiProvider',
        'aiModel',
        'siteUrl',
        'siteName',
        'azureEndpoint',
        'azureDeployment'
      ], (result) => {
        resolve(result);
      });
    });
  }

  loadSettings() {
    // Load any saved settings or preferences
    chrome.storage.sync.get(['lastPrompt'], (result) => {
      if (result.lastPrompt) {
        this.promptInput.placeholder = `Last: ${result.lastPrompt.substring(0, 50)}...`;
      }
    });
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SalesforceAssistantPopup();
});