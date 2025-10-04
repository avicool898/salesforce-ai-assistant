// Popup script for Salesforce AI Assistant
class SalesforceAssistantPopup {
  constructor() {
    this.contextInfo = document.getElementById('contextInfo');
    this.promptInput = document.getElementById('promptInput');
    this.analyzeBtn = document.getElementById('analyzeBtn');
    this.responseArea = document.getElementById('responseArea');
    this.historyBtn = document.getElementById('historyBtn');
    this.closeBtn = document.getElementById('closeBtn');
    this.historyPanel = document.getElementById('historyPanel');
    this.historyList = document.getElementById('historyList');
    this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    this.conversationThread = document.getElementById('conversationThread');
    this.threadMessages = document.getElementById('threadMessages');
    this.newConversationBtn = document.getElementById('newConversationBtn');
    
    this.currentConversation = [];
    this.conversationHistory = [];
    this.isHistoryVisible = false;
    this.currentConversationId = null;

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
    let contextText = `📍 ${context.pageType}${context.currentObject ? ` - ${context.currentObject}` : ''}
🖥️ ${context.userInterface} Experience
${context.errors.length > 0 ? `⚠️ ${context.errors.length} error(s) detected` : '✅ No errors detected'}`;

    // Add enhanced context if available
    if (context.urlMetadata) {
      const meta = context.urlMetadata;
      if (meta.action && meta.action !== 'view') {
        contextText += `\n🎯 Action: ${meta.action.charAt(0).toUpperCase() + meta.action.slice(1)}`;
      }
      if (meta.recordId) {
        contextText += `\n🆔 Record: ${meta.recordId.substring(0, 8)}...`;
      }
      if (meta.app && meta.app !== 'Standard') {
        contextText += `\n📱 App: ${meta.app}`;
      }
    }

    // Add user activity hints
    if (context.userActivity) {
      const activity = context.userActivity;
      if (activity.visibleModals?.length > 0) {
        contextText += `\n💬 ${activity.visibleModals.length} modal(s) open`;
      }
      if (activity.formState?.length > 0) {
        const avgCompletion = activity.formState.reduce((sum, form) => sum + parseFloat(form.completionRate), 0) / activity.formState.length;
        if (avgCompletion > 0) {
          contextText += `\n📝 Form ${avgCompletion.toFixed(0)}% complete`;
        }
      }
    }

    // Add org/user context
    if (context.salesforceMetadata) {
      const meta = context.salesforceMetadata;
      if (meta.orgInfo?.name) {
        contextText += `\n🏢 Org: ${meta.orgInfo.name}`;
      }
      if (meta.permissions?.readOnly) {
        contextText += `\n🔒 Read-only access`;
      }
    }

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

    // History button
    this.historyBtn.addEventListener('click', () => {
      this.toggleHistory();
    });

    // Close button
    this.closeBtn.addEventListener('click', () => {
      window.close();
    });

    // Clear history button
    this.clearHistoryBtn.addEventListener('click', () => {
      this.clearConversationHistory();
    });

    // New conversation button
    this.newConversationBtn.addEventListener('click', () => {
      this.startNewConversation();
    });

    // Prevent popup from closing when clicking inside
    document.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  async analyzeWithAI() {
    const prompt = this.promptInput.value.trim();
    if (!prompt) {
      this.showResponse('Please enter a question or describe what you need help with.');
      return;
    }

    // Add user message to conversation
    this.addMessageToConversation('user', prompt);
    
    // Clear input
    this.promptInput.value = '';

    this.setLoading(true);

    try {
      // Get current tab context
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const contextResponse = await chrome.tabs.sendMessage(tab.id, { action: 'getContext' });

      // Prepare AI prompt with conversation context
      const aiPrompt = this.buildAIPromptWithHistory(prompt, contextResponse);

      // Call AI API
      const aiResponse = await this.callAI(aiPrompt);

      // Add assistant response to conversation
      this.addMessageToConversation('assistant', aiResponse);

      this.showResponse(aiResponse);
    } catch (error) {
      console.error('AI Analysis error:', error);
      const errorMessage = 'Sorry, I encountered an error while analyzing. Please try again.';
      this.addMessageToConversation('assistant', errorMessage);
      this.showResponse(errorMessage);
    } finally {
      this.setLoading(false);
    }
  }

  buildAIPrompt(userPrompt, contextData) {
    const context = contextData?.context || {};
    const content = contextData?.content || {};
    const storage = contextData?.storage || {};
    const enhanced = contextData?.enhanced || false;

    let prompt = `You are Salesforce Advisor, an expert AI assistant. Help the user with their Salesforce question using the rich context provided.

CURRENT CONTEXT:
- Page Type: ${context.pageType || 'Unknown'}
- Object: ${context.currentObject || 'Not detected'}
- Interface: ${context.userInterface || 'Unknown'}
- URL: ${context.url || 'Not available'}
- Errors: ${context.errors?.length || 0} detected`;

    // Add enhanced URL metadata if available
    if (enhanced && context.urlMetadata) {
      const meta = context.urlMetadata;
      prompt += `

ADVANCED URL ANALYSIS:
- Action: ${meta.action || 'view'}
- Record ID: ${meta.recordId || 'None'}
- Object Type: ${meta.objectType || 'Unknown'}
- Mode: ${meta.mode || 'view'}
- App Context: ${meta.app || 'Standard'}
- Is Setup: ${meta.isSetup ? 'Yes' : 'No'}`;
    }

    // Add user activity context
    if (enhanced && context.userActivity) {
      const activity = context.userActivity;
      prompt += `

USER ACTIVITY:
- Focused Element: ${activity.focusedElement?.tagName || 'None'}
- Open Modals: ${activity.visibleModals?.length || 0}
- Form Completion: ${activity.formState?.map(f => `${f.completionRate}%`).join(', ') || 'N/A'}`;
    }

    // Add Salesforce metadata
    if (enhanced && context.salesforceMetadata) {
      const meta = context.salesforceMetadata;
      if (meta.orgInfo?.name) {
        prompt += `\n- Organization: ${meta.orgInfo.name}`;
      }
      if (meta.userInfo?.name) {
        prompt += `\n- User: ${meta.userInfo.name}`;
      }
      if (meta.permissions) {
        prompt += `\n- Permissions: ${meta.permissions.hasEditAccess ? 'Edit' : 'Read-only'}`;
      }
    }

    // Add recent activity
    if (enhanced && context.recentActivity?.length > 0) {
      prompt += `

RECENT ACTIVITY:
${context.recentActivity.slice(0, 5).map(item => `- ${item.type}: ${JSON.stringify(item.data).substring(0, 100)}`).join('\n')}`;
    }

    // Add detected errors
    if (context.errors?.length > 0) {
      prompt += `

DETECTED ERRORS:
${context.errors.map(err => `- ${err.type}: ${err.message}`).join('\n')}`;
    }

    // Add form and field context
    if (content.fields?.length > 0) {
      prompt += `

VISIBLE FIELDS:
${content.fields.map(field => `- ${field.label} (${field.type}${field.required ? ', required' : ''})`).join('\n')}`;
    }

    if (content.buttons?.length > 0) {
      prompt += `

AVAILABLE ACTIONS:
${content.buttons.map(btn => `- ${btn.text}`).join('\n')}`;
    }

    // Add storage insights
    if (enhanced && storage.recentItems?.length > 0) {
      prompt += `

RECENT ITEMS (from browser storage):
${storage.recentItems.slice(0, 3).map(item => `- ${JSON.stringify(item).substring(0, 80)}`).join('\n')}`;
    }

    prompt += `

USER QUESTION: ${userPrompt}

Please provide a helpful, specific response that:
1. Addresses their question directly using the rich context provided
2. Takes into account the current Salesforce context, user activity, and recent history
3. Suggests specific next steps based on their current page and permissions
4. Includes relevant Salesforce documentation links when helpful
5. Considers their recent activity and form state for personalized guidance
6. Keeps the response well-structured and actionable

Response:`;

    return prompt;
  }

  buildAIPromptWithHistory(userPrompt, contextData) {
    const context = contextData?.context || {};
    const content = contextData?.content || {};
    const storage = contextData?.storage || {};
    const enhanced = contextData?.enhanced || false;

    let prompt = `You are Salesforce Advisor, an expert AI assistant. This is a continuing conversation. Use the conversation history to provide contextual responses.

CURRENT CONTEXT:
- Page Type: ${context.pageType || 'Unknown'}
- Object: ${context.currentObject || 'Not detected'}
- Interface: ${context.userInterface || 'Unknown'}
- URL: ${context.url || 'Not available'}
- Errors: ${context.errors?.length || 0} detected`;

    // Add enhanced context if available
    if (enhanced && context.urlMetadata) {
      const meta = context.urlMetadata;
      prompt += `

ADVANCED URL ANALYSIS:
- Action: ${meta.action || 'view'}
- Record ID: ${meta.recordId || 'None'}
- Object Type: ${meta.objectType || 'Unknown'}
- Mode: ${meta.mode || 'view'}
- App Context: ${meta.app || 'Standard'}`;
    }

    // Add conversation history
    if (this.currentConversation.length > 1) {
      prompt += `

CONVERSATION HISTORY:`;
      
      // Include last 6 messages for context (3 exchanges)
      const recentMessages = this.currentConversation.slice(-6);
      recentMessages.forEach(message => {
        const role = message.role === 'user' ? 'User' : 'Assistant';
        const content = message.content.substring(0, 300); // Limit length
        prompt += `\n${role}: ${content}`;
      });
    }

    // Add current context
    if (context.errors?.length > 0) {
      prompt += `

CURRENT ERRORS:
${context.errors.map(err => `- ${err.type}: ${err.message}`).join('\n')}`;
    }

    if (content.fields?.length > 0) {
      prompt += `

VISIBLE FIELDS:
${content.fields.slice(0, 10).map(field => `- ${field.label} (${field.type}${field.required ? ', required' : ''})`).join('\n')}`;
    }

    prompt += `

CURRENT USER MESSAGE: ${userPrompt}

Please provide a helpful response that:
1. Considers the conversation history and context
2. Addresses the current question directly
3. References previous discussion when relevant
4. Provides specific Salesforce guidance
5. Maintains conversation continuity

Response:`;

    return prompt;
  }

  async makeOpenRouterRequest(settings, prompt, headers, modelOverride = null) {
    const fallbackModels = [
      settings.aiModel || 'deepseek/deepseek-chat-v3.1:free',
      'deepseek/deepseek-chat-v3.1:free',
      'nvidia/nemotron-nano-9b-v2:free',
      'alibaba/tongyi-deepresearch-30b-a3b:free',
      'meta-llama/llama-3.1-8b-instruct:free',
      'microsoft/phi-3-mini-128k-instruct:free',
      'google/gemma-2-9b-it:free',
      'qwen/qwen-2-7b-instruct:free'
    ];

    const modelToUse = modelOverride || fallbackModels[0];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          {
            role: 'system',
            content: `You are Salesforce Advisor, a professional Salesforce expert assistant and copilot. Provide helpful, specific, and actionable advice with the expertise of a seasoned Salesforce architect.

FORMATTING GUIDELINES:
- Use proper headers (### for main sections, ## for subsections)
- Use **bold** for important terms, field names, and key actions
- Use numbered lists (1. 2. 3.) for step-by-step instructions
- Use bullet points (-) for feature lists or options
- Include relevant Salesforce documentation links in [text](url) format
- Use \`backticks\` for field names, API names, and code snippets
- Keep responses well-structured and professional
- Use clear, actionable language
- Reference Salesforce best practices and Trailhead resources when relevant`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      
      // If model not found, try fallback models
      if (error.error?.message?.includes('No endpoints found') || 
          error.error?.message?.includes('not found') ||
          response.status === 404) {
        
        const currentModelIndex = fallbackModels.indexOf(modelToUse);
        if (currentModelIndex < fallbackModels.length - 1) {
          console.warn(`Model ${modelToUse} failed, trying fallback...`);
          return this.makeOpenRouterRequest(settings, prompt, headers, fallbackModels[currentModelIndex + 1]);
        }
      }
      
      throw new Error(error.error?.message || `OpenRouter API Error: ${response.status}`);
    }

    return response;
  }

  async callAI(prompt) {
    const settings = await this.getSettings();

    if (!settings.aiApiKey) {
      return `🔧 AI Integration Setup Required

To use AI analysis, you need to configure an API key:

1. Right-click the extension icon → Options
2. Add your OpenRouter API key
3. Select from premium free models (DeepSeek, NVIDIA, Alibaba, etc.)

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

        const response = await this.makeOpenRouterRequest(settings, prompt, headers);

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
                content: `You are a Salesforce expert assistant. Provide helpful, specific, and actionable advice.

FORMATTING GUIDELINES:
- Use proper headers (### for main sections, ## for subsections)
- Use **bold** for important terms, field names, and key actions
- Use numbered lists (1. 2. 3.) for step-by-step instructions
- Use bullet points (-) for feature lists or options
- Include relevant Salesforce documentation links in [text](url) format
- Use \`backticks\` for field names, API names, and code snippets
- Keep responses well-structured and professional
- Use clear, actionable language`
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 1000,
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
    // Format the response with proper HTML styling
    const formattedHtml = this.formatResponse(text);
    
    // If we have a conversation thread, update it; otherwise use response area
    if (this.currentConversation.length > 1) {
      this.renderConversationThread();
    } else {
      this.responseArea.innerHTML = formattedHtml;
      this.responseArea.scrollTop = 0;
    }
  }

  formatResponse(text) {
    // Convert markdown-style formatting to HTML
    let formatted = text
      // Convert headers (### to h3, ## to h2, # to h1)
      .replace(/^### (.*$)/gm, '<h3 class="response-h3">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="response-h2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="response-h1">$1</h1>')
      
      // Convert bold text (**text** to <strong>)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // Convert numbered lists (1. 2. 3.)
      .replace(/^(\d+)\.\s+(.*)$/gm, '<li class="numbered-item"><strong>$1.</strong> $2</li>')
      
      // Convert bullet points (- or *)
      .replace(/^[-*]\s+(.*)$/gm, '<li class="bullet-item">$1</li>')
      
      // Convert sub-bullet points (  - or  *)
      .replace(/^  [-*]\s+(.*)$/gm, '<li class="sub-bullet-item">$1</li>')
      
      // Convert links [text](url) to proper HTML links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="response-link">$1 ↗</a>')
      
      // Convert code blocks (```code```)
      .replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>')
      
      // Convert inline code (`code`)
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      
      // Convert line breaks to proper paragraphs
      .replace(/\n\n/g, '</p><p class="response-paragraph">')
      .replace(/\n/g, '<br>');

    // Wrap numbered lists in <ol>
    formatted = formatted.replace(/((?:<li class="numbered-item">.*?<\/li>\s*)+)/gs, '<ol class="numbered-list">$1</ol>');
    
    // Wrap bullet lists in <ul>
    formatted = formatted.replace(/((?:<li class="bullet-item">.*?<\/li>\s*)+)/gs, '<ul class="bullet-list">$1</ul>');
    
    // Wrap sub-bullet lists in <ul>
    formatted = formatted.replace(/((?:<li class="sub-bullet-item">.*?<\/li>\s*)+)/gs, '<ul class="sub-bullet-list">$1</ul>');

    // Wrap everything in a paragraph if it doesn't start with a header or list
    if (!formatted.startsWith('<h') && !formatted.startsWith('<ol') && !formatted.startsWith('<ul')) {
      formatted = '<p class="response-paragraph">' + formatted + '</p>';
    }

    return formatted;
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
    
    // Load conversation history
    this.loadConversationHistory();
  }

  async loadConversationHistory() {
    try {
      const result = await chrome.storage.local.get(['conversationHistory', 'currentConversation']);
      this.conversationHistory = result.conversationHistory || [];
      this.currentConversation = result.currentConversation || [];
      
      if (this.currentConversation.length > 0) {
        this.showConversationThread();
        this.renderConversationThread();
      }
      
      this.renderHistoryList();
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  }

  async saveConversationHistory() {
    try {
      await chrome.storage.local.set({
        conversationHistory: this.conversationHistory,
        currentConversation: this.currentConversation
      });
    } catch (error) {
      console.error('Failed to save conversation history:', error);
    }
  }

  toggleHistory() {
    this.isHistoryVisible = !this.isHistoryVisible;
    this.historyPanel.style.display = this.isHistoryVisible ? 'block' : 'none';
    
    if (this.isHistoryVisible) {
      this.renderHistoryList();
    }
  }

  renderHistoryList() {
    if (this.conversationHistory.length === 0) {
      this.historyList.innerHTML = '<div class="history-empty">No conversation history yet. Start asking questions!</div>';
      return;
    }

    const historyHTML = this.conversationHistory.map((conversation, index) => {
      const firstMessage = conversation.messages[0];
      const preview = firstMessage.content.substring(0, 60) + (firstMessage.content.length > 60 ? '...' : '');
      const time = new Date(conversation.timestamp).toLocaleString();
      
      return `
        <div class="history-item" data-conversation-id="${conversation.id}">
          <div class="history-item-preview">${preview}</div>
          <div class="history-item-time">${time} • ${conversation.messages.length} messages</div>
        </div>
      `;
    }).join('');

    this.historyList.innerHTML = historyHTML;

    // Add click listeners to history items
    this.historyList.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const conversationId = item.dataset.conversationId;
        this.loadConversation(conversationId);
      });
    });
  }

  loadConversation(conversationId) {
    const conversation = this.conversationHistory.find(c => c.id === conversationId);
    if (conversation) {
      this.currentConversation = [...conversation.messages];
      this.currentConversationId = conversationId;
      this.showConversationThread();
      this.renderConversationThread();
      this.historyPanel.style.display = 'none';
      this.isHistoryVisible = false;
    }
  }

  showConversationThread() {
    this.conversationThread.style.display = 'block';
    this.responseArea.style.display = 'none';
  }

  hideConversationThread() {
    this.conversationThread.style.display = 'none';
    this.responseArea.style.display = 'block';
  }

  renderConversationThread() {
    if (this.currentConversation.length === 0) {
      this.threadMessages.innerHTML = '<div class="history-empty">Start a new conversation!</div>';
      return;
    }

    const messagesHTML = this.currentConversation.map(message => {
      const time = new Date(message.timestamp).toLocaleString();
      const isUser = message.role === 'user';
      
      return `
        <div class="message ${isUser ? 'user' : 'assistant'}">
          <div class="message-header">${isUser ? '👤 You' : '🤖 Salesforce Advisor'}</div>
          <div class="message-content">${isUser ? message.content : this.formatResponse(message.content)}</div>
          <div class="message-time">${time}</div>
        </div>
      `;
    }).join('');

    this.threadMessages.innerHTML = messagesHTML;
    this.threadMessages.scrollTop = this.threadMessages.scrollHeight;
  }

  startNewConversation() {
    this.currentConversation = [];
    this.currentConversationId = null;
    this.hideConversationThread();
    this.responseArea.innerHTML = 'Ready to help! Ask me about the current Salesforce page or describe what you're working on.';
    this.promptInput.focus();
    this.saveConversationHistory();
  }

  clearConversationHistory() {
    if (confirm('Are you sure you want to clear all conversation history? This cannot be undone.')) {
      this.conversationHistory = [];
      this.currentConversation = [];
      this.currentConversationId = null;
      this.saveConversationHistory();
      this.renderHistoryList();
      this.hideConversationThread();
      this.responseArea.innerHTML = 'Conversation history cleared. Ready to start fresh!';
    }
  }

  addMessageToConversation(role, content) {
    const message = {
      role: role,
      content: content,
      timestamp: Date.now()
    };
    
    this.currentConversation.push(message);
    
    // If this is a new conversation (first user message), create a new conversation entry
    if (this.currentConversation.length === 1 && role === 'user') {
      this.currentConversationId = 'conv_' + Date.now();
    }
    
    // Save conversation to history when it has both user and assistant messages
    if (this.currentConversation.length >= 2 && role === 'assistant') {
      this.saveConversationToHistory();
    }
    
    this.saveConversationHistory();
    
    if (this.currentConversation.length > 1) {
      this.showConversationThread();
      this.renderConversationThread();
    }
  }

  saveConversationToHistory() {
    if (!this.currentConversationId) return;
    
    // Update existing conversation or add new one
    const existingIndex = this.conversationHistory.findIndex(c => c.id === this.currentConversationId);
    const conversationData = {
      id: this.currentConversationId,
      messages: [...this.currentConversation],
      timestamp: this.currentConversation[0].timestamp
    };
    
    if (existingIndex >= 0) {
      this.conversationHistory[existingIndex] = conversationData;
    } else {
      this.conversationHistory.unshift(conversationData);
    }
    
    // Keep only last 50 conversations
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(0, 50);
    }
  }

