// Advanced Salesforce Context Detector and Intelligence Engine
class SalesforceContextAnalyzer {
  constructor() {
    this.context = {};
    this.urlMetadata = {};
    this.storageData = {};
    this.mutationObserver = null;
    this.eventListeners = [];
    
    // Initialize privacy filter
    this.privacyFilter = new PrivacyFilter();
    this.privacySettings = {
      removePII: true,
      removeSalesforceIds: false, // Keep some Salesforce IDs for context
      removeSensitiveFields: true,
      maskingChar: '[FILTERED]'
    };
    
    this.init();
  }

  init() {
    this.detectContext();
    this.setupMessageListener();
    this.setupMutationObserver();
    this.setupEventListeners();
    this.analyzeStorageData();
  }

  detectContext() {
    try {
      const url = window.location.href;
      const title = document.title;
      
      // Enhanced context with deep analysis
      this.context = {
        url: url,
        title: title,
        urlMetadata: this.parseAdvancedURL(url),
        pageType: this.detectPageType(),
        errors: this.extractErrors(),
        currentObject: this.detectCurrentObject(),
        userInterface: this.detectInterface(),
        userActivity: this.analyzeUserActivity(),
        salesforceMetadata: this.extractSalesforceMetadata(),
        componentTree: this.analyzeLightningComponents(),
        recentActivity: this.getRecentActivity(),
        timestamp: Date.now()
      };
    } catch (error) {
      console.warn('Context detection failed:', error);
      // Fallback to basic context
      this.context = {
        url: window.location.href,
        title: document.title,
        pageType: 'Unknown',
        errors: [],
        currentObject: null,
        userInterface: 'Unknown',
        timestamp: Date.now()
      };
    }
  }

  parseAdvancedURL(url) {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const params = new URLSearchParams(urlObj.search);
    
    const metadata = {
      domain: urlObj.hostname,
      orgId: this.extractOrgId(url),
      namespace: this.extractNamespace(pathname),
      app: this.extractApp(pathname),
      action: this.extractAction(pathname),
      recordId: this.extractRecordId(pathname),
      objectType: this.extractObjectType(pathname),
      mode: this.extractMode(pathname, params),
      parameters: Object.fromEntries(params),
      isSetup: pathname.includes('/setup/'),
      isLightning: url.includes('/lightning/'),
      isClassic: !url.includes('/lightning/') && url.includes('salesforce.com')
    };

    return metadata;
  }

