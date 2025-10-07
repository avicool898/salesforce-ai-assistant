// Overlay interface for Salesforce AI Assistant (Copilot-style)
class SalesforceAssistantOverlay {
  constructor() {
    this.isVisible = false;
    this.overlay = null;
    this.currentConversation = [];
    this.enhancedContext = null;
    this.isLoading = false;
    
    // Initialize privacy filter
    this.privacyFilter = new PrivacyFilter();
    this.privacySettings = {
      removePII: true,
      removeSalesforceIds: true,
      removeSensitiveFields: true,
      showPrivacyReport: false
    };

    this.createOverlay();
    this.setupMessageListener();
  }

  createOverlay() {
    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.id = 'salesforce-ai-overlay';
    this.overlay.innerHTML = `
      <div class="sf-overlay-backdrop" id="sfOverlayBackdrop"></div>
      <div class="sf-overlay-container" id="sfOverlayContainer">
        <!-- Header -->
        <div class="sf-overlay-header">
          <div class="sf-header-left">
            <div class="sf-logo">SA</div>
            <div class="sf-title-container">
              <h2 class="sf-title">Salesforce AI Assistant</h2>
              <p class="sf-subtitle">Your Intelligent Copilot</p>
            </div>
          </div>
          <div class="sf-header-right">
            <button class="sf-header-btn" id="sfMinimizeBtn" title="Minimize">−</button>
            <button class="sf-header-btn" id="sfCloseBtn" title="Close">×</button>
          </div>
        </div>

        <!-- Main Content -->
        <div class="sf-overlay-content">
          <!-- Context Panel -->
          <div class="sf-context-panel">
            <div class="sf-context-header">
              <h3>🧠 Page Context</h3>
              <button class="sf-refresh-btn" id="sfRefreshContext" title="Refresh">🔄</button>
            </div>
            <div class="sf-context-content" id="sfContextContent">
              <div class="sf-context-loading">
                <div class="sf-spinner"></div>
                <span>Analyzing page...</span>
              </div>
            </div>
          </div>

          <!-- Chat Panel -->
          <div class="sf-chat-panel">
            <div class="sf-chat-header">
              <h3>💬 Conversation</h3>
              <div class="sf-chat-controls">
                <button class="sf-control-btn" id="sfNewChatBtn">✨ New</button>
                <button class="sf-control-btn" id="sfExportBtn">📤 Export</button>
              </div>
            </div>

            <div class="sf-messages-container" id="sfMessagesContainer">
              <div class="sf-welcome-message">
                <div class="sf-welcome-icon">👋</div>
                <h3>Welcome to Salesforce AI Assistant</h3>
                <p>I can help you understand this page, complete forms, troubleshoot issues, and provide Salesforce best practices.</p>
                <p>Ask me anything or use the quick actions below!</p>
              </div>
            </div>

            <div class="sf-input-section">
              <div class="sf-quick-actions" id="sfQuickActions">
                <button class="sf-quick-action" data-prompt="Explain what I can do on this page">📖 Explain Page</button>
                <button class="sf-quick-action" data-prompt="Help me complete this form correctly">📝 Form Help</button>
                <button class="sf-quick-action" data-prompt="What are the best practices here?">💡 Best Practices</button>
                <button class="sf-quick-action" data-prompt="What should I do next?">🎯 Next Steps</button>
              </div>

              <div class="sf-input-area">
                <div class="sf-input-wrapper">
                  <textarea 
                    id="sfPromptInput" 
                    placeholder="Ask me anything about this Salesforce page..."
                    rows="1"
                  ></textarea>
                </div>
                <button id="sfSendBtn" class="sf-send-btn">
                  <span class="sf-send-text">Send</span>
                  <div class="sf-send-spinner" style="display: none;">
                    <div class="sf-spinner"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add styles
    this.addStyles();
    
    // Append to body but keep hidden initially
    document.body.appendChild(this.overlay);
    this.overlay.style.display = 'none';

    // Setup event listeners
    this.setupEventListeners();
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #salesforce-ai-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .sf-overlay-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
      }

      .sf-overlay-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 1200px;
        height: 80%;
        max-height: 800px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: sfSlideIn 0.3s ease-out;
      }

      @keyframes sfSlideIn {
        from {
          opacity: 0;
          transform: translate(-50%, -60%);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%);
        }
      }

      .sf-overlay-header {
        background: linear-gradient(135deg, #0176d3 0%, #0099e0 100%);
        color: white;
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      }

      .sf-header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .sf-logo {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
      }

      .sf-title {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }

      .sf-subtitle {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
      }

      .sf-header-right {
        display: flex;
        gap: 0.5rem;
      }

      .sf-header-btn {
        width: 32px;
        height: 32px;
        border: none;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        transition: background-color 0.2s;
      }

      .sf-header-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .sf-overlay-content {
        flex: 1;
        display: flex;
        overflow: hidden;
      }

      .sf-context-panel {
        width: 300px;
        background: #f8f9fa;
        border-right: 1px solid #e9ecef;
        display: flex;
        flex-direction: column;
      }

      .sf-context-header {
        padding: 1rem;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .sf-context-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      .sf-refresh-btn {
        background: none;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }

      .sf-refresh-btn:hover {
        background: #e9ecef;
        border-color: #0176d3;
      }

      .sf-context-content {
        flex: 1;
        padding: 1rem;
        overflow-y: auto;
        font-size: 13px;
        line-height: 1.5;
      }

      .sf-context-loading {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #666;
        justify-content: center;
        padding: 2rem;
      }

      .sf-chat-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .sf-chat-header {
        padding: 1rem;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .sf-chat-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      .sf-chat-controls {
        display: flex;
        gap: 0.5rem;
      }

      .sf-control-btn {
        background: none;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
      }

      .sf-control-btn:hover {
        background: #f8f9fa;
        border-color: #0176d3;
        color: #0176d3;
      }

      .sf-messages-container {
        flex: 1;
        padding: 1rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .sf-welcome-message {
        text-align: center;
        padding: 2rem;
        color: #666;
      }

      .sf-welcome-icon {
        font-size: 48px;
        margin-bottom: 1rem;
      }

      .sf-welcome-message h3 {
        font-size: 20px;
        margin-bottom: 1rem;
        color: #333;
      }

      .sf-welcome-message p {
        margin-bottom: 1rem;
        line-height: 1.6;
      }

      .sf-message {
        display: flex;
        gap: 0.75rem;
        max-width: 80%;
      }

      .sf-message.user {
        align-self: flex-end;
        flex-direction: row-reverse;
      }

      .sf-message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
      }

      .sf-message.user .sf-message-avatar {
        background: #0176d3;
        color: white;
      }

      .sf-message.assistant .sf-message-avatar {
        background: #f0f0f0;
        color: #666;
      }

      .sf-message-content {
        background: #f8f9fa;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        line-height: 1.5;
        font-size: 14px;
      }

      .sf-message.user .sf-message-content {
        background: #0176d3;
        color: white;
      }

      .sf-input-section {
        padding: 1rem;
        border-top: 1px solid #e9ecef;
        background: white;
      }

      .sf-quick-actions {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
      }

      .sf-quick-action {
        background: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 20px;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .sf-quick-action:hover {
        background: #e3f2fd;
        border-color: #0176d3;
        color: #0176d3;
      }

      .sf-input-area {
        display: flex;
        gap: 0.75rem;
        align-items: flex-end;
      }

      .sf-input-wrapper {
        flex: 1;
      }

      #sfPromptInput {
        width: 100%;
        min-height: 44px;
        max-height: 120px;
        padding: 0.75rem;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        resize: none;
        transition: border-color 0.2s;
      }

      #sfPromptInput:focus {
        outline: none;
        border-color: #0176d3;
      }

      .sf-send-btn {
        background: #0176d3;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.75rem 1.5rem;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s;
        min-width: 80px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .sf-send-btn:hover {
        background: #0056b3;
      }

      .sf-send-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      .sf-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #0176d3;
        border-radius: 50%;
        animation: sfSpin 1s linear infinite;
      }

      @keyframes sfSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .sf-overlay-container {
          width: 95%;
          height: 90%;
        }

        .sf-overlay-content {
          flex-direction: column;
        }

        .sf-context-panel {
          width: 100%;
          max-height: 200px;
        }

        .sf-quick-actions {
          flex-direction: column;
        }

        .sf-quick-action {
          text-align: center;
        }
      }

      /* Message formatting */
      .sf-message-content h1, .sf-message-content h2, .sf-message-content h3 {
        margin: 0.5rem 0;
        color: inherit;
      }

      .sf-message-content ul, .sf-message-content ol {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
      }

      .sf-message-content li {
        margin: 0.25rem 0;
      }

      .sf-message-content code {
        background: rgba(0, 0, 0, 0.1);
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
      }

      .sf-message-content strong {
        font-weight: 600;
      }
    `;

    document.head.appendChild(style);
  }

