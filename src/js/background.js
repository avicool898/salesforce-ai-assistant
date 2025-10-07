// Background service worker for Salesforce AI Assistant
class SalesforceAssistantBackground {
  constructor() {
    this.init();
  }

  init() {
    this.setupInstallListener();
    this.setupTabUpdateListener();
    this.setupMessageListener();
  }

  setupInstallListener() {
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        // Set default settings
        chrome.storage.sync.set({
          aiProvider: 'openrouter',
          aiModel: 'deepseek/deepseek-chat-v3.1:free',
          autoAnalyze: false,
          contextDepth: 'medium'
        });
      }
    });

    // Handle extension icon click to open side panel directly
    chrome.action.onClicked.addListener(async (tab) => {
      try {
        // Open sidepanel directly instead of popup
        await chrome.sidePanel.open({ tabId: tab.id });
      } catch (error) {
        console.error('Failed to open sidepanel:', error);
      }
    });
  }

  setupTabUpdateListener() {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      // Only process when page is completely loaded
      if (changeInfo.status === 'complete' && tab.url) {
        this.handleTabUpdate(tabId, tab);
      }
    });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'analyzeContext':
          this.analyzeContext(request.data, sendResponse);
          return true; // Keep message channel open for async response

        case 'saveAnalysis':
          this.saveAnalysis(request.data);
          break;

        case 'getHistory':
          this.getAnalysisHistory(sendResponse);
          return true;
      }
    });
  }

  async handleTabUpdate(tabId, tab) {
    // Check if it's a Salesforce page
    if (!this.isSalesforceUrl(tab.url)) {
      return;
    }

    // Update badge to show extension is active
    chrome.action.setBadgeText({
      tabId: tabId,
      text: 'SF'
    });

    chrome.action.setBadgeBackgroundColor({
      tabId: tabId,
      color: '#0176d3'
    });

    // Check settings for auto-analysis
    const settings = await this.getSettings();
    if (settings.autoAnalyze) {
      // Delay to let page fully load
      setTimeout(() => {
        this.performAutoAnalysis(tabId);
      }, 2000);
    }
  }

  isSalesforceUrl(url) {
    return url && (
      url.includes('salesforce.com') ||
      url.includes('force.com') ||
      url.includes('lightning.force.com')
    );
  }

  async performAutoAnalysis(tabId) {
    try {
      // Get context from content script
      const response = await chrome.tabs.sendMessage(tabId, { action: 'getContext' });

      if (response && response.context.errors.length > 0) {
        // Show notification for errors
        chrome.action.setBadgeText({
          tabId: tabId,
          text: '⚠️'
        });

        // Store for later retrieval
        this.saveAnalysis({
          tabId: tabId,
          timestamp: Date.now(),
          context: response.context,
          autoDetected: true
        });
      }
    } catch (error) {
      console.error('Auto-analysis failed:', error);
    }
  }

  async analyzeContext(data, sendResponse) {
    try {
      // This would integrate with your AI service
      const analysis = await this.callAIService(data);

      // Save the analysis
      this.saveAnalysis({
        ...data,
        analysis: analysis,
        timestamp: Date.now()
      });

      sendResponse({ success: true, analysis: analysis });
    } catch (error) {
      console.error('Analysis failed:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async callAIService(data) {
    // Placeholder for AI service integration
    const settings = await this.getSettings();

    if (!settings.aiApiKey) {
      throw new Error('AI API key not configured');
    }

    // TODO: Implement actual AI API call
    return {
      suggestions: [
        'Check field-level security for the current object',
        'Verify user permissions in Profile or Permission Sets',
        'Review validation rules that might be blocking the action'
      ],
      confidence: 0.8,
      nextSteps: [
        'Navigate to Setup > Object Manager',
        'Check the specific field permissions',
        'Test with a different user profile'
      ]
    };
  }

  saveAnalysis(data) {
    // Save analysis to local storage for history
    chrome.storage.local.get(['analysisHistory'], (result) => {
      const history = result.analysisHistory || [];
      history.unshift(data); // Add to beginning

      // Keep only last 50 analyses
      if (history.length > 50) {
        history.splice(50);
      }

      chrome.storage.local.set({ analysisHistory: history });
    });
  }

  getAnalysisHistory(sendResponse) {
    chrome.storage.local.get(['analysisHistory'], (result) => {
      sendResponse(result.analysisHistory || []);
    });
  }

  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get([
        'aiApiKey',
        'aiProvider',
        'autoAnalyze',
        'contextDepth'
      ], (result) => {
        resolve(result);
      });
    });
  }
}

// Initialize background service
new SalesforceAssistantBackground();