  extractOrgId(url) {
    // Extract org ID from various URL patterns
    const patterns = [
      /https:\/\/([a-zA-Z0-9]+)\.lightning\.force\.com/,
      /https:\/\/([a-zA-Z0-9]+)\.salesforce\.com/,
      /sid=([a-zA-Z0-9!.]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  extractNamespace(pathname) {
    const match = pathname.match(/\/apex\/([^_]+)__/);
    return match ? match[1] : null;
  }

  extractApp(pathname) {
    // Lightning app detection
    const lightningApp = pathname.match(/\/lightning\/app\/([^\/]+)/);
    if (lightningApp) return lightningApp[1];
    
    // Setup app detection
    if (pathname.includes('/setup/')) return 'Setup';
    
    // Developer Console
    if (pathname.includes('/_ui/common/apex/debug/')) return 'Developer Console';
    
    return null;
  }

  extractAction(pathname) {
    const actions = {
      '/e/': 'edit',
      '/view': 'view',
      '/new': 'create',
      '/list': 'list',
      '/clone': 'clone',
      '/delete': 'delete'
    };
    
    for (const [pattern, action] of Object.entries(actions)) {
      if (pathname.includes(pattern)) return action;
    }
    
    return 'view'; // default
  }

  extractRecordId(pathname) {
    // Lightning record ID patterns
    const lightningMatch = pathname.match(/\/lightning\/r\/\w+\/([a-zA-Z0-9]{15,18})/);
    if (lightningMatch) return lightningMatch[1];
    
    // Classic record ID patterns
    const classicMatch = pathname.match(/\/([a-zA-Z0-9]{15,18})(?:\/|$)/);
    if (classicMatch) return classicMatch[1];
    
    return null;
  }

  extractObjectType(pathname) {
    // Lightning object type
    const lightningMatch = pathname.match(/\/lightning\/[or]\/(\w+)/);
    if (lightningMatch) return lightningMatch[1];
    
    // Setup object manager
    const setupMatch = pathname.match(/\/setup\/ObjectManager\/(\w+)/);
    if (setupMatch) return setupMatch[1];
    
    // Classic patterns
    const classicMatch = pathname.match(/\/(\w+)\/[oe]/);
    if (classicMatch) return classicMatch[1];
    
    return this.detectCurrentObject();
  }

  extractMode(pathname, params) {
    if (params.has('edit')) return 'edit';
    if (params.has('clone')) return 'clone';
    if (pathname.includes('/e/')) return 'edit';
    if (pathname.includes('/new')) return 'new';
    return 'view';
  }

  analyzeStorageData() {
    try {
      // Analyze localStorage for Salesforce data
      const localStorage = window.localStorage;
      const sessionStorage = window.sessionStorage;
      
      this.storageData = {
        recentItems: this.parseRecentItems(localStorage),
        userPreferences: this.parseUserPreferences(localStorage),
        navigationHistory: this.parseNavigationHistory(sessionStorage),
        cachedData: this.parseCachedData(localStorage),
        userSession: this.parseUserSession(sessionStorage)
      };
    } catch (error) {
      console.warn('Storage analysis failed:', error);
      this.storageData = {};
    }
  }

  parseRecentItems(storage) {
    const recentItems = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.includes('recent') || key.includes('Recent')) {
        try {
          const data = JSON.parse(storage.getItem(key));
          if (data && Array.isArray(data)) {
            recentItems.push(...data);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
    return recentItems.slice(0, 10); // Limit to 10 most recent
  }

  parseUserPreferences(storage) {
    const preferences = {};
    const prefKeys = ['userPrefs', 'preferences', 'settings'];
    
    prefKeys.forEach(key => {
      try {
        const data = storage.getItem(key);
        if (data) {
          preferences[key] = JSON.parse(data);
        }
      } catch (e) {
        // Skip invalid JSON
      }
    });
    
    return preferences;
  }

  parseNavigationHistory(storage) {
    const history = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && (key.includes('nav') || key.includes('history'))) {
        try {
          const data = JSON.parse(storage.getItem(key));
          if (data) history.push(data);
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
    return history;
  }

  parseCachedData(storage) {
    const cached = {};
    const cacheKeys = ['cache', 'metadata', 'schema'];
    
    cacheKeys.forEach(keyPattern => {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.includes(keyPattern)) {
          try {
            cached[key] = JSON.parse(storage.getItem(key));
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    });
    
    return cached;
  }

  parseUserSession(storage) {
    const session = {};
    const sessionKeys = ['session', 'user', 'auth'];
    
    sessionKeys.forEach(keyPattern => {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.includes(keyPattern)) {
          try {
            const data = storage.getItem(key);
            if (data && !data.includes('token') && !data.includes('password')) {
              session[key] = JSON.parse(data);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    });
    
    return session;
  }

  analyzeUserActivity() {
    const activity = {
      scrollPosition: window.scrollY,
      focusedElement: document.activeElement ? {
        tagName: document.activeElement.tagName,
        id: document.activeElement.id,
        className: document.activeElement.className,
        placeholder: document.activeElement.placeholder
      } : null,
      visibleModals: this.getVisibleModals(),
      openTabs: this.getOpenTabs(),
      formState: this.analyzeFormState(),
      userInteractions: this.getRecentInteractions()
    };
    
    return activity;
  }

  getVisibleModals() {
    const modals = [];
    const modalSelectors = [
      '.slds-modal',
      '.modal',
      '.popup',
      '[role="dialog"]',
      '.uiModal'
    ];
    
    modalSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.offsetParent !== null) { // visible
          modals.push({
            selector: selector,
            title: el.querySelector('.slds-modal__title, .modal-title')?.textContent?.trim(),
            content: el.textContent.substring(0, 200)
          });
        }
      });
    });
    
    return modals;
  }

  getOpenTabs() {
    const tabs = [];
    const tabSelectors = [
      '.slds-tabs_default__item',
      '.tabHeader',
      '.tab'
    ];
    
    tabSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        tabs.push({
          text: el.textContent.trim(),
          active: el.classList.contains('slds-is-active') || el.classList.contains('active')
        });
      });
    });
    
    return tabs;
  }