  // Test function to preview formatting (for development)
  testFormatting() {
    const sampleResponse = `### Building a Record-Triggered Flow to Update Lead Rating

You're in **Salesforce Flow Builder** (Lightning Experience), which is perfect for creating this automation. Since no object is detected yet, we'll start by configuring a new record-triggered flow on the \`Lead\` object.

#### Step-by-Step Instructions

1. **Configure the Flow Trigger (Start Element)**:
   - In the visible fields, select the **radio button for "A record is created"** under the trigger options
   - For the \`Object\` field: Enter or select **Lead**
   - Check the **Fast Field Updates** radio button to enable before-save processing

2. **Add an Update Records Element**:
   - From Available Actions, click **Add element**
   - Search for and select **Update Records**
   - Map the \`Rating\` field to the value **"Warm"**

3. **Save and Test the Flow**:
   - Click **Save** and name it "Update New Lead Rating to Warm"
   - Use **Debug** to test with a sample Lead
   - Click **Activate** to enable it

#### Key Benefits
- Runs synchronously before the Lead saves
- No Apex code required
- High performance with Fast Field Updates

#### Relevant Documentation
- [Record-Triggered Flows Overview](https://help.salesforce.com/s/articleView?id=sf.flow_ref_elements_triggers_record.htm&type=5)
- [Update Records Element](https://help.salesforce.com/s/articleView?id=sf.flow_ref_elements_data_update.htm&type=5)
- [Lead Object Reference](https://help.salesforce.com/s/articleView?id=sf.leads_fields.htm&type=5)`;

    this.showResponse(sampleResponse);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SalesforceAssistantPopup();
});