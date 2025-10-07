// Side Panel script for Salesforce AI Assistant
class SalesforceAssistantSidePanel {
  constructor() {
    this.contextInfo = document.getElementById('contextInfo');
    this.promptInput = document.getElementById('promptInput');
    this.analyzeBtn = document.getElementById('analyzeBtn');
    this.responseArea = document.getElementById('responseArea');
    this.historyBtn = document.getElementById('historyBtn');
    this.minimizeBtn = document.getElementById('minimizeBtn');
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
    
    // Initialize privacy filter
    this.privacyFilter = new PrivacyFilter();
    this.privacySettings = {
      removePII: true,
      removeSalesforceIds: true,
      removeSensitiveFields: true,
      showPrivacyReport: true
    };

    this.init();
  }

  async init() {
    await this.loadContext();
    this.setupEventListeners();
    this.loadSettings();
    this.initializeDeveloperMode();
    this.setupPageChangeListener();
  }

  setupPageChangeListener() {
    // Listen for page change notifications from content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'pageChanged') {
        console.log('Sidepanel: Page change detected, updating context');
        this.handlePageChange(request.context, request.url);
        sendResponse({ received: true });
      }
    });
  }

  async handlePageChange(newContext, newUrl) {
    // Update context display
    if (newContext) {
      this.displayContext(newContext, {
        semanticComponents: { pageIntent: newContext.pageIntent || 'view' },
        conversationalContext: { userLevel: 'unknown' }
      });
    }

    // Show page change notification
    this.showPageChangeNotification(newUrl);
    
    // Refresh full context after a delay
    setTimeout(() => {
      this.loadContext();
    }, 1000);
  }

  showPageChangeNotification(newUrl) {
    // Create a subtle notification about page change
    const notification = document.createElement('div');
    notification.className = 'page-change-notification';
    notification.innerHTML = `
      <div style="
        background: #e3f2fd;
        border: 1px solid #2196f3;
        border-radius: 4px;
        padding: 8px 12px;
        margin-bottom: 8px;
        font-size: 12px;
        color: #1976d2;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <span>🔄</span>
        <span>Page updated - Context refreshed</span>
      </div>
    `;

    // Insert at the top of main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.insertBefore(notification, mainContent.firstChild);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    }
  }

  initializeDeveloperMode() {
    // Hide context panel by default
    this.contextInfo.style.display = 'none';
    
    // Hide developer mode button by default
    const devBtn = document.getElementById('devBtn');
    devBtn.style.display = 'none';
    
    // Check if creator mode is enabled (secret key combination)
    chrome.storage.local.get(['creatorMode', 'developerMode'], (result) => {
      if (result.creatorMode) {
        devBtn.style.display = 'block';
        
        // Show context panel if developer mode is enabled
        if (result.developerMode) {
          this.contextInfo.style.display = 'block';
          devBtn.classList.add('active');
        }
      }
    });
    
    // Listen for secret key combination (Ctrl+Shift+D) to enable creator mode
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        chrome.storage.local.set({ creatorMode: true });
        devBtn.style.display = 'block';
        console.log('Creator mode enabled - you can now toggle developer mode');
      }
    });
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
        this.displayContext(response.context, {
          semanticComponents: response.semanticComponents,
          conversationalContext: response.conversationalContext,
          knowledgeContext: response.knowledgeContext
        });
        this.pageContent = response.content;
        this.enhancedContext = response; // Store for AI prompts
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

  displayContext(context, enhancedData = {}) {
    const { semanticComponents, conversationalContext, knowledgeContext } = enhancedData;
    
    // Create a focused context display showing actual page content
    let contextText = `📍 ${context.pageType}
📄 ${context.pageHeader || 'Page'}`;

    // Add main content information
    if (semanticComponents?.primaryContent) {
      contextText += `\n🎯 ${semanticComponents.primaryContent}`;
    }

    // Add key content terms if available
    if (context.mainContentSummary?.keyTerms?.length > 0) {
      const keyTerms = context.mainContentSummary.keyTerms.slice(0, 2).join(', ');
      contextText += `\n📋 ${keyTerms}`;
    }

    // Add available actions
    if (semanticComponents?.availableActions?.length > 0) {
      const actions = semanticComponents.availableActions.slice(0, 2).join(', ');
      contextText += `\n⚡ ${actions}`;
    }

    // Add page intent
    if (semanticComponents?.pageIntent) {
      contextText += `\n🔍 ${semanticComponents.pageIntent.charAt(0).toUpperCase() + semanticComponents.pageIntent.slice(1)}`;
    }

    // Add status indicators
    if (context.errors?.length > 0) {
      contextText += `\n⚠️ ${context.errors.length} error(s)`;
    } else {
      contextText += `\n✅ Ready`;
    }

    // Add interface type
    contextText += `\n🖥️ ${context.userInterface}`;

    this.contextInfo.textContent = contextText;
  }

  setupEventListeners() {
    // Quick action buttons with enhanced contextual suggestions
    document.querySelectorAll('.quick-action').forEach(btn => {
      btn.addEventListener('click', () => {
        this.promptInput.value = btn.dataset.prompt;
        this.promptInput.focus();
      });
    });

    // Update quick actions based on context
    this.updateContextualQuickActions();

    // Refresh context button
    document.getElementById('refreshContextBtn').addEventListener('click', () => {
      this.refreshContext();
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

    // Minimize button
    this.minimizeBtn.addEventListener('click', () => {
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

    // Remove context info toggle - show normally

    // Developer mode toggle
    document.getElementById('devBtn').addEventListener('click', () => {
      this.toggleDeveloperMode();
    });

    // API setup guide button
    document.getElementById('apiBtn').addEventListener('click', () => {
      this.openAPIGuide();
    });
  }

  async analyzeWithAI() {
    const prompt = this.promptInput.value.trim();
    if (!prompt) {
      this.showResponse('Please enter a question or describe what you need help with.');
      return;
    }

    // Privacy check on user input
    const inputValidation = this.privacyFilter.validateContentSafety(prompt);
    if (inputValidation.riskLevel === 'HIGH_RISK') {
      this.showPrivacyWarning(inputValidation, 'user input');
      return;
    }

    // Filter user input before storing
    const filteredPrompt = this.privacyFilter.filterText(prompt, this.privacySettings);
    
    // Add filtered user message to conversation
    this.addMessageToConversation('user', filteredPrompt);
    
    // Clear input
    this.promptInput.value = '';

    this.setLoading(true);

    try {
      // Always get fresh context before AI analysis
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Force content script to refresh context
      await chrome.tabs.sendMessage(tab.id, { action: 'refreshContext' });
      
      // Get updated context
      const contextResponse = await chrome.tabs.sendMessage(tab.id, { action: 'getContext' });

      // Apply privacy filtering to context data
      const filteredContext = this.filterContextData(contextResponse);

      // Store enhanced context for future use
      this.enhancedContext = filteredContext;

      // Prepare AI prompt with enhanced contextual understanding
      const aiPrompt = this.buildAIPromptWithHistory(filteredPrompt, filteredContext);

      // Final privacy check on complete prompt
      const promptValidation = this.privacyFilter.validateContentSafety(aiPrompt);
      if (promptValidation.riskLevel === 'HIGH_RISK') {
        this.showPrivacyWarning(promptValidation, 'context data');
        return;
      }

      // Call AI API with filtered data (with retry for timeouts)
      const aiResponse = await this.callAIWithRetry(aiPrompt);

      // Add assistant response to conversation
      this.addMessageToConversation('assistant', aiResponse);

      this.showResponse(aiResponse);

      // Show privacy report if enabled
      if (this.privacySettings.showPrivacyReport && (inputValidation.issues.length > 0 || promptValidation.issues.length > 0)) {
        this.showPrivacyReport(prompt, filteredPrompt, aiPrompt);
      }

    } catch (error) {
      console.error('AI Analysis error:', error);
      const errorMessage = 'Sorry, I encountered an error while analyzing. Please try again.';
      this.addMessageToConversation('assistant', errorMessage);
      this.showResponse(errorMessage);
    } finally {
      this.setLoading(false);
    }
  }

  // Copy all the conversation history methods from popup.js
  async loadConversationHistory() {
    try {
      const result = await chrome.storage.local.get([
        'conversationHistory', 
        'currentConversation', 
        'lastSessionTime'
      ]);
      
      this.conversationHistory = result.conversationHistory || [];
      this.currentConversation = result.currentConversation || [];
      
      // Check if this is a new session (more than 30 minutes since last activity)
      const lastSessionTime = result.lastSessionTime || 0;
      const currentTime = Date.now();
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes
      const isNewSession = (currentTime - lastSessionTime) > sessionTimeout;
      
      // If it's a new session, start fresh but show history if available
      if (isNewSession) {
        this.startFreshSession();
      } else if (this.currentConversation.length > 0) {
        // Continue existing session only if recent
        this.showConversationThread();
        this.renderConversationThread();
      }
      
      // Always render history list for easy access
      this.renderHistoryList();
      
      // Update last session time
      this.updateSessionTime();
      
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  }

  startFreshSession() {
    // Clear current conversation but keep history
    this.currentConversation = [];
    this.currentConversationId = null;
    
    // Hide conversation thread and show fresh interface
    this.hideConversationThread();
    
    // Show welcome message
    this.responseArea.innerHTML = `
      <div class="welcome-message">
        <h3>👋 Welcome back!</h3>
        <p>Ready to help with your Salesforce tasks.</p>
        ${this.conversationHistory.length > 0 ? 
          '<div class="welcome-tip"><strong>💡 Tip:</strong> Click the history button 📜 to view previous conversations or start typing below for a new conversation.</div>' : 
          '<div class="welcome-tip">Start by asking a question or describing what you need help with.</div>'
        }
      </div>
    `;
    
    // Show history panel if there are previous conversations
    if (this.conversationHistory.length > 0) {
      this.showHistoryHint();
    }
    
    // Focus on input for immediate use
    setTimeout(() => {
      this.promptInput.focus();
    }, 100);
  }

  showHistoryHint() {
    // Briefly show history panel as a hint, then hide it
    this.historyPanel.style.display = 'block';
    this.historyPanel.classList.add('history-hint');
    this.isHistoryVisible = true;
    
    // Auto-hide after 4 seconds unless user interacts
    setTimeout(() => {
      if (this.isHistoryVisible && !this.historyPanel.matches(':hover')) {
        this.historyPanel.style.display = 'none';
        this.historyPanel.classList.remove('history-hint');
        this.isHistoryVisible = false;
      }
    }, 4000);
  }

  updateSessionTime() {
    chrome.storage.local.set({ lastSessionTime: Date.now() });
  }

  // Removed collapsible context logic - showing normally now

  toggleDeveloperMode() {
    chrome.storage.local.get(['developerMode'], (result) => {
      const newMode = !result.developerMode;
      chrome.storage.local.set({ developerMode: newMode });
      
      const devBtn = document.getElementById('devBtn');
      if (newMode) {
        this.contextInfo.style.display = 'block';
        devBtn.classList.add('active');
        devBtn.title = 'Developer Mode: ON (Click to hide context)';
      } else {
        this.contextInfo.style.display = 'none';
        devBtn.classList.remove('active');
        devBtn.title = 'Developer Mode: OFF (Click to show context)';
      }
    });
  }

  openAPIGuide() {
    // Create and open the API setup guide in a new tab
    const guideUrl = chrome.runtime.getURL('generate-pdf-guide.html');
    chrome.tabs.create({ url: guideUrl });
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
      
      // Update session time when loading a conversation
      this.updateSessionTime();
      
      // Show a subtle indicator that this is a loaded conversation
      const threadHeader = document.querySelector('.thread-header h3');
      if (threadHeader) {
        threadHeader.innerHTML = `📖 Loaded Conversation <small style="font-weight: normal; opacity: 0.7;">(${new Date(conversation.timestamp).toLocaleDateString()})</small>`;
      }
    }
  }

  showConversationThread() {
    this.conversationThread.style.display = 'flex';
    this.responseArea.style.display = 'none';
  }

  hideConversationThread() {
    this.conversationThread.style.display = 'none';
    this.responseArea.style.display = 'block';
  }

  renderConversationThread(scrollToBottom = false) {
    if (this.currentConversation.length === 0) {
      this.threadMessages.innerHTML = '<div class="history-empty">Start a new conversation!</div>';
      return;
    }

    const messagesHTML = this.currentConversation.map((message, index) => {
      const time = new Date(message.timestamp).toLocaleString();
      const isUser = message.role === 'user';
      const content = isUser ? message.content : this.formatResponse(message.content);
      
      return `
        <div class="message ${isUser ? 'user' : 'assistant'}" data-message-index="${index}">
          <div class="message-header">${isUser ? '👤 You' : '🤖 Salesforce Advisor'}</div>
          <div class="message-content">${content}</div>
          <div class="message-time">${time}</div>
        </div>
      `;
    }).join('');

    this.threadMessages.innerHTML = messagesHTML;
    
    // Smart scrolling based on context
    if (scrollToBottom) {
      // Scroll to show the most recent message in a comfortable position
      this.scrollToRecentMessage();
    } else {
      // Scroll to top for loaded conversations (user wants to read from beginning)
      this.threadMessages.scrollTop = 0;
    }
  }

  scrollToRecentMessage() {
    // Wait for DOM to update, then scroll to show the most recent message
    setTimeout(() => {
      const messages = this.threadMessages.querySelectorAll('.message');
      if (messages.length === 0) return;
      
      // Get the most recent message (last one)
      const lastMessage = messages[messages.length - 1];
      
      // Simple approach: scroll to show the recent message at the bottom
      // but ensure it's fully visible with some padding
      const containerHeight = this.threadMessages.clientHeight;
      const messageTop = lastMessage.offsetTop;
      const messageHeight = lastMessage.offsetHeight;
      
      // Position so the message is visible at the bottom with some padding
      const targetScroll = messageTop - containerHeight + messageHeight + 20; // 20px padding
      
      // Ensure we don't scroll past the content or before the start
      const maxScroll = this.threadMessages.scrollHeight - containerHeight;
      const finalScroll = Math.min(Math.max(0, targetScroll), maxScroll);
      
      // Smooth scroll to the position
      try {
        this.threadMessages.scrollTo({
          top: finalScroll,
          behavior: 'smooth'
        });
      } catch (error) {
        // Fallback for browsers that don't support smooth scrolling
        this.threadMessages.scrollTop = finalScroll;
      }
      
      // Briefly highlight the most recent message to draw attention
      lastMessage.style.transition = 'background-color 0.3s ease';
      lastMessage.style.backgroundColor = 'rgba(1, 118, 211, 0.1)';
      
      setTimeout(() => {
        lastMessage.style.backgroundColor = '';
      }, 1500);
      
    }, 100); // Increased timeout to ensure DOM is ready
  }

  startNewConversation() {
    this.currentConversation = [];
    this.currentConversationId = null;
    this.hideConversationThread();
    
    // Show fresh start message
    this.responseArea.innerHTML = `
      <div class="welcome-message">
        <h3>✨ New Conversation</h3>
        <p>Ready to help! Ask me about the current Salesforce page or describe what you're working on.</p>
      </div>
    `;
    
    // Hide history panel
    this.historyPanel.style.display = 'none';
    this.isHistoryVisible = false;
    
    this.promptInput.focus();
    this.saveConversationHistory();
    this.updateSessionTime();
  }

  async refreshContext() {
    // Show loading state
    const contextInfo = document.getElementById('contextInfo');
    const refreshBtn = document.getElementById('refreshContextBtn');
    
    refreshBtn.textContent = '⏳';
    refreshBtn.disabled = true;
    contextInfo.textContent = 'Refreshing context...';

    try {
      // Force reload context
      await this.loadContext();
      
      // Show success feedback
      refreshBtn.textContent = '✅';
      setTimeout(() => {
        refreshBtn.textContent = '🔄';
        refreshBtn.disabled = false;
      }, 1000);
      
    } catch (error) {
      console.error('Failed to refresh context:', error);
      refreshBtn.textContent = '❌';
      setTimeout(() => {
        refreshBtn.textContent = '🔄';
        refreshBtn.disabled = false;
      }, 2000);
    }
  }

  // 🎯 CONTEXTUAL QUICK ACTIONS - Dynamic suggestions based on page understanding
  updateContextualQuickActions() {
    if (!this.enhancedContext) return;

    const { semanticComponents, conversationalContext, knowledgeContext } = this.enhancedContext;
    const quickActionsContainer = document.querySelector('.quick-actions');
    
    if (!quickActionsContainer) return;

    // Generate contextual quick actions based on page analysis
    const contextualActions = this.generateContextualActions(semanticComponents, conversationalContext, knowledgeContext);
    
    // Update existing quick action buttons with contextual suggestions
    const existingButtons = quickActionsContainer.querySelectorAll('.quick-action');
    
    contextualActions.forEach((action, index) => {
      if (existingButtons[index]) {
        existingButtons[index].textContent = action.text;
        existingButtons[index].dataset.prompt = action.prompt;
        existingButtons[index].title = action.description;
      }
    });
  }

  generateContextualActions(semanticComponents, conversationalContext, knowledgeContext) {
    const actions = [];
    const pageIntent = semanticComponents?.pageIntent;
    const userLevel = conversationalContext?.userLevel;
    const objectType = knowledgeContext?.objectType?.name;
    const priorityFocus = conversationalContext?.priorityFocus || [];

    // Generate actions based on page intent and user level
    if (pageIntent === 'create' || pageIntent === 'edit') {
      if (priorityFocus.includes('error-resolution')) {
        actions.push({
          text: "Fix Errors",
          prompt: "Help me resolve the validation errors on this form",
          description: "Get help with form validation errors"
        });
      }
      
      if (priorityFocus.includes('required-field-completion')) {
        actions.push({
          text: "Required Fields",
          prompt: "What are the required fields and how should I fill them?",
          description: "Guidance on completing required fields"
        });
      } else {
        actions.push({
          text: "Form Help",
          prompt: "Help me complete this form correctly",
          description: "Step-by-step form completion guidance"
        });
      }

      if (objectType && objectType !== 'Unknown') {
        actions.push({
          text: `${objectType} Best Practices`,
          prompt: `What are the best practices for creating/editing ${objectType} records?`,
          description: `Learn best practices for ${objectType} management`
        });
      }
    } else if (pageIntent === 'configure') {
      actions.push({
        text: "Setup Guidance",
        prompt: "Explain this setup page and what I can configure here",
        description: "Understand setup options and configurations"
      });

      actions.push({
        text: "Best Practices",
        prompt: "What are the best practices for this configuration?",
        description: "Learn configuration best practices"
      });

      if (userLevel === 'beginner') {
        actions.push({
          text: "Step-by-Step",
          prompt: "Walk me through this setup process step by step",
          description: "Detailed setup instructions for beginners"
        });
      }
    } else if (pageIntent === 'browse' || pageIntent === 'analyze') {
      actions.push({
        text: "Explain View",
        prompt: "Explain what I'm looking at and what I can do here",
        description: "Understand the current page and available actions"
      });

      actions.push({
        text: "Navigation Help",
        prompt: "How do I navigate from here to accomplish my goals?",
        description: "Get navigation and workflow guidance"
      });
    } else {
      // Default actions for unknown contexts
      actions.push({
        text: "Page Overview",
        prompt: "Explain what I can do on this page",
        description: "Get an overview of page functionality"
      });

      actions.push({
        text: "Next Steps",
        prompt: "What should I do next?",
        description: "Get suggestions for next actions"
      });
    }

    // Add error-specific action if errors are present
    if (priorityFocus.includes('error-resolution') && actions.length < 3) {
      actions.push({
        text: "Troubleshoot",
        prompt: "Help me troubleshoot the issues on this page",
        description: "Get help resolving current issues"
      });
    }

    // Ensure we have at least 3 actions, pad with generic ones if needed
    while (actions.length < 3) {
      actions.push({
        text: "Ask Question",
        prompt: "I have a question about this page",
        description: "Ask any question about the current context"
      });
    }

    return actions.slice(0, 3); // Return max 3 actions
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
    
    // Update session time on user activity
    this.updateSessionTime();
    
    if (this.currentConversation.length > 1) {
      this.showConversationThread();
      // Scroll to bottom for new messages so user can see their new question/answer
      this.renderConversationThread(true);
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

  // Copy all the AI methods from popup.js (buildAIPromptWithHistory, callAI, etc.)
  buildAIPromptWithHistory(userPrompt, contextData) {
    const context = contextData?.context || {};
    const content = contextData?.content || {};
    const storage = contextData?.storage || {};
    const enhanced = contextData?.enhanced || false;
    const pageStructure = contextData?.pageStructure || {};
    const semanticComponents = contextData?.semanticComponents || {};
    const conversationalContext = contextData?.conversationalContext || {};
    const knowledgeContext = contextData?.knowledgeContext || {};

    let prompt = `You are Salesforce Advisor, an expert AI assistant with advanced contextual understanding. This is a continuing conversation. Use the conversation history and deep page analysis to provide highly contextual responses.

🧠 CURRENT PAGE ANALYSIS:
- Page Type: ${context.pageType || 'Unknown'}
- Page Header: "${context.pageHeader || 'Not detected'}"
- Primary Content: ${semanticComponents.primaryContent || 'Unknown'}
- Page Purpose: ${conversationalContext.pageSpecificContext?.purpose || 'Not specified'}
- Interface: ${context.userInterface || 'Unknown'}
- Available Actions: ${semanticComponents.availableActions?.slice(0, 5).join(', ') || 'None detected'}
- Errors: ${context.errors?.length || 0} detected

🎯 CONTENT FOCUS:
- Main Content Area: ${context.mainContentSummary?.keyTerms?.join(', ') || 'General interface'}
- Visible Elements: ${context.visibleElements?.join(', ') || 'Standard UI'}
- Page Intent: ${semanticComponents.pageIntent || 'View'}`;

    // Add enhanced contextual understanding
    if (enhanced && pageStructure.layout) {
      prompt += `

📊 PAGE STRUCTURE ANALYSIS:
- Layout Type: ${pageStructure.layout.pageType || 'Unknown'}
- Sections: ${pageStructure.layout.sections?.length || 0}
- Modals Open: ${pageStructure.layout.modals?.length || 0}
- Navigation Depth: ${pageStructure.navigation?.breadcrumbs?.length || 0}`;
    }

    if (enhanced && semanticComponents.functionalGroups) {
      const groups = semanticComponents.functionalGroups;
      prompt += `

🔍 FUNCTIONAL ANALYSIS:
- Data Entry Groups: ${groups.dataEntry?.length || 0}
- Action Groups: ${groups.actions?.length || 0}
- Information Groups: ${groups.information?.length || 0}`;
    }

    if (enhanced && knowledgeContext.objectType) {
      prompt += `

📚 SALESFORCE KNOWLEDGE CONTEXT:
- Object Type: ${knowledgeContext.objectType.name} (${knowledgeContext.objectType.type})
- Setup Area: ${knowledgeContext.setupArea?.name || 'Unknown'}
- Common Issues: ${knowledgeContext.commonIssues?.length || 0} identified
- Best Practices Available: ${knowledgeContext.bestPractices?.length || 0}`;
    }

    if (enhanced && conversationalContext.priorityFocus) {
      prompt += `

🎯 PRIORITY FOCUS AREAS:
${conversationalContext.priorityFocus.map(focus => `- ${focus}`).join('\n')}`;
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

    // Enhanced form field analysis with semantic understanding
    if (content.fields?.length > 0) {
      prompt += `

📝 INTELLIGENT FORM ANALYSIS (${content.fields.length} total fields):`;
      
      // Group fields by sections if available
      if (pageStructure.interactions?.forms?.length > 0) {
        const forms = pageStructure.interactions.forms;
        forms.forEach(form => {
          if (form.sections?.length > 0) {
            form.sections.forEach(section => {
              prompt += `\n\n${section.title} Section (${section.fieldCount} fields):`;
              section.fields.slice(0, 8).forEach(field => {
                prompt += `\n  - ${field.label} (${field.type}${field.required ? ', REQUIRED' : ''}${field.hasValue ? ', filled' : ', empty'}${field.hasError ? ', ERROR' : ''})`;
              });
            });
          }
        });
        
        // Add completion analysis
        const totalFields = forms.reduce((sum, form) => sum + form.totalFields, 0);
        const completedFields = forms.reduce((sum, form) => sum + form.completedFields, 0);
        const requiredFields = forms.reduce((sum, form) => sum + form.requiredFields, 0);
        const errors = forms.reduce((sum, form) => sum + form.validationErrors, 0);
        
        prompt += `\n\n📊 FORM COMPLETION STATUS:
- Progress: ${completedFields}/${totalFields} fields completed (${Math.round((completedFields/totalFields)*100)}%)
- Required: ${requiredFields} required fields
- Validation Errors: ${errors}`;
      } else {
        // Fallback to simple field listing
        content.fields.slice(0, 15).forEach(field => {
          prompt += `\n- ${field.label} (${field.type}${field.required ? ', REQUIRED' : ''}${field.value ? ', has value' : ', empty'})`;
        });
      }
    }

    // Add visible buttons with context
    if (content.buttons?.length > 0) {
      prompt += `\n\nAVAILABLE ACTIONS:\n${content.buttons.slice(0, 8).map(btn => `- ${btn}`).join('\n')}`;
    }

    // Add intelligent contextual guidance based on knowledge matching
    if (knowledgeContext.bestPractices?.length > 0) {
      prompt += `\n\n💡 RELEVANT BEST PRACTICES:
${knowledgeContext.bestPractices.slice(0, 3).map(practice => `- ${practice}`).join('\n')}`;
    }

    if (knowledgeContext.commonIssues?.length > 0) {
      prompt += `\n\n⚠️ COMMON ISSUES TO WATCH FOR:
${knowledgeContext.commonIssues.map(issue => `- ${issue.description} (${issue.severity} priority)`).join('\n')}`;
    }

    if (knowledgeContext.nextSteps?.length > 0) {
      prompt += `\n\n🎯 SUGGESTED NEXT STEPS:
${knowledgeContext.nextSteps.map(step => `- ${step}`).join('\n')}`;
    }

    // Add conversational framing guidance
    if (conversationalContext.suggestedQuestions?.length > 0) {
      prompt += `\n\n❓ USERS OFTEN ASK:
${conversationalContext.suggestedQuestions.slice(0, 3).map(q => `- "${q}"`).join('\n')}`;
    }

    prompt += `

CURRENT USER MESSAGE: ${userPrompt}

🎯 RESPONSE INSTRUCTIONS:
You are analyzing the MAIN CONTENT of the current Salesforce page, NOT the navigation header. Focus specifically on what the user is actually working with.

CURRENT USER MESSAGE: ${userPrompt}

CRITICAL: Base your response on the PRIMARY CONTENT AREA:
- Page Header: "${context.pageHeader || 'Unknown'}"
- Main Content: ${semanticComponents.primaryContent || 'Unknown'}
- Key Elements: ${context.mainContentSummary?.keyTerms?.join(', ') || 'None'}

RESPONSE GUIDELINES:
1. **FOCUS ON MAIN CONTENT**: Ignore navigation bars, headers, and global UI elements
2. **REFERENCE ACTUAL PAGE**: Talk about "${context.pageHeader}" specifically, not general navigation
3. **USE VISIBLE ELEMENTS**: Reference the actual ${context.visibleElements?.join(', ') || 'interface elements'} the user sees
4. **PROVIDE SPECIFIC HELP**: Give guidance relevant to ${conversationalContext.pageSpecificContext?.area || 'this page'}
5. **ACTIONABLE ADVICE**: Suggest specific actions using the available: ${semanticComponents.availableActions?.slice(0, 3).join(', ') || 'interface options'}

DO NOT discuss global navigation, headers, or general Salesforce interface unless specifically asked.
FOCUS ON: The specific ${context.pageType} content and functionality.

Response:`;

    return prompt;
  }

  // Copy the AI calling methods and formatting methods from popup.js
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

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: headers,
        signal: controller.signal,
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

      clearTimeout(timeoutId);
      return response;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }

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

  async callAIWithRetry(prompt, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          this.setLoading(true, `Retrying... (${attempt}/${maxRetries})`);
        }
        return await this.callAI(prompt);
      } catch (error) {
        if (error.message.includes('timeout') && attempt < maxRetries) {
          console.log(`AI request timeout, retrying... (attempt ${attempt + 1}/${maxRetries})`);
          this.setLoading(true, `Request timeout, retrying... (${attempt + 1}/${maxRetries})`);
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        throw error; // Re-throw if not a timeout or max retries reached
      }
    }
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
        
        // Validate OpenRouter response structure
        if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
          console.error('Invalid OpenRouter response:', data);
          throw new Error('Invalid API response structure');
        }
        
        if (!data.choices[0].message || !data.choices[0].message.content) {
          console.error('No content in OpenRouter response:', data.choices[0]);
          throw new Error('No content in API response');
        }
        
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
          throw new Error(error.error?.message || `OpenAI API Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Validate OpenAI response structure
        if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
          console.error('Invalid OpenAI response:', data);
          throw new Error('Invalid API response structure');
        }
        
        if (!data.choices[0].message || !data.choices[0].message.content) {
          console.error('No content in OpenAI response:', data.choices[0]);
          throw new Error('No content in API response');
        }
        
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
            max_tokens: 1000,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          throw new Error(`Azure API Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Validate Azure response structure
        if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
          console.error('Invalid Azure response:', data);
          throw new Error('Invalid API response structure');
        }
        
        if (!data.choices[0].message || !data.choices[0].message.content) {
          console.error('No content in Azure response:', data.choices[0]);
          throw new Error('No content in API response');
        }
        
        return data.choices[0].message.content;
      }

    } catch (error) {
      console.error('AI API Error:', error);

      // Provide helpful error messages based on error type
      let errorMessage = '';
      if (error.message.includes('timeout')) {
        errorMessage = `⏱️ Request Timeout

The AI service is taking longer than usual to respond. This can happen during high usage periods.

**What you can try:**
- Wait a moment and try again
- Try a shorter, more specific question
- Check your internet connection

Here's some contextual help while we resolve the connection:

${this.generateContextualHelp(prompt)}`;
      } else if (error.message.includes('API key')) {
        errorMessage = `🔑 API Key Issue

${error.message}

**To fix this:**
1. Click the extension icon → Options
2. Add a valid OpenRouter API key
3. Try again

Meanwhile, here's some general help:

${this.generateContextualHelp(prompt)}`;
      } else {
        errorMessage = `⚠️ AI Service Error: ${error.message}

Here's some contextual help while we resolve the AI connection:

${this.generateContextualHelp(prompt)}

💡 Tip: Check your API key and internet connection, then try again.`;
      }
      
      return errorMessage;
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
      // Scroll to bottom when showing new responses so user can see the latest answer
      this.renderConversationThread(true);
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

  setLoading(isLoading, message = 'Analyzing...') {
    if (isLoading) {
      this.analyzeBtn.disabled = true;
      this.analyzeBtn.textContent = message;
      this.responseArea.innerHTML = `<div class="loading">🤔 ${message}</div>`;
    } else {
      this.analyzeBtn.disabled = false;
      this.analyzeBtn.textContent = 'Send Message';
    }
  }

  filterContextData(contextResponse) {
    if (!contextResponse) return contextResponse;

    const filtered = {
      context: this.privacyFilter.filterObject(contextResponse.context, this.privacySettings),
      content: this.privacyFilter.filterObject(contextResponse.content, this.privacySettings),
      storage: this.filterStorageData(contextResponse.storage),
      enhanced: contextResponse.enhanced
    };

    return filtered;
  }

  filterStorageData(storageData) {
    if (!storageData) return storageData;

    // Apply more aggressive filtering to storage data as it may contain sensitive cached information
    const aggressiveSettings = {
      ...this.privacySettings,
      removePII: true,
      removeSalesforceIds: true,
      removeSensitiveFields: true
    };

    return this.privacyFilter.filterObject(storageData, aggressiveSettings);
  }

  showPrivacyWarning(validation, dataType) {
    const warningMessage = `🔒 Privacy Protection Active

High-risk content detected in ${dataType}:
${validation.issues.map(issue => `• ${issue.category}: ${issue.count} instance(s)`).join('\n')}

Your data has been automatically filtered to protect sensitive information. Please review your input and try again with non-sensitive information.

Privacy is our priority - no sensitive data will be sent to AI services.`;

    this.showResponse(warningMessage);
  }

  showPrivacyReport(originalPrompt, filteredPrompt, finalPrompt) {
    const report = this.privacyFilter.generatePrivacyReport(originalPrompt, filteredPrompt);
    const finalReport = this.privacyFilter.generatePrivacyReport(finalPrompt, finalPrompt);

    if (report.issuesRemoved > 0 || finalReport.originalRisk !== 'SAFE') {
      const reportMessage = `🛡️ Privacy Report

Data Protection Summary:
• Privacy Score: ${report.privacyScore}%
• Issues Filtered: ${report.issuesRemoved}
• Final Risk Level: ${finalReport.filteredRisk}

Your data has been automatically protected before sending to AI services. All PII, Salesforce IDs, and sensitive information have been filtered or masked.`;

      // Show privacy report in a subtle way
      setTimeout(() => {
        const privacyDiv = document.createElement('div');
        privacyDiv.className = 'privacy-report';
        privacyDiv.innerHTML = `<details><summary>🛡️ Privacy Report</summary><pre>${reportMessage}</pre></details>`;
        privacyDiv.style.cssText = 'margin: 10px 0; padding: 8px; background: #f3f3f3; border-radius: 4px; font-size: 12px;';
        
        if (this.currentConversation.length > 1) {
          this.threadMessages.appendChild(privacyDiv);
        } else {
          this.responseArea.appendChild(privacyDiv);
        }
      }, 1000);
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
        'azureDeployment',
        'privacySettings'
      ], (result) => {
        // Merge privacy settings
        if (result.privacySettings) {
          this.privacySettings = { ...this.privacySettings, ...result.privacySettings };
        }
        resolve(result);
      });
    });
  }
}

// Initialize side panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SalesforceAssistantSidePanel();
});