  setupEventListeners() {
    // Close overlay when clicking backdrop
    document.getElementById('sfOverlayBackdrop').addEventListener('click', () => {
      this.hide();
    });

    // Header controls
    document.getElementById('sfCloseBtn').addEventListener('click', () => {
      this.hide();
    });

    document.getElementById('sfMinimizeBtn').addEventListener('click', () => {
      this.minimize();
    });

    // Context refresh
    document.getElementById('sfRefreshContext').addEventListener('click', () => {
      this.refreshContext();
    });

    // Chat controls
    document.getElementById('sfNewChatBtn').addEventListener('click', () => {
      this.startNewConversation();
    });

    document.getElementById('sfExportBtn').addEventListener('click', () => {
      this.exportConversation();
    });

    // Quick actions
    document.getElementById('sfQuickActions').addEventListener('click', (e) => {
      if (e.target.classList.contains('sf-quick-action')) {
        const prompt = e.target.dataset.prompt;
        document.getElementById('sfPromptInput').value = prompt;
        document.getElementById('sfPromptInput').focus();
        this.autoResize();
      }
    });

    // Send button
    document.getElementById('sfSendBtn').addEventListener('click', () => {
      this.sendMessage();
    });

    // Input handling
    const input = document.getElementById('sfPromptInput');
    input.addEventListener('input', () => {
      this.autoResize();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  setupMessageListener() {
    // Listen for messages from popup/background to show overlay
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'showOverlay') {
        this.show();
        sendResponse({ success: true });
      } else if (request.action === 'hideOverlay') {
        this.hide();
        sendResponse({ success: true });
      }
    });
  }

