// Options page script for Salesforce AI Assistant
class OptionsManager {
  constructor() {
    this.elements = {
      aiProvider: document.getElementById('aiProvider'),
      openrouterApiKey: document.getElementById('openrouterApiKey'),
      openrouterModel: document.getElementById('openrouterModel'),
      siteUrl: document.getElementById('siteUrl'),
      siteName: document.getElementById('siteName'),
      openaiApiKey: document.getElementById('openaiApiKey'),
      openaiModel: document.getElementById('openaiModel'),
      azureApiKey: document.getElementById('azureApiKey'),
      azureEndpoint: document.getElementById('azureEndpoint'),
      azureDeployment: document.getElementById('azureDeployment'),
      contextDepth: document.getElementById('contextDepth'),
      autoAnalyze: document.getElementById('autoAnalyze'),
      saveBtn: document.getElementById('saveBtn'),
      testBtn: document.getElementById('testBtn'),
      status: document.getElementById('status')
    };
    
    this.init();
  }

  init() {
    this.loadSettings();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Provider selection
    this.elements.aiProvider.addEventListener('change', () => {
      this.toggleProviderConfig();
    });

    // Save settings
    this.elements.saveBtn.addEventListener('click', () => {
      this.saveSettings();
    });

    // Test connection
    this.elements.testBtn.addEventListener('click', () => {
      this.testConnection();
    });
  }

  toggleProviderConfig() {
    const provider = this.elements.aiProvider.value;
    
    // Hide all configs
    document.querySelectorAll('.provider-config').forEach(config => {
      config.classList.remove('active');
    });
    
    // Show selected config
    document.getElementById(`${provider}-config`).classList.add('active');
  }

  async loadSettings() {
    const settings = await this.getStoredSettings();
    
    // Set form values
    this.elements.aiProvider.value = settings.aiProvider || 'openrouter';
    this.elements.openrouterApiKey.value = settings.aiApiKey || '';
    this.elements.openrouterModel.value = settings.aiModel || 'x-ai/grok-4-fast:free';
    this.elements.siteUrl.value = settings.siteUrl || '';
    this.elements.siteName.value = settings.siteName || '';
    this.elements.openaiApiKey.value = settings.openaiApiKey || '';
    this.elements.openaiModel.value = settings.openaiModel || 'gpt-3.5-turbo';
    this.elements.azureApiKey.value = settings.azureApiKey || '';
    this.elements.azureEndpoint.value = settings.azureEndpoint || '';
    this.elements.azureDeployment.value = settings.azureDeployment || '';
    this.elements.contextDepth.value = settings.contextDepth || 'medium';
    this.elements.autoAnalyze.checked = settings.autoAnalyze || false;
    
    // Show correct provider config
    this.toggleProviderConfig();
  }

  async saveSettings() {
    const provider = this.elements.aiProvider.value;
    
    const settings = {
      aiProvider: provider,
      contextDepth: this.elements.contextDepth.value,
      autoAnalyze: this.elements.autoAnalyze.checked
    };

    // Add provider-specific settings
    if (provider === 'openrouter') {
      settings.aiApiKey = this.elements.openrouterApiKey.value.trim();
      settings.aiModel = this.elements.openrouterModel.value;
      settings.siteUrl = this.elements.siteUrl.value.trim();
      settings.siteName = this.elements.siteName.value.trim();
    } else if (provider === 'openai') {
      settings.aiApiKey = this.elements.openaiApiKey.value.trim();
      settings.aiModel = this.elements.openaiModel.value;
    } else if (provider === 'azure') {
      settings.aiApiKey = this.elements.azureApiKey.value.trim();
      settings.azureEndpoint = this.elements.azureEndpoint.value.trim();
      settings.azureDeployment = this.elements.azureDeployment.value.trim();
    }

    try {
      await chrome.storage.sync.set(settings);
      this.showStatus('Settings saved successfully!', 'success');
    } catch (error) {
      this.showStatus(`Error saving settings: ${error.message}`, 'error');
    }
  }

  async testConnection() {
    const provider = this.elements.aiProvider.value;
    let apiKey, endpoint;

    if (provider === 'openrouter') {
      apiKey = this.elements.openrouterApiKey.value.trim();
      if (!apiKey) {
        this.showStatus('Please enter your OpenRouter API key first', 'error');
        return;
      }
    } else if (provider === 'openai') {
      apiKey = this.elements.openaiApiKey.value.trim();
      if (!apiKey) {
        this.showStatus('Please enter your OpenAI API key first', 'error');
        return;
      }
    } else if (provider === 'azure') {
      apiKey = this.elements.azureApiKey.value.trim();
      endpoint = this.elements.azureEndpoint.value.trim();
      const deployment = this.elements.azureDeployment.value.trim();
      
      if (!apiKey || !endpoint || !deployment) {
        this.showStatus('Please fill in all Azure OpenAI fields first', 'error');
        return;
      }
    }

    this.elements.testBtn.disabled = true;
    this.elements.testBtn.textContent = '🧪 Testing...';
    
    try {
      const testResult = await this.performConnectionTest(provider, apiKey, endpoint);
      
      if (testResult.success) {
        this.showStatus(`✅ Connection successful! Model: ${testResult.model}`, 'success');
      } else {
        this.showStatus(`❌ Connection failed: ${testResult.error}`, 'error');
      }
    } catch (error) {
      this.showStatus(`❌ Test failed: ${error.message}`, 'error');
    } finally {
      this.elements.testBtn.disabled = false;
      this.elements.testBtn.textContent = '🧪 Test Connection';
    }
  }

  async performConnectionTest(provider, apiKey, endpoint) {
    const testPrompt = "Hello! This is a connection test. Please respond with 'Connection successful' and your model name.";
    
    try {
      if (provider === 'openrouter') {
        const headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        };

        // Add optional headers
        const siteUrl = this.elements.siteUrl.value.trim();
        const siteName = this.elements.siteName.value.trim();
        if (siteUrl) headers['HTTP-Referer'] = siteUrl;
        if (siteName) headers['X-Title'] = siteName;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            model: this.elements.openrouterModel.value,
            messages: [{ role: 'user', content: testPrompt }],
            max_tokens: 50
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        return {
          success: true,
          model: data.model || this.elements.openrouterModel.value,
          response: data.choices[0].message.content
        };
        
      } else if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.elements.openaiModel.value,
            messages: [{ role: 'user', content: testPrompt }],
            max_tokens: 50
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        return {
          success: true,
          model: data.model,
          response: data.choices[0].message.content
        };
        
      } else if (provider === 'azure') {
        const deployment = this.elements.azureDeployment.value.trim();
        const response = await fetch(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`, {
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: testPrompt }],
            max_tokens: 50
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return {
          success: true,
          model: data.model || deployment,
          response: data.choices[0].message.content
        };
      }
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  showStatus(message, type) {
    this.elements.status.textContent = message;
    this.elements.status.className = `status ${type}`;
    this.elements.status.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.elements.status.style.display = 'none';
    }, 5000);
  }

  async getStoredSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get([
        'aiProvider',
        'aiApiKey',
        'aiModel',
        'siteUrl',
        'siteName',
        'openaiApiKey',
        'openaiModel',
        'azureApiKey',
        'azureEndpoint',
        'azureDeployment',
        'contextDepth',
        'autoAnalyze'
      ], (result) => {
        resolve(result);
      });
    });
  }
}

// Initialize options page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new OptionsManager();
});