  analyzeFormState() {
    const forms = document.querySelectorAll('form, .slds-form');
    const formState = [];
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, select, textarea');
      const filledInputs = Array.from(inputs).filter(input => input.value && input.value.trim());
      
      if (inputs.length > 0) {
        formState.push({
          totalFields: inputs.length,
          filledFields: filledInputs.length,
          completionRate: (filledInputs.length / inputs.length * 100).toFixed(1),
          requiredFields: Array.from(inputs).filter(input => input.required).length,
          errors: form.querySelectorAll('.slds-has-error, .error').length
        });
      }
    });
    
    return formState;
  }

  getRecentInteractions() {
    // This would be populated by event listeners
    return this.recentInteractions || [];
  }

  detectPageType() {
    const url = window.location.href;
    const pathname = window.location.pathname;
    
    // Enhanced page type detection with more specificity
    if (url.includes('lightning.force.com') || url.includes('/lightning/')) {
      // Setup pages
      if (pathname.includes('/setup/')) {
        if (pathname.includes('/ObjectManager/')) return 'Object Manager';
        if (pathname.includes('/FlowDefinitionView/')) return 'Flow Definition';
        if (pathname.includes('/ApexClasses/')) return 'Apex Classes';
        if (pathname.includes('/CustomLabels/')) return 'Custom Labels';
        if (pathname.includes('/Users/')) return 'User Management';
        return 'Setup';
      }
      
      // App Builder and Development
      if (pathname.includes('/apex/')) return 'Apex Page';
      if (pathname.includes('/flow/')) return 'Flow Builder';
      if (pathname.includes('/flexipages/')) return 'Lightning App Builder';
      if (pathname.includes('/wave/')) return 'Analytics Studio';
      
      // Record operations
      if (pathname.includes('/r/') && pathname.includes('/view')) return 'Record Detail';
      if (pathname.includes('/r/') && pathname.includes('/edit')) return 'Record Edit';
      if (pathname.includes('/e/')) return 'Record Create/Edit';
      if (pathname.includes('/list')) return 'List View';
      if (pathname.includes('/related/')) return 'Related List';
      
      // Reports and Dashboards
      if (pathname.includes('/reports/')) return 'Reports';
      if (pathname.includes('/dashboards/')) return 'Dashboards';
      
      return 'Lightning Experience';
    }
    
    // Classic detection with more specificity
    if (url.includes('/apex/')) return 'Visualforce Page';
    if (url.includes('/_ui/')) return 'Salesforce Classic';
    if (url.includes('/console')) return 'Service Console';
    
    return 'Unknown Salesforce Page';
  }

  detectCurrentObject() {
    // Try to detect current sObject from URL or page elements
    const url = window.location.href;
    
    // Lightning URL patterns
    const lightningMatch = url.match(/\/lightning\/[or]\/(\w+)\//);
    if (lightningMatch) return lightningMatch[1];
    
    // Classic URL patterns
    const classicMatch = url.match(/\/(\w+)\/[oe]/);
    if (classicMatch) return classicMatch[1];
    
    // Try to find from page title or breadcrumbs
    const breadcrumbs = document.querySelector('.slds-breadcrumb');
    if (breadcrumbs) {
      const objectName = breadcrumbs.textContent.match(/(\w+)\s+(Home|List)/);
      if (objectName) return objectName[1];
    }
    
    return null;
  }

  detectInterface() {
    if (document.querySelector('.slds-scope')) return 'Lightning';
    if (document.querySelector('.bPageTitle')) return 'Classic';
    return 'Unknown';
  }

  extractErrors() {
    const errors = [];
    
    try {
      // Lightning error messages
      const lightningErrorSelectors = [
        '.slds-notify--error',
        '.slds-notify_error',
        '.slds-has-error',
        '.error-message'
      ];
      
      lightningErrorSelectors.forEach(selector => {
        try {
          document.querySelectorAll(selector).forEach(el => {
            const message = el.textContent.trim();
            if (message) {
              errors.push({
                type: 'Lightning Error',
                message: message,
                element: el.outerHTML.substring(0, 200)
              });
            }
          });
        } catch (e) {
          console.warn(`Error with selector ${selector}:`, e);
        }
      });
      
      // Apex debug logs or errors
      const systemErrorSelectors = [
        '.messageText',
        '.errorMsg',
        '.apexErrorMsg',
        '.debugLog .error'
      ];
      
      systemErrorSelectors.forEach(selector => {
        try {
          document.querySelectorAll(selector).forEach(el => {
            const message = el.textContent.trim();
            if (message) {
              errors.push({
                type: 'System Error',
                message: message,
                element: el.outerHTML.substring(0, 200)
              });
            }
          });
        } catch (e) {
          console.warn(`Error with selector ${selector}:`, e);
        }
      });
      
      // Flow errors
      try {
        document.querySelectorAll('[data-error-message]').forEach(el => {
          const errorMessage = el.getAttribute('data-error-message');
          if (errorMessage) {
            errors.push({
              type: 'Flow Error',
              message: errorMessage,
              element: el.outerHTML.substring(0, 200)
            });
          }
        });
      } catch (e) {
        console.warn('Error extracting Flow errors:', e);
      }
      
    } catch (error) {
      console.warn('Error extraction failed:', error);
    }
    
    return errors;
  }

  extractPageContent() {
    const content = {
      forms: this.extractForms(),
      buttons: this.extractButtons(),
      fields: this.extractFields(),
      lists: this.extractLists(),
      navigation: this.extractNavigation()
    };
    
    return content;
  }

  extractForms() {
    const forms = [];
    document.querySelectorAll('form, .slds-form').forEach(form => {
      const inputs = Array.from(form.querySelectorAll('input, select, textarea')).map(input => ({
        type: input.type || input.tagName.toLowerCase(),
        name: input.name || input.id,
        label: this.findFieldLabel(input),
        required: input.required || input.hasAttribute('aria-required')
      }));
      
      if (inputs.length > 0) {
        forms.push({ inputs });
      }
    });
    return forms;
  }

  extractButtons() {
    return Array.from(document.querySelectorAll('button, .slds-button, input[type="button"]'))
      .map(btn => ({
        text: btn.textContent.trim() || btn.value,
        type: btn.className,
        disabled: btn.disabled
      }))
      .filter(btn => btn.text);
  }

  extractFields() {
    const fields = [];
    document.querySelectorAll('.slds-form-element, .requiredInput, .dataCol').forEach(field => {
      const label = field.querySelector('label, .labelCol');
      const input = field.querySelector('input, select, textarea');
      
      if (label && input) {
        fields.push({
          label: label.textContent.trim(),
          type: input.type || input.tagName.toLowerCase(),
          required: field.classList.contains('requiredInput') || input.required,
          value: input.value
        });
      }
    });
    return fields;
  }

  extractLists() {
    const lists = [];
    document.querySelectorAll('.slds-table, .list').forEach(table => {
      const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
      const rowCount = table.querySelectorAll('tbody tr, .dataRow').length;
      
      if (headers.length > 0) {
        lists.push({ headers, rowCount });
      }
    });
    return lists;
  }

  extractNavigation() {
    const nav = [];
    document.querySelectorAll('.slds-breadcrumb__item, .breadcrumb').forEach(item => {
      nav.push(item.textContent.trim());
    });
    return nav;
  }

  extractSalesforceMetadata() {
    const metadata = {
      orgInfo: this.extractOrgInfo(),
      userInfo: this.extractUserInfo(),
      appInfo: this.extractAppInfo(),
      objectSchema: this.extractObjectSchema(),
      permissions: this.extractPermissionHints()
    };
    
    return metadata;
  }

  extractOrgInfo() {
    // Try to extract org information from various sources
    const orgInfo = {};
    
    // From page title or headers
    const titleMatch = document.title.match(/\| (.+) \| Salesforce/);
    if (titleMatch) orgInfo.name = titleMatch[1];
    
    // From user menu or org switcher
    const orgSwitcher = document.querySelector('.slds-context-bar__label-action, .orgSwitcher');
    if (orgSwitcher) orgInfo.displayName = orgSwitcher.textContent.trim();
    
    return orgInfo;
  }

  extractUserInfo() {
    const userInfo = {};
    
    // From user menu
    const userMenu = document.querySelector('.slds-avatar, .profileTrigger');
    if (userMenu) {
      const userName = userMenu.getAttribute('alt') || userMenu.getAttribute('title');
      if (userName) userInfo.name = userName;
    }
    
    // From global header
    const globalHeader = document.querySelector('.oneHeader');
    if (globalHeader) {
      const userLink = globalHeader.querySelector('a[href*="/005"]');
      if (userLink) userInfo.profileLink = userLink.href;
    }
    
    return userInfo;
  }

  extractAppInfo() {
    const appInfo = {};
    
    // Current app from app launcher
    const currentApp = document.querySelector('.slds-context-bar__label-action, .currentApp');
    if (currentApp) appInfo.name = currentApp.textContent.trim();
    
    // App navigation items
    const navItems = document.querySelectorAll('.slds-context-bar__item, .navItem');
    appInfo.navigation = Array.from(navItems).map(item => item.textContent.trim()).filter(Boolean);
    
    return appInfo;
  }

  extractObjectSchema() {
    const schema = {};
    
    // From record forms
    const recordForm = document.querySelector('.record-form, .slds-form');
    if (recordForm) {
      const fields = recordForm.querySelectorAll('.slds-form-element');
      schema.fields = Array.from(fields).map(field => {
        const label = field.querySelector('label');
        const input = field.querySelector('input, select, textarea');
        return {
          label: label?.textContent?.trim(),
          type: input?.type || input?.tagName?.toLowerCase(),
          required: field.classList.contains('slds-is-required') || input?.required,
          apiName: input?.name || input?.id
        };
      }).filter(field => field.label);
    }
    
    return schema;
  }

  extractPermissionHints() {
    const permissions = {
      readOnly: document.querySelectorAll('[readonly], .slds-is-readonly').length > 0,
      hasEditAccess: document.querySelectorAll('.edit, [data-action="edit"]').length > 0,
      hasDeleteAccess: document.querySelectorAll('.delete, [data-action="delete"]').length > 0,
      hasCreateAccess: document.querySelectorAll('.new, [data-action="new"]').length > 0,
      restrictedFields: document.querySelectorAll('.slds-has-error[data-error*="permission"]').length
    };
    
    return permissions;
  }

  analyzeLightningComponents() {
    const components = [];
    
    try {
      // Look for Lightning Web Components with proper selectors
      const lwcSelectors = [
        '[data-aura-class]',
        '[data-lwc-class]',
        '[data-lwc-host]',
        '[lwc\\:host]'
      ];
      
      lwcSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            components.push({
              type: 'LWC',
              tagName: element.tagName.toLowerCase(),
              attributes: Array.from(element.attributes).map(attr => ({
                name: attr.name,
                value: attr.value.substring(0, 100) // Limit value length
              })),
              classes: element.className
            });
          });
        } catch (e) {
          console.warn(`Invalid selector ${selector}:`, e);
        }
      });
      
      // Look for custom Lightning components (c- prefix)
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        if (element.tagName.toLowerCase().startsWith('c-')) {
          components.push({
            type: 'Custom LWC',
            tagName: element.tagName.toLowerCase(),
            attributes: Array.from(element.attributes).map(attr => ({
              name: attr.name,
              value: attr.value.substring(0, 100)
            })),
            classes: element.className
          });
        }
      });
      
      // Look for Aura components
      const auraElements = document.querySelectorAll('[data-aura-rendered-by]');
      auraElements.forEach(element => {
        components.push({
          type: 'Aura',
          renderedBy: element.getAttribute('data-aura-rendered-by'),
          classes: element.className
        });
      });
      
    } catch (error) {
      console.warn('Lightning component analysis failed:', error);
    }
    
    return components.slice(0, 20); // Limit to prevent overwhelming data
  }

  getRecentActivity() {
    // Combine storage data and current context for recent activity
    const activity = [];
    
    if (this.storageData.recentItems) {
      activity.push(...this.storageData.recentItems.map(item => ({
        type: 'recent_item',
        data: item,
        source: 'storage'
      })));
    }
    
    if (this.storageData.navigationHistory) {
      activity.push(...this.storageData.navigationHistory.map(item => ({
        type: 'navigation',
        data: item,
        source: 'storage'
      })));
    }
    
    return activity.slice(0, 15); // Limit recent activity
  }

  setupMutationObserver() {
    try {
      // Watch for DOM changes to detect dynamic content
      this.mutationObserver = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        try {
          mutations.forEach((mutation) => {
            // Check for error messages
            if (mutation.type === 'childList') {
              const addedNodes = Array.from(mutation.addedNodes);
              const hasErrors = addedNodes.some(node => {
                try {
                  return node.nodeType === 1 && (
                    node.classList?.contains('slds-notify--error') ||
                    node.classList?.contains('error') ||
                    node.querySelector?.('.slds-notify--error, .error')
                  );
                } catch (e) {
                  return false;
                }
              });
              
              if (hasErrors) {
                shouldUpdate = true;
              }
            }
            
            // Check for modal changes
            try {
              if (mutation.target.classList?.contains('slds-modal') ||
                  mutation.target.querySelector?.('.slds-modal')) {
                shouldUpdate = true;
              }
            } catch (e) {
              // Ignore selector errors
            }
          });
          
          if (shouldUpdate) {
            // Debounce updates
            clearTimeout(this.updateTimeout);
            this.updateTimeout = setTimeout(() => {
              this.detectContext();
            }, 500);
          }
        } catch (error) {
          console.warn('Mutation observer error:', error);
        }
      });
      
      // Start observing with error handling
      if (document.body) {
        this.mutationObserver.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'style']
        });
      }
    } catch (error) {
      console.warn('Failed to setup mutation observer:', error);
    }
  }

  setupEventListeners() {
    // Track user interactions for better context
    this.recentInteractions = [];
    
    const trackInteraction = (event) => {
      this.recentInteractions.unshift({
        type: event.type,
        target: {
          tagName: event.target.tagName,
          className: event.target.className,
          id: event.target.id,
          text: event.target.textContent?.substring(0, 50)
        },
        timestamp: Date.now()
      });
      
      // Keep only last 10 interactions
      this.recentInteractions = this.recentInteractions.slice(0, 10);
    };
    
    // Track important events
    ['click', 'focus', 'change', 'submit'].forEach(eventType => {
      document.addEventListener(eventType, trackInteraction, true);
      this.eventListeners.push({ type: eventType, handler: trackInteraction });
    });
  }

  findFieldLabel(input) {
    // Try multiple strategies to find the label
    const id = input.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent.trim();
    }
    
    const parent = input.closest('.slds-form-element, .requiredInput');
    if (parent) {
      const label = parent.querySelector('label');
      if (label) return label.textContent.trim();
    }
    
    return input.placeholder || input.name || '';
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getContext') {
        this.detectContext(); // Refresh context
        this.analyzeStorageData(); // Refresh storage analysis
        
        // Apply privacy filtering to all data before sending
        const filteredResponse = this.applyPrivacyFiltering({
          context: this.context,
          content: this.extractPageContent(),
          storage: this.storageData,
          enhanced: true // Flag to indicate enhanced context
        });
        
        sendResponse(filteredResponse);
      }
      return true;
    });
  }

  applyPrivacyFiltering(data) {
    try {
      // Create a deep copy to avoid modifying original data
      const filtered = JSON.parse(JSON.stringify(data));
      
      // Filter context data
      if (filtered.context) {
        filtered.context = this.privacyFilter.filterObject(filtered.context, this.privacySettings);
        
        // Special handling for URLs - keep structure but filter sensitive parts
        if (filtered.context.url) {
          filtered.context.url = this.filterURL(filtered.context.url);
        }
        
        // Filter error messages while preserving error types
        if (filtered.context.errors) {
          filtered.context.errors = filtered.context.errors.map(error => ({
            ...error,
            message: this.privacyFilter.filterText(error.message, this.privacySettings)
          }));
        }
      }
      
      // Filter page content
      if (filtered.content) {
        filtered.content = this.privacyFilter.filterObject(filtered.content, this.privacySettings);
        
        // Special handling for form fields - preserve structure but filter values
        if (filtered.content.fields) {
          filtered.content.fields = filtered.content.fields.map(field => ({
            ...field,
            value: field.value ? '[FILTERED]' : field.value,
            label: field.label // Keep labels for context
          }));
        }
      }
      
      // Apply aggressive filtering to storage data
      if (filtered.storage) {
        const aggressiveSettings = {
          ...this.privacySettings,
          removeSalesforceIds: true, // Remove all IDs from storage
          removePII: true
        };
        filtered.storage = this.privacyFilter.filterObject(filtered.storage, aggressiveSettings);
      }
      
      return filtered;
    } catch (error) {
      console.warn('Privacy filtering failed, returning minimal safe data:', error);
      
      // Return minimal safe data if filtering fails
      return {
        context: {
          pageType: data.context?.pageType || 'Unknown',
          userInterface: data.context?.userInterface || 'Unknown',
          errors: [],
          timestamp: Date.now()
        },
        content: {},
        storage: {},
        enhanced: true,
        privacyFiltered: true
      };
    }
  }

  filterURL(url) {
    try {
      const urlObj = new URL(url);
      
      // Keep domain and basic path structure, filter sensitive parameters
      const filteredParams = new URLSearchParams();
      
      // Keep only safe parameters
      const safeParams = ['retURL', 'setupid', 'type', 'mode'];
      urlObj.searchParams.forEach((value, key) => {
        if (safeParams.includes(key)) {
          filteredParams.set(key, value);
        } else if (key.toLowerCase().includes('id') && value.length > 10) {
          // Filter long ID values but keep parameter name for context
          filteredParams.set(key, '[FILTERED_ID]');
        }
      });
      
      // Reconstruct URL with filtered parameters
      urlObj.search = filteredParams.toString();
      
      return urlObj.toString();
    } catch (error) {
      // If URL parsing fails, return a generic safe URL
      return 'https://[FILTERED_DOMAIN]/[FILTERED_PATH]';
    }
  }

  // Cleanup method
  destroy() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    
    this.eventListeners.forEach(({ type, handler }) => {
      document.removeEventListener(type, handler, true);
    });
    
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
  }
}

// Initialize the analyzer
const analyzer = new SalesforceContextAnalyzer();

// Periodically update context for dynamic pages
setInterval(() => {
  analyzer.detectContext();
}, 5000);