  show() {
    this.isVisible = true;
    this.overlay.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Load context when showing
    this.refreshContext();
    
    // Focus input
    setTimeout(() => {
      document.getElementById('sfPromptInput').focus();
    }, 300);
  }

  hide() {
    this.isVisible = false;
    this.overlay.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
  }

  minimize() {
    // Future enhancement: minimize to corner
    this.hide();
  }

  async refreshContext() {
    const contextContent = document.getElementById('sfContextContent');
    
    try {
      // Get context from the main content analyzer
      if (window.salesforceContextAnalyzer && window.salesforceContextAnalyzer.context) {
        const context = window.salesforceContextAnalyzer.context || {};
        const pageStructure = window.salesforceContextAnalyzer.pageStructure || {};
        const semanticComponents = window.salesforceContextAnalyzer.semanticComponents || {};
        const conversationalContext = window.salesforceContextAnalyzer.conversationalContext || {};

        this.enhancedContext = {
          context,
          pageStructure,
          semanticComponents,
          conversationalContext
        };

        this.displayContext(context, { semanticComponents, conversationalContext });
        this.updateQuickActions();
      } else {
        // Show loading state and try to initialize basic context
        contextContent.innerHTML = `
          <div style="text-align: center; color: #666; padding: 1rem;">
            <div style="font-size: 24px; margin-bottom: 0.5rem;">🔄</div>
            <div>Loading context...</div>
            <div style="font-size: 12px; margin-top: 0.5rem;">Analyzing current page</div>
          </div>
        `;
        
        // Try to create basic context from current page
        setTimeout(() => {
          this.createBasicContext();
        }, 1000);
      }
    } catch (error) {
      console.error('Error refreshing context:', error);
      contextContent.innerHTML = `
        <div style="text-align: center; color: #e74c3c; padding: 1rem;">
          <div style="font-size: 24px; margin-bottom: 0.5rem;">⚠️</div>
          <div>Error loading context</div>
          <div style="font-size: 12px; margin-top: 0.5rem;">Using basic page analysis</div>
        </div>
      `;
      
      // Fallback to basic context
      this.createBasicContext();
    }
  }

