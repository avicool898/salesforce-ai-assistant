// Tab-based Salesforce AI Assistant
class SalesforceAssistantTab {
  constructor() {
    this.contextInfo = document.getElementById('contextInfo');
    this.promptInput = document.getElementById('promptInput');
    this.analyzeBtn = document.getElementById('analyzeBtn');
    this.messagesContainer = document.getElementById('messagesContainer');
    this.quickActions = document.getElementById('quickActions');
    this.newConversationBtn = document.getElementById('newConversationBtn');
    this.refreshContextBtn = document.getElementById('refreshContext');
    this.exportBtn = document.getElementById('exportBtn');
    
    this.currentConversation = [];
    this.enhancedContext = null;
    this.isLoading = false;

    // Initialize privacy filter
    this.privacyFilter = new PrivacyFilter();
    this.privacySettings = {
      removePII: true,
      removeSalesforceIds: true,
      removeSensitiveFields: true,
      showPrivacyReport: false // Disabled in tab mode for cleaner UI
    };

    this.init();
  }

  async init() {
    await this.loadContext();
    this.setupEventListeners();
    this.loadSettings();
    this.setupAutoResize();
  }

  async loadContext() {
    try {
      // Get the active Salesforce tab
      const tabs = await chrome.tabs.query({ 
        active: false, // Don't get current tab since we're in a new tab
        url: ["https://*.salesforce.com/*", "https://*.force.com/*", "https://*.lightning.force.com/*"]
      });

      if (tabs.length === 0) {
        this.contextInfo.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: #666;">
            <div style="font-size: 48px; margin-bottom: 1rem;">🔍</div>
            <div style="font-size: 18px; margin-bottom: 0.5rem;">No Salesforce Tab Found</div>
            <div style="font-size: 14px;">Please open a Salesforce page in another tab to get contextual assistance.</div>
          </div>
        `;
        this.analyzeBtn.disabled = true;
        return;
      }

      // Use the most recent Salesforce tab
      const salesforceTab = tabs[0];
      
      // Get context from the Salesforce tab
      const response = await chrome.tabs.sendMessage(salesforceTab.id, { action: 'getContext' });

      if (response) {
        this.displayContext(response.context, {
          semanticComponents: response.semanticComponents,
          conversationalContext: response.conversationalContext,
          knowledgeContext: response.knowledgeContext
        });
        this.enhancedContext = response;
        this.updateContextualQuickActions();
      }
    } catch (error) {
      console.error('Error loading context:', error);
      this.contextInfo.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #e74c3c;">
          <div style="font-size: 48px; margin-bottom: 1rem;">⚠️</div>
          <div style="font-size: 18px; margin-bottom: 0.5rem;">Context Loading Error</div>
          <div style="font-size: 14px;">Unable to connect to Salesforce page. Please refresh and try again.</div>
        </div>
      `;
    }
  }

  displayContext(context, enhancedData = {}) {
    const { semanticComponents, conversationalContext, knowledgeContext } = enhancedData;
    
    // Create an intelligent context display with advanced understanding
    let contextHTML = `
      <div style="margin-bottom: 1rem;">
        <div style="font-weight: 600; color: #0176d3; margin-bottom: 0.5rem;">📍 ${context.pageType || 'Unknown Page'}</div>
        <div style="font-size: 14px; color: #666;">${context.userInterface || 'Unknown'} Experience</div>
      </div>
    `;

    // Add semantic understanding
    if (semanticComponents?.pageIntent) {
      contextHTML += `
        <div style="margin-bottom: 0.5rem;">
          <strong>🎯 Intent:</strong> ${semanticComponents.pageIntent.charAt(0).toUpperCase() + semanticComponents.pageIntent.slice(1)}
        </div>
      `;
    }

    if (semanticComponents?.userJourney?.stage) {
      const stage = semanticComponents.userJourney.stage;
      const progress = semanticComponents.userJourney.progress || 0;
      contextHTML += `
        <div style="margin-bottom: 0.5rem;">
          <strong>📈 Journey:</strong> ${stage.charAt(0).toUpperCase() + stage.slice(1)}${progress > 0 ? ` (${Math.round(progress)}%)` : ''}
        </div>
      `;
    }

    // Add knowledge context
    if (knowledgeContext?.objectType?.name && knowledgeContext.objectType.name !== 'Unknown') {
      contextHTML += `
        <div style="margin-bottom: 0.5rem;">
          <strong>📚 Object:</strong> ${knowledgeContext.objectType.name} (${knowledgeContext.objectType.type})
        </div>
      `;
    }

    if (knowledgeContext?.setupArea?.name && knowledgeContext.setupArea.name !== 'Unknown') {
      contextHTML += `
        <div style="margin-bottom: 0.5rem;">
          <strong>⚙️ Setup:</strong> ${knowledgeContext.setupArea.name}
        </div>
      `;
    }

    // Add conversational context
    if (conversationalContext?.userLevel && conversationalContext.userLevel !== 'unknown') {
      contextHTML += `
        <div style="margin-bottom: 0.5rem;">
          <strong>👤 Level:</strong> ${conversationalContext.userLevel.charAt(0).toUpperCase() + conversationalContext.userLevel.slice(1)}
        </div>
      `;
    }

    // Add priority focus areas
    if (conversationalContext?.priorityFocus?.length > 0) {
      const topFocus = conversationalContext.priorityFocus[0].replace(/-/g, ' ');
      contextHTML += `
        <div style="margin-bottom: 0.5rem;">
          <strong>🔍 Focus:</strong> ${topFocus.charAt(0).toUpperCase() + topFocus.slice(1)}
        </div>
      `;
    }

    // Add status indicators
    if (context.errors?.length > 0) {
      contextHTML += `
        <div style="margin-bottom: 0.5rem; color: #e74c3c;">
          <strong>⚠️ Errors:</strong> ${context.errors.length} detected
        </div>
      `;
    } else {
      contextHTML += `
        <div style="margin-bottom: 0.5rem; color: #27ae60;">
          <strong>✅ Status:</strong> No errors detected
        </div>
      `;
    }

    // Add URL info
    if (context.url) {
      const url = new URL(context.url);
      contextHTML += `
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 12px; color: #888;">
          <strong>🌐 Domain:</strong> ${url.hostname}
        </div>
      `;
    }

    this.contextInfo.innerHTML = contextHTML;
  }

  setupEventListeners() {
    // Quick action buttons
    this.quickActions.addEventListener('click', (e) => {
      if (e.target.classList.contains('quick-action')) {
        this.promptInput.value = e.target.dataset.prompt;
        this.promptInput.focus();
        this.autoResize();
      }
    });

    // Analyze button
    this.analyzeBtn.addEventListener('click', () => {
      this.analyzeWithAI();
    });

    // Enter key in textarea (Ctrl+Enter to send)
    this.promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.analyzeWithAI();
      }
    });

    // New conversation button
    this.newConversationBtn.addEventListener('click', () => {
      this.startNewConversation();
    });

    // Refresh context button
    this.refreshContextBtn.addEventListener('click', () => {
      this.loadContext();
    });

    // Export conversation button
    this.exportBtn.addEventListener('click', () => {
      this.exportConversation();
    });

    // Tab controls
    document.getElementById('chatTab').addEventListener('click', () => {
      // Already on chat tab
    });

    document.getElementById('historyTab').addEventListener('click', () => {
      this.showHistory();
    });

    document.getElementById('settingsTab').addEventListener('click', () => {
      this.openSettings();
    });
  }

  setupAutoResize() {
    this.promptInput.addEventListener('input', () => {
      this.autoResize();
    });
  }

  autoResize() {
    this.promptInput.style.height = 'auto';
    this.promptInput.style.height = Math.min(this.promptInput.scrollHeight, 150) + 'px';
  }

  async analyzeWithAI() {
    const prompt = this.promptInput.value.trim();
    if (!prompt || this.isLoading) return;

    // Add user message
    this.addMessage('user', prompt);
    this.promptInput.value = '';
    this.autoResize();

    this.setLoading(true);

    try {
      // Get fresh context
      await this.loadContext();

      // Apply privacy filtering to user input
      const filteredPrompt = this.privacyFilter.filterText(prompt, this.privacySettings);

      // Build AI prompt with enhanced context
      const aiPrompt = this.buildAIPromptWithHistory(filteredPrompt, this.enhancedContext);

      // Call AI API
      const aiResponse = await this.callAI(aiPrompt);

      // Add assistant response
      this.addMessage('assistant', aiResponse);

    } catch (error) {
      console.error('AI Analysis error:', error);
      this.addMessage('assistant', 'Sorry, I encountered an error while analyzing. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  addMessage(role, content) {
    const message = {
      role: role,
      content: content,
      timestamp: Date.now()
    };

    this.currentConversation.push(message);

    // Remove welcome message if it exists
    const welcomeMessage = this.messagesContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
      welcomeMessage.remove();
    }

    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? '👤' : '🤖';

    const contentEl = document.createElement('div');
    contentEl.className = 'message-content';
    
    if (role === 'assistant') {
      contentEl.innerHTML = this.formatResponse(content);
    } else {
      contentEl.textContent = content;
    }

    messageEl.appendChild(avatar);
    messageEl.appendChild(contentEl);

    this.messagesContainer.appendChild(messageEl);
    
    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  formatResponse(content) {
    // Enhanced markdown-like formatting for better readability
    return content
      .replace(/### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^\d+\.\s(.*)$/gm, '<li>$1</li>')
      .replace(/^-\s(.*)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n/g, '<br>');
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.analyzeBtn.disabled = loading;
    
    if (loading) {
      this.analyzeBtn.innerHTML = '<div class="spinner"></div>';
    } else {
      this.analyzeBtn.textContent = 'Send';
    }
  }

  startNewConversation() {
    this.currentConversation = [];
    this.messagesContainer.innerHTML = `
      <div class="welcome-message">
        <h3>✨ New Conversation Started</h3>
        <p>Ready to help! Ask me about the current Salesforce page or describe what you're working on.</p>
      </div>
    `;
    this.promptInput.focus();
  }

  updateContextualQuickActions() {
    if (!this.enhancedContext) return;

    const { semanticComponents, conversationalContext, knowledgeContext } = this.enhancedContext;
    const actions = this.generateContextualActions(semanticComponents, conversationalContext, knowledgeContext);
    
    // Update quick action buttons
    const buttons = this.quickActions.querySelectorAll('.quick-action');
    actions.forEach((action, index) => {
      if (buttons[index]) {
        buttons[index].textContent = action.text;
        buttons[index].dataset.prompt = action.prompt;
        buttons[index].title = action.description;
      }
    });
  }

  generateContextualActions(semanticComponents, conversationalContext, knowledgeContext) {
    const actions = [];
    const pageIntent = semanticComponents?.pageIntent;
    const priorityFocus = conversationalContext?.priorityFocus || [];
    const objectType = knowledgeContext?.objectType?.name;

    // Generate actions based on context (same logic as sidepanel)
    if (pageIntent === 'create' || pageIntent === 'edit') {
      if (priorityFocus.includes('error-resolution')) {
        actions.push({
          text: "🚨 Fix Errors",
          prompt: "Help me resolve the validation errors on this form",
          description: "Get help with form validation errors"
        });
      }
      
      actions.push({
        text: "📝 Form Help",
        prompt: "Help me complete this form correctly",
        description: "Step-by-step form completion guidance"
      });

      if (objectType && objectType !== 'Unknown') {
        actions.push({
          text: `💡 ${objectType} Tips`,
          prompt: `What are the best practices for ${objectType} records?`,
          description: `Learn best practices for ${objectType}`
        });
      }
    } else if (pageIntent === 'configure') {
      actions.push({
        text: "⚙️ Setup Guide",
        prompt: "Explain this setup page and what I can configure here",
        description: "Understand setup options"
      });

      actions.push({
        text: "📚 Best Practices",
        prompt: "What are the best practices for this configuration?",
        description: "Learn configuration best practices"
      });
    } else {
      actions.push({
        text: "📖 Explain Page",
        prompt: "Explain what I can do on this page",
        description: "Get an overview of page functionality"
      });

      actions.push({
        text: "🎯 Next Steps",
        prompt: "What should I do next?",
        description: "Get suggestions for next actions"
      });
    }

    // Ensure we have 4 actions
    while (actions.length < 4) {
      actions.push({
        text: "❓ Ask Question",
        prompt: "I have a question about this page",
        description: "Ask any question"
      });
    }

    return actions.slice(0, 4);
  }

  // Copy AI methods from sidepanel.js
  buildAIPromptWithHistory(userPrompt, contextData) {
    // Use the same enhanced prompt building logic from sidepanel
    const context = contextData?.context || {};
    const pageStructure = contextData?.pageStructure || {};
    const semanticComponents = contextData?.semanticComponents || {};
    const conversationalContext = contextData?.conversationalContext || {};
    const knowledgeContext = contextData?.knowledgeContext || {};

    let prompt = `You are Salesforce Advisor, an expert AI assistant with advanced contextual understanding. Provide highly contextual responses in a tab-based interface with more space for detailed explanations.

🧠 ADVANCED PAGE ANALYSIS:
- Page Type: ${context.pageType || 'Unknown'}
- Page Intent: ${semanticComponents.pageIntent || 'Unknown'}
- User Journey Stage: ${semanticComponents.userJourney?.stage || 'Unknown'}
- User Level: ${conversationalContext.userLevel || 'Unknown'}
- Priority Focus: ${conversationalContext.priorityFocus?.join(', ') || 'General assistance'}`;

    if (knowledgeContext.objectType?.name) {
      prompt += `\n- Object Context: ${knowledgeContext.objectType.name} (${knowledgeContext.objectType.type})`;
    }

    if (context.errors?.length > 0) {
      prompt += `\n- Errors Detected: ${context.errors.length}`;
    }

    // Add conversation history
    if (this.currentConversation.length > 1) {
      prompt += `\n\nCONVERSATION HISTORY:`;
      const recentMessages = this.currentConversation.slice(-4); // Last 4 messages
      recentMessages.forEach(message => {
        const role = message.role === 'user' ? 'User' : 'Assistant';
        prompt += `\n${role}: ${message.content.substring(0, 200)}`;
      });
    }

    prompt += `\n\nCURRENT USER MESSAGE: ${userPrompt}

INSTRUCTIONS: Provide detailed, contextual guidance optimized for the tab interface. Use clear formatting with headers, bullet points, and step-by-step instructions when appropriate. Reference specific page elements and provide comprehensive explanations.

Response:`;

    return prompt;
  }

  async callAI(prompt) {
    const settings = await this.getSettings();

    if (!settings.aiApiKey) {
      return `🔧 **AI Integration Setup Required**

To use AI analysis, you need to configure an API key:

1. Click the **Settings** tab above
2. Add your OpenRouter API key  
3. Select from premium free models

For now, here's some general help based on your context.`;
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.aiApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': chrome.runtime.getURL(''),
          'X-Title': 'Salesforce AI Assistant'
        },
        body: JSON.stringify({
          model: settings.aiModel || 'deepseek/deepseek-chat-v3.1:free',
          messages: [
            {
              role: 'system',
              content: 'You are Salesforce Advisor, a professional Salesforce expert assistant. Provide helpful, specific, and actionable advice with clear formatting.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error('AI API Error:', error);
      return 'Sorry, I encountered an error while processing your request. Please try again.';
    }
  }

  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get([
        'aiApiKey',
        'aiModel',
        'aiProvider'
      ], (result) => {
        resolve(result);
      });
    });
  }

  loadSettings() {
    // Load any saved settings
  }

  showHistory() {
    alert('History feature coming soon!');
  }

  openSettings() {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/options.html') });
  }

  exportConversation() {
    if (this.currentConversation.length === 0) {
      alert('No conversation to export');
      return;
    }

    const exportData = {
      timestamp: new Date().toISOString(),
      conversation: this.currentConversation,
      context: this.enhancedContext?.context
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `salesforce-conversation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SalesforceAssistantTab();
});