  createBasicContext() {
    // Create basic context from current page
    const basicContext = {
      pageType: this.detectBasicPageType(),
      userInterface: window.location.href.includes('/lightning/') ? 'Lightning' : 'Classic',
      errors: document.querySelectorAll('.slds-has-error, .error').length,
      url: window.location.href,
      title: document.title
    };

    this.enhancedContext = {
      context: basicContext,
      pageStructure: {},
      semanticComponents: { pageIntent: 'view' },
      conversationalContext: { userLevel: 'unknown' }
    };

    this.displayContext(basicContext, {
      semanticComponents: this.enhancedContext.semanticComponents,
      conversationalContext: this.enhancedContext.conversationalContext
    });
    this.updateQuickActions();
  }

  detectBasicPageType() {
    const url = window.location.href;
    const title = document.title;

    if (url.includes('/setup/')) return 'Setup Page';
    if (url.includes('/lightning/r/')) return 'Record Detail';
    if (url.includes('/lightning/o/')) return 'Object Home';
    if (url.includes('/new')) return 'New Record';
    if (url.includes('/edit')) return 'Edit Record';
    if (title.includes('Setup')) return 'Setup';
    
    return 'Salesforce Page';
  }

  displayContext(context, enhancedData = {}) {
    const { semanticComponents, conversationalContext } = enhancedData;
    const contextContent = document.getElementById('sfContextContent');
    
    let contextHTML = `
      <div style="margin-bottom: 1rem;">
        <div style="font-weight: 600; color: #0176d3; margin-bottom: 0.5rem;">📍 ${context.pageType || 'Unknown Page'}</div>
        <div style="font-size: 12px; color: #666;">${context.userInterface || 'Unknown'} Experience</div>
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

    // Add conversational context
    if (conversationalContext?.userLevel && conversationalContext.userLevel !== 'unknown') {
      contextHTML += `
        <div style="margin-bottom: 0.5rem;">
          <strong>👤 Level:</strong> ${conversationalContext.userLevel.charAt(0).toUpperCase() + conversationalContext.userLevel.slice(1)}
        </div>
      `;
    }

    contextContent.innerHTML = contextHTML;
  }

  updateQuickActions() {
    if (!this.enhancedContext) return;

    const { semanticComponents, conversationalContext } = this.enhancedContext;
    const actions = this.generateContextualActions(semanticComponents, conversationalContext);
    
    const quickActions = document.getElementById('sfQuickActions');
    const buttons = quickActions.querySelectorAll('.sf-quick-action');
    
    actions.forEach((action, index) => {
      if (buttons[index]) {
        buttons[index].textContent = action.text;
        buttons[index].dataset.prompt = action.prompt;
        buttons[index].title = action.description;
      }
    });
  }

  generateContextualActions(semanticComponents, conversationalContext) {
    const actions = [];
    const pageIntent = semanticComponents?.pageIntent;
    const priorityFocus = conversationalContext?.priorityFocus || [];

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
    } else if (pageIntent === 'configure') {
      actions.push({
        text: "⚙️ Setup Guide",
        prompt: "Explain this setup page and what I can configure here",
        description: "Understand setup options"
      });
    } else {
      actions.push({
        text: "📖 Explain Page",
        prompt: "Explain what I can do on this page",
        description: "Get an overview of page functionality"
      });
    }

    // Fill remaining slots
    while (actions.length < 4) {
      const defaultActions = [
        { text: "💡 Best Practices", prompt: "What are the best practices for this page?", description: "Learn best practices" },
        { text: "🎯 Next Steps", prompt: "What should I do next?", description: "Get next step suggestions" },
        { text: "❓ Ask Question", prompt: "I have a question about this page", description: "Ask any question" }
      ];
      
      const nextAction = defaultActions[actions.length - 1] || defaultActions[0];
      actions.push(nextAction);
    }

    return actions.slice(0, 4);
  }

  autoResize() {
    const input = document.getElementById('sfPromptInput');
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  }

  async sendMessage() {
    const input = document.getElementById('sfPromptInput');
    const prompt = input.value.trim();
    
    if (!prompt || this.isLoading) return;

    // Add user message
    this.addMessage('user', prompt);
    input.value = '';
    this.autoResize();

    this.setLoading(true);

    try {
      // Apply privacy filtering
      const filteredPrompt = this.privacyFilter.filterText(prompt, this.privacySettings);

      // Build AI prompt
      const aiPrompt = this.buildAIPrompt(filteredPrompt);

      // Call AI API
      const response = await this.callAI(aiPrompt);

      // Add assistant response
      this.addMessage('assistant', response);

    } catch (error) {
      console.error('AI Error:', error);
      this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  addMessage(role, content) {
    const message = { role, content, timestamp: Date.now() };
    this.currentConversation.push(message);

    const messagesContainer = document.getElementById('sfMessagesContainer');
    
    // Remove welcome message if it exists
    const welcomeMessage = messagesContainer.querySelector('.sf-welcome-message');
    if (welcomeMessage) {
      welcomeMessage.remove();
    }

    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `sf-message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'sf-message-avatar';
    avatar.textContent = role === 'user' ? '👤' : '🤖';

    const contentEl = document.createElement('div');
    contentEl.className = 'sf-message-content';
    
    if (role === 'assistant') {
      contentEl.innerHTML = this.formatResponse(content);
    } else {
      contentEl.textContent = content;
    }

    messageEl.appendChild(avatar);
    messageEl.appendChild(contentEl);
    messagesContainer.appendChild(messageEl);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  formatResponse(content) {
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
    const sendBtn = document.getElementById('sfSendBtn');
    const sendText = sendBtn.querySelector('.sf-send-text');
    const sendSpinner = sendBtn.querySelector('.sf-send-spinner');
    
    sendBtn.disabled = loading;
    
    if (loading) {
      sendText.style.display = 'none';
      sendSpinner.style.display = 'flex';
    } else {
      sendText.style.display = 'block';
      sendSpinner.style.display = 'none';
    }
  }

  buildAIPrompt(userPrompt) {
    const context = this.enhancedContext?.context || {};
    
    let prompt = `You are Salesforce Advisor, an expert AI assistant. Provide contextual guidance for this Salesforce page.

CURRENT CONTEXT:
- Page Type: ${context.pageType || 'Unknown'}
- Interface: ${context.userInterface || 'Unknown'}
- Errors: ${context.errors?.length || 0} detected`;

    if (this.currentConversation.length > 1) {
      prompt += `\n\nCONVERSATION HISTORY:`;
      const recentMessages = this.currentConversation.slice(-4);
      recentMessages.forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        prompt += `\n${role}: ${msg.content.substring(0, 150)}`;
      });
    }

    prompt += `\n\nUSER MESSAGE: ${userPrompt}

Provide helpful, specific guidance with clear formatting. Use bullet points and step-by-step instructions when appropriate.

Response:`;

    return prompt;
  }

  async callAI(prompt) {
    const settings = await this.getSettings();

    if (!settings.aiApiKey) {
      return `**🔧 AI Setup Required**

To use AI features, please:
1. Click the extension icon
2. Go to Options/Settings  
3. Add your OpenRouter API key

For now, I can provide general Salesforce guidance based on the current page context.`;
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.aiApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Salesforce AI Assistant'
        },
        body: JSON.stringify({
          model: settings.aiModel || 'deepseek/deepseek-chat-v3.1:free',
          messages: [
            {
              role: 'system',
              content: 'You are Salesforce Advisor, a professional Salesforce expert. Provide helpful, actionable advice with clear formatting.'
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
      chrome.storage.sync.get(['aiApiKey', 'aiModel'], (result) => {
        resolve(result);
      });
    });
  }

  startNewConversation() {
    this.currentConversation = [];
    const messagesContainer = document.getElementById('sfMessagesContainer');
    messagesContainer.innerHTML = `
      <div class="sf-welcome-message">
        <div class="sf-welcome-icon">✨</div>
        <h3>New Conversation Started</h3>
        <p>Ready to help! Ask me about the current Salesforce page.</p>
      </div>
    `;
    document.getElementById('sfPromptInput').focus();
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

// Initialize overlay when content script loads
let salesforceOverlay = null;

// Wait for DOM and context analyzer to be ready
function initializeOverlay() {
  if (!salesforceOverlay && document.body) {
    // Wait a bit for the context analyzer to initialize
    setTimeout(() => {
      try {
        salesforceOverlay = new SalesforceAssistantOverlay();
        window.salesforceOverlay = salesforceOverlay; // Make globally accessible
        console.log('Salesforce Overlay initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Salesforce Overlay:', error);
      }
    }, 1000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeOverlay);
} else {
  initializeOverlay();
}