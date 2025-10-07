// Advanced Salesforce Context Detector and Intelligence Engine
class SalesforceContextAnalyzer {
  constructor() {
    this.context = {};
    this.urlMetadata = {};
    this.storageData = {};
    this.mutationObserver = null;
    this.eventListeners = [];
    this.pageStructure = {};
    this.semanticComponents = {};
    this.knowledgeBase = new SalesforceKnowledgeBase();
    this.conversationalContext = {};

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
    console.log('Salesforce Advisor: Content script initializing on', window.location.href);
    
    try {
      this.performAdvancedPageAnalysis();
    } catch (error) {
      console.warn('Advanced page analysis failed, using basic detection:', error);
      this.detectContext(); // Fallback to basic detection
    }
    
    try {
      this.setupMessageListener();
    } catch (error) {
      console.error('Failed to setup message listener:', error);
    }
    
    try {
      this.setupMutationObserver();
    } catch (error) {
      console.warn('Failed to setup mutation observer:', error);
    }
    
    try {
      this.setupEventListeners();
    } catch (error) {
      console.warn('Failed to setup event listeners:', error);
    }
    
    try {
      this.analyzeStorageData();
    } catch (error) {
      console.warn('Failed to analyze storage data:', error);
    }
    
    console.log('Salesforce Advisor: Initialization complete. Page type:', this.context.pageType);
  }

  // 🧠 ADVANCED PAGE ANALYSIS - Core Intelligence Method
  performAdvancedPageAnalysis() {
    try {
      // Initialize with empty objects to prevent undefined errors
      this.pageStructure = {};
      this.semanticComponents = {};
      this.conversationalContext = {};
      
      // 1. PAGE CONTEXT ACCESS - Comprehensive page data extraction
      try {
        this.pageStructure = this.extractPageStructure();
      } catch (error) {
        console.warn('Page structure extraction failed:', error);
        this.pageStructure = {};
      }
      
      // 2. SEMANTIC PARSING - Understand component relationships and functions
      try {
        this.semanticComponents = this.performSemanticParsing();
      } catch (error) {
        console.warn('Semantic parsing failed:', error);
        this.semanticComponents = {};
      }
      
      // 3. KNOWLEDGE MATCHING - Match with Salesforce domain knowledge
      let knowledgeContext = {};
      try {
        knowledgeContext = this.knowledgeBase.matchPageContext(this.pageStructure, this.semanticComponents);
      } catch (error) {
        console.warn('Knowledge matching failed:', error);
        knowledgeContext = {};
      }
      
      // 4. CONVERSATIONAL FRAMING - Prepare context for natural dialogue
      try {
        this.conversationalContext = this.buildConversationalFraming(knowledgeContext);
      } catch (error) {
        console.warn('Conversational framing failed:', error);
        this.conversationalContext = {};
      }
      
      // Enhanced context detection with all intelligence layers
      this.detectContext();
      
    } catch (error) {
      console.warn('Advanced page analysis failed, falling back to basic detection:', error);
      this.detectContext(); // Fallback to basic detection
    }
  }

  // 📊 PAGE CONTEXT ACCESS - Extract comprehensive page data
  extractPageStructure() {
    const structure = {
      // Navigation and layout patterns
      navigation: this.extractNavigationStructure(),
      
      // Content organization
      layout: this.extractLayoutPatterns(),
      
      // Interactive elements
      interactions: this.extractInteractiveElements(),
      
      // Data patterns
      dataStructures: this.extractDataStructures(),
      
      // Visual hierarchy
      visualHierarchy: this.extractVisualHierarchy(),
      
      // Accessibility patterns
      accessibility: this.extractAccessibilityPatterns()
    };

    return structure;
  }

  extractNavigationStructure() {
    const nav = {
      breadcrumbs: [],
      tabs: [],
      menus: [],
      contextualActions: []
    };

    // Extract breadcrumbs with enhanced detection
    const breadcrumbSelectors = [
      '.slds-breadcrumb',
      '.breadcrumb',
      '[role="navigation"] ol',
      '.navBreadCrumb'
    ];

    breadcrumbSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const items = Array.from(el.querySelectorAll('li, a, span')).map(item => ({
          text: item.textContent.trim(),
          href: item.href || null,
          active: item.classList.contains('active') || item.classList.contains('slds-is-active')
        })).filter(item => item.text);
        
        if (items.length > 0) nav.breadcrumbs.push(...items);
      });
    });

    // Extract tabs with context
    const tabSelectors = [
      '.slds-tabs_default__item',
      '.tabHeader',
      '.slds-vertical-tabs__nav-item'
    ];

    tabSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        nav.tabs.push({
          text: el.textContent.trim(),
          active: el.classList.contains('slds-is-active') || el.classList.contains('active'),
          href: el.querySelector('a')?.href || null
        });
      });
    });

    // Extract contextual actions (buttons, links in headers)
    const actionSelectors = [
      '.slds-page-header__detail-row button',
      '.pageDescription .btn',
      '.slds-button-group .slds-button'
    ];

    actionSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        nav.contextualActions.push({
          text: el.textContent.trim() || el.title || el.getAttribute('aria-label'),
          type: el.className,
          disabled: el.disabled
        });
      });
    });

    return nav;
  }

  extractLayoutPatterns() {
    const layout = {
      pageType: this.identifyPageLayoutType(),
      sections: this.identifyPageSections(),
      panels: this.identifyPanels(),
      modals: this.identifyModals()
    };

    return layout;
  }

  identifyPageLayoutType() {
    // Identify specific Salesforce page layout patterns
    if (document.querySelector('.slds-page-header')) return 'lightning-record';
    if (document.querySelector('.setupTab')) return 'setup-page';
    if (document.querySelector('.listViewport')) return 'list-view';
    if (document.querySelector('.forceRecordLayout')) return 'record-detail';
    if (document.querySelector('.flowContainer')) return 'flow-screen';
    if (document.querySelector('.reportBuilder')) return 'report-builder';
    if (document.querySelector('.dashboardContainer')) return 'dashboard';
    
    return 'unknown';
  }

  identifyPageSections() {
    const sections = [];
    
    // Lightning sections
    const lightningSelectors = [
      '.slds-section',
      '.slds-card',
      '.slds-panel',
      '.record-body-container section'
    ];

    lightningSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const header = el.querySelector('.slds-section__title, .slds-card__header, h1, h2, h3');
        sections.push({
          title: header?.textContent?.trim() || 'Untitled Section',
          type: selector.replace('.', ''),
          expanded: !el.classList.contains('slds-is-collapsed'),
          fieldCount: el.querySelectorAll('input, select, textarea').length
        });
      });
    });

    return sections;
  }

  identifyPanels() {
    const panels = [];
    
    const panelSelectors = [
      '.slds-split-view',
      '.slds-panel',
      '.sidebar',
      '.rightPanel'
    ];

    panelSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        panels.push({
          type: selector.replace('.', ''),
          visible: el.offsetParent !== null,
          content: el.textContent.substring(0, 100) + '...'
        });
      });
    });

    return panels;
  }

  identifyModals() {
    const modals = [];
    
    const modalSelectors = [
      '.slds-modal',
      '.modal',
      '[role="dialog"]'
    ];

    modalSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.offsetParent !== null) { // visible
          modals.push({
            title: el.querySelector('.slds-modal__title, .modal-title')?.textContent?.trim(),
            type: selector.replace('.', ''),
            size: el.classList.contains('slds-modal_large') ? 'large' : 'medium'
          });
        }
      });
    });

    return modals;
  }

  extractInteractiveElements() {
    const interactions = {
      forms: this.analyzeFormStructures(),
      buttons: this.categorizeButtons(),
      links: this.categorizeLinks(),
      inputs: this.analyzeInputPatterns()
    };

    return interactions;
  }

  analyzeFormStructures() {
    const forms = [];
    
    document.querySelectorAll('form, .slds-form, .record-form').forEach(form => {
      const formAnalysis = {
        id: form.id || 'unnamed-form',
        sections: [],
        totalFields: 0,
        requiredFields: 0,
        completedFields: 0,
        validationErrors: 0
      };

      // Analyze form sections
      const sections = form.querySelectorAll('.slds-section, .pbSubsection, fieldset');
      sections.forEach(section => {
        const sectionHeader = section.querySelector('.slds-section__title, legend, .pbSubheader');
        const sectionFields = section.querySelectorAll('input, select, textarea');
        
        formAnalysis.sections.push({
          title: sectionHeader?.textContent?.trim() || 'Untitled Section',
          fieldCount: sectionFields.length,
          fields: Array.from(sectionFields).map(field => ({
            label: this.findFieldLabel(field),
            type: field.type || field.tagName.toLowerCase(),
            required: field.required || field.hasAttribute('aria-required'),
            hasValue: !!field.value,
            hasError: field.closest('.slds-has-error, .requiredInput.requiredBlock') !== null
          }))
        });
      });

      // Calculate totals
      formAnalysis.totalFields = form.querySelectorAll('input, select, textarea').length;
      formAnalysis.requiredFields = form.querySelectorAll('[required], [aria-required="true"]').length;
      formAnalysis.completedFields = Array.from(form.querySelectorAll('input, select, textarea'))
        .filter(field => field.value && field.value.trim()).length;
      formAnalysis.validationErrors = form.querySelectorAll('.slds-has-error, .requiredInput.requiredBlock').length;

      if (formAnalysis.totalFields > 0) {
        forms.push(formAnalysis);
      }
    });

    return forms;
  }

  categorizeButtons() {
    const buttons = {
      primary: [],
      secondary: [],
      destructive: [],
      utility: []
    };

    document.querySelectorAll('button, .slds-button, input[type="button"], input[type="submit"]').forEach(btn => {
      const text = btn.textContent.trim() || btn.value || btn.title;
      const buttonInfo = {
        text: text,
        disabled: btn.disabled,
        type: btn.type || 'button'
      };

      // Categorize by class and text content
      if (btn.classList.contains('slds-button_brand') || btn.classList.contains('btn-primary') || 
          text.toLowerCase().includes('save') || text.toLowerCase().includes('submit')) {
        buttons.primary.push(buttonInfo);
      } else if (btn.classList.contains('slds-button_destructive') || btn.classList.contains('btn-danger') ||
                 text.toLowerCase().includes('delete') || text.toLowerCase().includes('remove')) {
        buttons.destructive.push(buttonInfo);
      } else if (text.toLowerCase().includes('cancel') || text.toLowerCase().includes('close') ||
                 btn.classList.contains('slds-button_neutral')) {
        buttons.secondary.push(buttonInfo);
      } else {
        buttons.utility.push(buttonInfo);
      }
    });

    return buttons;
  }

  categorizeLinks() {
    const links = {
      navigation: [],
      external: [],
      records: [],
      setup: []
    };

    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.href;
      const text = link.textContent.trim();
      
      const linkInfo = {
        text: text,
        href: href,
        external: !href.includes(window.location.hostname)
      };

      if (href.includes('/setup/')) {
        links.setup.push(linkInfo);
      } else if (href.match(/\/[a-zA-Z0-9]{15,18}(?:\/|$)/)) {
        links.records.push(linkInfo);
      } else if (linkInfo.external) {
        links.external.push(linkInfo);
      } else {
        links.navigation.push(linkInfo);
      }
    });

    return links;
  }

  analyzeInputPatterns() {
    const patterns = {
      lookups: [],
      picklists: [],
      textFields: [],
      dateFields: [],
      numberFields: []
    };

    document.querySelectorAll('input, select, textarea').forEach(input => {
      const label = this.findFieldLabel(input);
      const inputInfo = {
        label: label,
        type: input.type || input.tagName.toLowerCase(),
        required: input.required || input.hasAttribute('aria-required'),
        hasValue: !!input.value
      };

      // Categorize by type and patterns
      if (input.classList.contains('slds-combobox__input') || 
          input.closest('.slds-combobox') ||
          label.toLowerCase().includes('lookup')) {
        patterns.lookups.push(inputInfo);
      } else if (input.tagName.toLowerCase() === 'select' || 
                 input.classList.contains('slds-select')) {
        patterns.picklists.push(inputInfo);
      } else if (input.type === 'date' || input.type === 'datetime-local') {
        patterns.dateFields.push(inputInfo);
      } else if (input.type === 'number' || input.type === 'tel') {
        patterns.numberFields.push(inputInfo);
      } else {
        patterns.textFields.push(inputInfo);
      }
    });

    return patterns;
  }

  extractDataStructures() {
    const data = {
      tables: this.analyzeTableStructures(),
      lists: this.analyzeListStructures(),
      records: this.analyzeRecordStructures()
    };

    return data;
  }

  analyzeTableStructures() {
    const tables = [];
    
    document.querySelectorAll('table, .slds-table').forEach(table => {
      const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
      const rowCount = table.querySelectorAll('tbody tr, .slds-table tbody tr').length;
      
      if (headers.length > 0) {
        tables.push({
          headers: headers,
          rowCount: rowCount,
          sortable: table.querySelectorAll('.slds-is-sortable').length > 0,
          selectable: table.querySelectorAll('input[type="checkbox"]').length > 0
        });
      }
    });

    return tables;
  }

  analyzeListStructures() {
    const lists = [];
    
    const listSelectors = [
      '.slds-list_vertical',
      '.slds-list_horizontal',
      '.listViewport',
      'ul.slds-list'
    ];

    listSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const items = el.querySelectorAll('li, .listItem').length;
        if (items > 0) {
          lists.push({
            type: selector.replace('.', ''),
            itemCount: items,
            hasActions: el.querySelectorAll('button, .slds-button').length > 0
          });
        }
      });
    });

    return lists;
  }

  analyzeRecordStructures() {
    const records = [];
    
    // Analyze record detail layouts
    const recordLayouts = document.querySelectorAll('.record-body-container, .forceRecordLayout');
    recordLayouts.forEach(layout => {
      const fields = layout.querySelectorAll('.slds-form-element, .dataCol');
      records.push({
        type: 'detail-layout',
        fieldCount: fields.length,
        sections: layout.querySelectorAll('.slds-section, .detailList').length
      });
    });

    return records;
  }

  extractVisualHierarchy() {
    const hierarchy = {
      headers: this.extractHeaderHierarchy(),
      emphasis: this.extractEmphasisPatterns(),
      spacing: this.extractSpacingPatterns()
    };

    return hierarchy;
  }

  extractHeaderHierarchy() {
    const headers = [];
    
    document.querySelectorAll('h1, h2, h3, h4, h5, h6, .slds-page-header__title, .slds-section__title').forEach(header => {
      headers.push({
        level: header.tagName.toLowerCase(),
        text: header.textContent.trim(),
        visible: header.offsetParent !== null
      });
    });

    return headers;
  }

  extractEmphasisPatterns() {
    const emphasis = {
      required: document.querySelectorAll('.slds-required, .requiredInput').length,
      errors: document.querySelectorAll('.slds-has-error, .error').length,
      warnings: document.querySelectorAll('.slds-notify_warning, .warning').length,
      success: document.querySelectorAll('.slds-notify_success, .success').length
    };

    return emphasis;
  }

  extractSpacingPatterns() {
    const spacing = {
      sections: document.querySelectorAll('.slds-section').length,
      cards: document.querySelectorAll('.slds-card').length,
      panels: document.querySelectorAll('.slds-panel').length
    };

    return spacing;
  }

  extractAccessibilityPatterns() {
    const accessibility = {
      landmarks: this.extractLandmarks(),
      labels: this.extractLabelPatterns(),
      focus: this.extractFocusPatterns()
    };

    return accessibility;
  }

  extractLandmarks() {
    const landmarks = [];
    
    document.querySelectorAll('[role]').forEach(el => {
      landmarks.push({
        role: el.getAttribute('role'),
        label: el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')
      });
    });

    return landmarks;
  }

  extractLabelPatterns() {
    const labels = {
      explicit: document.querySelectorAll('label[for]').length,
      implicit: document.querySelectorAll('label input, label select, label textarea').length,
      aria: document.querySelectorAll('[aria-label], [aria-labelledby]').length
    };

    return labels;
  }

  extractFocusPatterns() {
    const focus = {
      focusable: document.querySelectorAll('button, input, select, textarea, a[href], [tabindex]').length,
      currentFocus: document.activeElement ? {
        tagName: document.activeElement.tagName,
        id: document.activeElement.id,
        className: document.activeElement.className
      } : null
    };

    return focus;
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
    const title = document.title;
    const pageContent = document.body.textContent || '';

    // Enhanced page type detection with more specificity
    if (url.includes('lightning.force.com') || url.includes('/lightning/')) {
      // Setup pages with enhanced detection
      if (pathname.includes('/setup/')) {
        // User management pages
        if (pathname.includes('/Users/') || title.includes('Users') || url.includes('ManageUsers')) {
          // Enhanced detection for New User forms (both Lightning and Classic)
          const isNewUserForm =
            url.includes('/new') ||
            pageContent.includes('New User') ||
            title.includes('New User') ||
            document.querySelector('h1, h2, .slds-page-header__title, .pageDescription')?.textContent?.includes('New User') ||
            document.querySelector('.pbHeader')?.textContent?.includes('New User') ||
            // Classic Salesforce form detection
            (document.querySelector('input[name*="first"], input[name*="last"], input[name*="username"]') &&
              document.querySelector('.pbSubheader, .pbHeader')?.textContent?.includes('User'));

          if (isNewUserForm) {
            console.log('Salesforce Advisor: Detected New User Creation form');
            return 'Setup - New User Creation';
          }

          if (url.includes('/edit') || pageContent.includes('Edit User')) {
            return 'Setup - Edit User';
          }
          return 'Setup - User Management';
        }

        // Object Manager
        if (pathname.includes('/ObjectManager/') || title.includes('Object Manager')) {
          if (pathname.includes('/FieldsAndRelationships/') || pageContent.includes('Fields & Relationships')) {
            return 'Setup - Object Fields';
          }
          return 'Setup - Object Manager';
        }

        // Flow Builder
        if (pathname.includes('/FlowDefinitionView/') || title.includes('Flow')) {
          if (pageContent.includes('New Flow') || url.includes('/new')) {
            return 'Setup - New Flow Creation';
          }
          return 'Setup - Flow Builder';
        }

        // Other Setup pages
        if (pathname.includes('/ApexClasses/')) return 'Setup - Apex Classes';
        if (pathname.includes('/CustomLabels/')) return 'Setup - Custom Labels';
        if (pathname.includes('/PermSets/') || title.includes('Permission Set')) return 'Setup - Permission Sets';
        if (pathname.includes('/Profiles/') || title.includes('Profile')) return 'Setup - Profiles';
        if (pathname.includes('/CustomSettings/') || title.includes('Custom Setting')) return 'Setup - Custom Settings';

        return 'Setup Home';
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

    // Enhanced form field selectors for both Lightning and Classic Salesforce
    const formSelectors = [
      // Lightning components
      'lightning-input',
      'lightning-combobox',
      'lightning-textarea',
      'lightning-dual-listbox',
      'lightning-radio-group',
      'lightning-checkbox-group',
      'c-lookup', // Custom lookup components
      '[data-field-label]', // Setup form fields
      '.slds-form-element', // SLDS form elements
      '.forceInputField', // Force input fields
      '.uiInput', // UI input fields

      // Classic Salesforce form elements
      '.requiredInput', // Required input fields
      '.dataCol', // Classic form fields
      '.pbSubsection input', // Page block subsection inputs
      '.detailList input', // Detail list inputs
      'table.detailList input', // Table-based form inputs
      'tr input', // Table row inputs (common in Setup)
      'td input', // Table cell inputs
    ];

    formSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const label = this.extractFieldLabel(element);
        const type = this.extractFieldType(element);
        const required = this.isFieldRequired(element);
        const value = this.extractFieldValue(element);

        if (label && !this.isSearchField(label)) {
          fields.push({
            label: label,
            type: type,
            required: required,
            value: value
          });
        }
      });
    });

    // Extract standard form inputs with better label detection
    const standardInputs = document.querySelectorAll('input, select, textarea');
    standardInputs.forEach(input => {
      // Skip if already captured
      if (fields.some(f => f.element === input)) return;

      const label = this.findFieldLabel(input);
      const type = input.type || input.tagName.toLowerCase();
      const required = input.hasAttribute('required') || input.getAttribute('aria-required') === 'true' ||
        input.closest('tr')?.textContent?.includes('*');
      const value = input.value || '';

      if (label && !this.isSearchField(label)) {
        fields.push({
          label: label,
          type: type,
          required: required,
          value: value ? '[HAS_VALUE]' : '', // Privacy-safe value indication
          element: input
        });
      }
    });

    // Debug logging for field detection
    if (fields.length > 0) {
      console.log('Salesforce Advisor: Detected', fields.length, 'form fields:', fields.map(f => f.label));
    }

    return fields.slice(0, 25); // Increased limit for Setup forms
  }

  extractFieldLabel(element) {
    // Try multiple methods to get field label
    let label = '';

    // Method 1: Direct attributes
    label = element.getAttribute('label') ||
      element.getAttribute('field-label') ||
      element.getAttribute('data-field-label') ||
      element.getAttribute('aria-label');

    if (label) return label;

    // Method 2: Associated label element
    const labelElement = element.closest('.slds-form-element')?.querySelector('label, .slds-form-element__label, .labelCol');
    if (labelElement) {
      label = labelElement.textContent?.trim();
    }

    if (label) return label;

    // Method 3: Parent container label
    const parentLabel = element.closest('[data-field-label]')?.getAttribute('data-field-label');
    if (parentLabel) return parentLabel;

    // Method 4: Preceding label
    const prevLabel = element.previousElementSibling?.textContent?.trim();
    if (prevLabel && prevLabel.length < 50) return prevLabel;

    return '';
  }

  extractFieldType(element) {
    const tagName = element.tagName.toLowerCase();

    if (tagName.includes('lightning-')) {
      return tagName.replace('lightning-', '');
    }

    return element.type || tagName;
  }

  isFieldRequired(element) {
    return element.hasAttribute('required') ||
      element.getAttribute('required') === 'true' ||
      element.getAttribute('aria-required') === 'true' ||
      element.closest('.slds-is-required, .requiredInput') !== null;
  }

  extractFieldValue(element) {
    // Don't extract actual values for privacy - just indicate if field has content
    const value = element.value || element.getAttribute('value') || '';
    return value ? '[HAS_VALUE]' : '';
  }

  isSearchField(label) {
    const searchTerms = ['search', 'filter', 'find', 'lookup'];
    return searchTerms.some(term => label.toLowerCase().includes(term));
  }

  findFieldLabel(input) {
    // Enhanced label finding for standard inputs
    const id = input.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent.trim();
    }

    // Look for nearby labels in various Salesforce form structures
    const parent = input.closest('.slds-form-element, .requiredInput, .dataCol, tr, .pbSubsection');
    if (parent) {
      const label = parent.querySelector('label, .labelCol, .dataLabel, th');
      if (label) return label.textContent.trim();
    }

    // Classic Salesforce: Look for label in same table row
    const tableRow = input.closest('tr');
    if (tableRow) {
      const labelCell = tableRow.querySelector('td:first-child, th:first-child, .labelCol');
      if (labelCell) {
        const labelText = labelCell.textContent.trim();
        // Remove asterisks and other formatting
        return labelText.replace(/\*|\s*\*\s*/g, '').trim();
      }
    }

    // Look for preceding label text
    const prevElement = input.previousElementSibling;
    if (prevElement && prevElement.textContent) {
      const labelText = prevElement.textContent.trim();
      if (labelText.length < 50 && !labelText.includes('input')) {
        return labelText.replace(/\*|\s*\*\s*/g, '').trim();
      }
    }

    // Check aria-label
    const ariaLabel = input.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Last resort: look for any text content in parent elements
    let currentElement = input.parentElement;
    for (let i = 0; i < 3 && currentElement; i++) {
      const textNodes = Array.from(currentElement.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent.trim())
        .filter(text => text.length > 0 && text.length < 50);

      if (textNodes.length > 0) {
        return textNodes[0].replace(/\*|\s*\*\s*/g, '').trim();
      }
      currentElement = currentElement.parentElement;
    }

    return '';
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

  // 🔍 SEMANTIC PARSING - Understand component relationships and functions
  performSemanticParsing() {
    const semantic = {
      pageIntent: this.identifyPageIntent(),
      userJourney: this.identifyUserJourney(),
      workflowStage: this.identifyWorkflowStage(),
      contextualRelationships: this.identifyContextualRelationships(),
      functionalGroups: this.identifyFunctionalGroups()
    };

    return semantic;
  }

  identifyPageIntent() {
    const url = window.location.href;
    const title = document.title;
    const pageContent = document.body.textContent || '';

    // Analyze URL patterns for intent
    if (url.includes('/new') || title.includes('New ') || pageContent.includes('Create ')) {
      return 'create';
    } else if (url.includes('/edit') || title.includes('Edit ') || document.querySelector('[data-action="edit"]')) {
      return 'edit';
    } else if (url.includes('/list') || title.includes(' List') || document.querySelector('.listViewport')) {
      return 'browse';
    } else if (url.includes('/setup/') || title.includes('Setup')) {
      return 'configure';
    } else if (document.querySelector('.slds-modal, [role="dialog"]')) {
      return 'interact';
    } else if (document.querySelector('table, .slds-table')) {
      return 'analyze';
    }

    return 'view';
  }

  identifyUserJourney() {
    const journey = {
      stage: 'unknown',
      progress: 0,
      nextSteps: []
    };

    // Analyze form completion for journey stage
    const forms = document.querySelectorAll('form, .slds-form');
    if (forms.length > 0) {
      const totalFields = document.querySelectorAll('input, select, textarea').length;
      const filledFields = Array.from(document.querySelectorAll('input, select, textarea'))
        .filter(field => field.value && field.value.trim()).length;
      
      journey.progress = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
      
      if (journey.progress === 0) {
        journey.stage = 'starting';
        journey.nextSteps = ['Fill required fields', 'Review field requirements'];
      } else if (journey.progress < 50) {
        journey.stage = 'in-progress';
        journey.nextSteps = ['Complete remaining fields', 'Validate entries'];
      } else if (journey.progress < 100) {
        journey.stage = 'nearly-complete';
        journey.nextSteps = ['Complete final fields', 'Review and save'];
      } else {
        journey.stage = 'ready-to-submit';
        journey.nextSteps = ['Review entries', 'Save record'];
      }
    }

    // Analyze navigation breadcrumbs for journey context
    const breadcrumbs = document.querySelectorAll('.slds-breadcrumb li, .breadcrumb li');
    if (breadcrumbs.length > 0) {
      journey.navigationDepth = breadcrumbs.length;
      journey.currentLocation = Array.from(breadcrumbs).pop()?.textContent?.trim();
    }

    return journey;
  }

  identifyWorkflowStage() {
    const workflow = {
      type: 'unknown',
      stage: 'unknown',
      availableActions: []
    };

    // Identify workflow type from page context
    if (document.querySelector('.flowContainer, .flow-screen')) {
      workflow.type = 'flow';
      workflow.stage = this.identifyFlowStage();
    } else if (document.querySelector('.approvalHistory, .processInstance')) {
      workflow.type = 'approval';
      workflow.stage = this.identifyApprovalStage();
    } else if (document.querySelector('.record-form, .slds-form')) {
      workflow.type = 'data-entry';
      workflow.stage = this.identifyDataEntryStage();
    }

    // Extract available actions
    const actionButtons = document.querySelectorAll('button, .slds-button');
    workflow.availableActions = Array.from(actionButtons).map(btn => ({
      text: btn.textContent.trim(),
      type: btn.className,
      disabled: btn.disabled
    })).filter(action => action.text);

    return workflow;
  }

  identifyFlowStage() {
    if (document.querySelector('.flow-screen-start')) return 'start';
    if (document.querySelector('.flow-screen-finish')) return 'finish';
    if (document.querySelector('.flow-screen-decision')) return 'decision';
    return 'in-progress';
  }

  identifyApprovalStage() {
    const approvalText = document.body.textContent;
    if (approvalText.includes('Pending Approval')) return 'pending';
    if (approvalText.includes('Approved')) return 'approved';
    if (approvalText.includes('Rejected')) return 'rejected';
    return 'unknown';
  }

  identifyDataEntryStage() {
    const errors = document.querySelectorAll('.slds-has-error, .error').length;
    const requiredEmpty = document.querySelectorAll('[required]:invalid, [aria-required="true"]:invalid').length;
    
    if (errors > 0) return 'validation-errors';
    if (requiredEmpty > 0) return 'incomplete-required';
    return 'ready';
  }

  identifyContextualRelationships() {
    const relationships = {
      parentChild: this.identifyParentChildRelationships(),
      masterDetail: this.identifyMasterDetailRelationships(),
      lookup: this.identifyLookupRelationships(),
      relatedLists: this.identifyRelatedLists()
    };

    return relationships;
  }

  identifyParentChildRelationships() {
    const relationships = [];
    
    // Look for hierarchical navigation patterns
    const breadcrumbs = document.querySelectorAll('.slds-breadcrumb a, .breadcrumb a');
    breadcrumbs.forEach((crumb, index) => {
      if (index > 0) {
        relationships.push({
          parent: breadcrumbs[index - 1].textContent.trim(),
          child: crumb.textContent.trim(),
          type: 'navigation'
        });
      }
    });

    return relationships;
  }

  identifyMasterDetailRelationships() {
    const relationships = [];
    
    // Look for master-detail indicators in forms
    const detailSections = document.querySelectorAll('.slds-section[data-target-reveals]');
    detailSections.forEach(section => {
      const title = section.querySelector('.slds-section__title')?.textContent?.trim();
      if (title) {
        relationships.push({
          master: 'current-record',
          detail: title,
          type: 'master-detail'
        });
      }
    });

    return relationships;
  }

  identifyLookupRelationships() {
    const relationships = [];
    
    // Identify lookup fields
    const lookupFields = document.querySelectorAll('.slds-combobox, [data-lookup]');
    lookupFields.forEach(field => {
      const label = this.findFieldLabel(field);
      if (label) {
        relationships.push({
          field: label,
          type: 'lookup',
          required: field.hasAttribute('required') || field.hasAttribute('aria-required')
        });
      }
    });

    return relationships;
  }

  identifyRelatedLists() {
    const relatedLists = [];
    
    // Look for related list sections
    const relatedSections = document.querySelectorAll('.slds-card[data-aura-class*="related"], .relatedListContainer');
    relatedSections.forEach(section => {
      const title = section.querySelector('.slds-card__header-title, .relatedListTitle')?.textContent?.trim();
      const recordCount = section.querySelectorAll('tbody tr, .dataRow').length;
      
      if (title) {
        relatedLists.push({
          title: title,
          recordCount: recordCount,
          hasNewButton: section.querySelector('[title*="New"], [data-action="new"]') !== null
        });
      }
    });

    return relatedLists;
  }

  identifyFunctionalGroups() {
    const groups = {
      dataEntry: this.identifyDataEntryGroups(),
      navigation: this.identifyNavigationGroups(),
      actions: this.identifyActionGroups(),
      information: this.identifyInformationGroups()
    };

    return groups;
  }

  identifyDataEntryGroups() {
    const groups = [];
    
    // Group form fields by sections
    const sections = document.querySelectorAll('.slds-section, fieldset, .pbSubsection');
    sections.forEach(section => {
      const title = section.querySelector('.slds-section__title, legend, .pbSubheader')?.textContent?.trim();
      const fields = section.querySelectorAll('input, select, textarea');
      
      if (fields.length > 0) {
        groups.push({
          title: title || 'Untitled Section',
          fieldCount: fields.length,
          requiredFields: section.querySelectorAll('[required], [aria-required="true"]').length,
          completedFields: Array.from(fields).filter(f => f.value && f.value.trim()).length
        });
      }
    });

    return groups;
  }

  identifyNavigationGroups() {
    const groups = [];
    
    // Identify navigation menus and tabs
    const navElements = document.querySelectorAll('.slds-tabs, .slds-vertical-tabs, .navMenu');
    navElements.forEach(nav => {
      const items = nav.querySelectorAll('li, .slds-tabs__item, .navItem');
      groups.push({
        type: nav.className.includes('vertical') ? 'vertical-tabs' : 'horizontal-tabs',
        itemCount: items.length,
        activeItem: nav.querySelector('.slds-is-active, .active')?.textContent?.trim()
      });
    });

    return groups;
  }

  identifyActionGroups() {
    const groups = [];
    
    // Group buttons by containers
    const buttonContainers = document.querySelectorAll('.slds-button-group, .slds-page-header__detail-row, .modal-footer');
    buttonContainers.forEach(container => {
      const buttons = container.querySelectorAll('button, .slds-button');
      if (buttons.length > 0) {
        groups.push({
          location: container.className.includes('header') ? 'page-header' : 
                   container.className.includes('modal') ? 'modal-footer' : 'button-group',
          buttonCount: buttons.length,
          primaryActions: container.querySelectorAll('.slds-button_brand, .btn-primary').length,
          destructiveActions: container.querySelectorAll('.slds-button_destructive, .btn-danger').length
        });
      }
    });

    return groups;
  }

  identifyInformationGroups() {
    const groups = [];
    
    // Identify information display patterns
    const infoContainers = document.querySelectorAll('.slds-card, .slds-panel, .infoSection');
    infoContainers.forEach(container => {
      const title = container.querySelector('.slds-card__header-title, .slds-panel__header, h1, h2, h3')?.textContent?.trim();
      const hasData = container.querySelectorAll('.slds-form-element_readonly, .dataCol').length > 0;
      
      if (title && hasData) {
        groups.push({
          title: title,
          type: container.className.includes('card') ? 'card' : 'panel',
          fieldCount: container.querySelectorAll('.slds-form-element, .dataCol').length
        });
      }
    });

    return groups;
  }

  // 🎯 CONVERSATIONAL FRAMING - Prepare context for natural dialogue
  buildConversationalFraming(knowledgeContext) {
    const framing = {
      userLevel: this.assessUserLevel(),
      contextualTone: this.determineContextualTone(),
      responseStyle: this.determineResponseStyle(),
      priorityFocus: this.determinePriorityFocus(),
      suggestedQuestions: this.generateSuggestedQuestions(knowledgeContext)
    };

    return framing;
  }

  assessUserLevel() {
    // Assess user expertise level based on page complexity and navigation patterns
    const setupPages = document.querySelector('.setupTab, .setup') !== null;
    const advancedFeatures = document.querySelectorAll('.apex, .flow, .validation, .trigger').length > 0;
    const basicOperations = document.querySelectorAll('input, select, .slds-button').length > 0;

    if (setupPages && advancedFeatures) return 'advanced';
    if (setupPages || advancedFeatures) return 'intermediate';
    if (basicOperations) return 'beginner';
    return 'unknown';
  }

  determineContextualTone() {
    const errors = document.querySelectorAll('.slds-has-error, .error').length;
    const warnings = document.querySelectorAll('.slds-notify_warning, .warning').length;
    const success = document.querySelectorAll('.slds-notify_success, .success').length;

    if (errors > 0) return 'supportive-problem-solving';
    if (warnings > 0) return 'cautious-guidance';
    if (success > 0) return 'encouraging-next-steps';
    return 'informative-helpful';
  }

  determineResponseStyle() {
    const pageType = this.context.pageType || '';
    
    if (pageType.includes('Setup')) return 'step-by-step-configuration';
    if (pageType.includes('New ') || pageType.includes('Create')) return 'guided-creation';
    if (pageType.includes('Edit')) return 'focused-modification';
    if (pageType.includes('List')) return 'overview-and-navigation';
    return 'contextual-explanation';
  }

  determinePriorityFocus() {
    const focus = [];
    
    // Prioritize based on current page state
    const errors = document.querySelectorAll('.slds-has-error, .error').length;
    const requiredEmpty = document.querySelectorAll('[required]:invalid, [aria-required="true"]:invalid').length;
    const modals = document.querySelectorAll('.slds-modal[style*="block"], .modal[style*="block"]').length;

    if (errors > 0) focus.push('error-resolution');
    if (requiredEmpty > 0) focus.push('required-field-completion');
    if (modals > 0) focus.push('modal-interaction');
    
    // Add workflow-based focus
    const saveButtons = document.querySelectorAll('button[title*="Save"], .slds-button[title*="Save"]').length;
    const submitButtons = document.querySelectorAll('input[type="submit"], button[type="submit"]').length;
    
    if (saveButtons > 0 || submitButtons > 0) focus.push('completion-guidance');
    
    return focus.length > 0 ? focus : ['general-assistance'];
  }

  generateSuggestedQuestions(knowledgeContext) {
    const questions = [];
    const pageType = this.context.pageType || '';
    
    // Generate contextual questions based on page type and knowledge
    if (pageType.includes('New User Creation')) {
      questions.push(
        "What are the required fields for creating a new user?",
        "How do I set up the right profile and permissions?",
        "What's the difference between Standard and Custom profiles?"
      );
    } else if (pageType.includes('Setup')) {
      questions.push(
        "What does this setup page control?",
        "What are the best practices for this configuration?",
        "How will this change affect my users?"
      );
    } else if (pageType.includes('Record')) {
      questions.push(
        "Help me fill out this form correctly",
        "What do these fields mean?",
        "Are there any validation rules I should know about?"
      );
    } else {
      questions.push(
        "What can I do on this page?",
        "Explain what I'm looking at",
        "What are my next steps?"
      );
    }

    return questions;
  }
}

// 📚 SALESFORCE KNOWLEDGE BASE - Domain expertise and pattern matching
class SalesforceKnowledgeBase {
  constructor() {
    this.objectPatterns = this.initializeObjectPatterns();
    this.setupPatterns = this.initializeSetupPatterns();
    this.workflowPatterns = this.initializeWorkflowPatterns();
    this.bestPractices = this.initializeBestPractices();
  }

  // 🎯 KNOWLEDGE MATCHING - Match page context with domain expertise
  matchPageContext(pageStructure, semanticComponents) {
    const context = {
      objectType: this.identifyObjectType(pageStructure),
      setupArea: this.identifySetupArea(pageStructure),
      workflowType: this.identifyWorkflowType(semanticComponents),
      bestPractices: this.getRelevantBestPractices(pageStructure, semanticComponents),
      commonIssues: this.identifyCommonIssues(pageStructure, semanticComponents),
      nextSteps: this.suggestNextSteps(pageStructure, semanticComponents)
    };

    return context;
  }

  identifyObjectType(pageStructure) {
    const url = window.location.href;
    const title = document.title;
    
    // Standard objects
    const standardObjects = {
      'Account': ['account', 'accounts'],
      'Contact': ['contact', 'contacts'],
      'Lead': ['lead', 'leads'],
      'Opportunity': ['opportunity', 'opportunities'],
      'Case': ['case', 'cases'],
      'User': ['user', 'users', 'manageusers'],
      'Profile': ['profile', 'profiles'],
      'Permission Set': ['permissionset', 'permsets'],
      'Role': ['role', 'roles'],
      'Custom Object': ['customobject', 'custom']
    };

    for (const [objectName, patterns] of Object.entries(standardObjects)) {
      for (const pattern of patterns) {
        if (url.toLowerCase().includes(pattern) || title.toLowerCase().includes(pattern)) {
          return {
            name: objectName,
            type: 'standard',
            patterns: this.objectPatterns[objectName] || {}
          };
        }
      }
    }

    return { name: 'Unknown', type: 'unknown', patterns: {} };
  }

  identifySetupArea(pageStructure) {
    const url = window.location.href;
    const setupAreas = {
      'User Management': ['users', 'profiles', 'permissionsets', 'roles'],
      'Object Manager': ['objectmanager', 'customobject', 'fields'],
      'Process Automation': ['flow', 'workflow', 'processbuilder', 'approval'],
      'Security': ['security', 'sharing', 'fieldlevel'],
      'Data Management': ['dataloader', 'import', 'export'],
      'Development': ['apex', 'visualforce', 'lightning', 'sandbox'],
      'Integration': ['api', 'connected', 'external'],
      'Administration': ['company', 'organization', 'settings']
    };

    for (const [area, patterns] of Object.entries(setupAreas)) {
      for (const pattern of patterns) {
        if (url.toLowerCase().includes(pattern)) {
          return {
            name: area,
            patterns: this.setupPatterns[area] || {}
          };
        }
      }
    }

    return { name: 'Unknown', patterns: {} };
  }

  identifyWorkflowType(semanticComponents) {
    const intent = semanticComponents.pageIntent;
    const journey = semanticComponents.userJourney;
    
    const workflowTypes = {
      'Data Entry': intent === 'create' || intent === 'edit',
      'Configuration': intent === 'configure',
      'Analysis': intent === 'analyze',
      'Navigation': intent === 'browse',
      'Interaction': intent === 'interact'
    };

    for (const [type, condition] of Object.entries(workflowTypes)) {
      if (condition) {
        return {
          name: type,
          stage: journey.stage,
          patterns: this.workflowPatterns[type] || {}
        };
      }
    }

    return { name: 'Unknown', stage: 'unknown', patterns: {} };
  }

  getRelevantBestPractices(pageStructure, semanticComponents) {
    const practices = [];
    const objectType = this.identifyObjectType(pageStructure);
    const setupArea = this.identifySetupArea(pageStructure);
    
    // Add object-specific best practices
    if (this.bestPractices[objectType.name]) {
      practices.push(...this.bestPractices[objectType.name]);
    }
    
    // Add setup area best practices
    if (this.bestPractices[setupArea.name]) {
      practices.push(...this.bestPractices[setupArea.name]);
    }

    return practices;
  }

  identifyCommonIssues(pageStructure, semanticComponents) {
    const issues = [];
    
    // Check for common form issues
    if (semanticComponents.pageIntent === 'create' || semanticComponents.pageIntent === 'edit') {
      const forms = pageStructure.interactions.forms;
      forms.forEach(form => {
        if (form.validationErrors > 0) {
          issues.push({
            type: 'validation-error',
            description: 'Form has validation errors that need to be resolved',
            severity: 'high'
          });
        }
        
        if (form.requiredFields > form.completedFields) {
          issues.push({
            type: 'incomplete-required',
            description: 'Required fields are not completed',
            severity: 'medium'
          });
        }
      });
    }

    return issues;
  }

  suggestNextSteps(pageStructure, semanticComponents) {
    const steps = [];
    const intent = semanticComponents.pageIntent;
    const journey = semanticComponents.userJourney;
    
    // Suggest steps based on current context
    if (intent === 'create' && journey.stage === 'starting') {
      steps.push('Review required fields and gather necessary information');
      steps.push('Start with the most important fields first');
    } else if (intent === 'create' && journey.stage === 'in-progress') {
      steps.push('Complete remaining required fields');
      steps.push('Validate entries for accuracy');
    } else if (intent === 'create' && journey.stage === 'ready-to-submit') {
      steps.push('Review all entries for accuracy');
      steps.push('Save the record');
    }

    return steps;
  }

  initializeObjectPatterns() {
    return {
      'User': {
        requiredFields: ['First Name', 'Last Name', 'Email', 'Username', 'Profile'],
        commonIssues: ['Duplicate username', 'Invalid email format', 'Missing profile assignment'],
        bestPractices: ['Use consistent naming conventions', 'Assign appropriate profiles', 'Enable MFA']
      },
      'Account': {
        requiredFields: ['Account Name'],
        commonIssues: ['Duplicate account names', 'Missing account type'],
        bestPractices: ['Use consistent naming', 'Set account hierarchy', 'Define ownership rules']
      },
      'Contact': {
        requiredFields: ['Last Name'],
        commonIssues: ['Missing account association', 'Duplicate contacts'],
        bestPractices: ['Link to correct account', 'Use consistent data entry', 'Set up data quality rules']
      }
    };
  }

  initializeSetupPatterns() {
    return {
      'User Management': {
        commonTasks: ['Create users', 'Assign profiles', 'Set permissions', 'Manage roles'],
        bestPractices: ['Follow least privilege principle', 'Use permission sets for additional access', 'Regular access reviews']
      },
      'Object Manager': {
        commonTasks: ['Create fields', 'Set validation rules', 'Configure page layouts', 'Set field-level security'],
        bestPractices: ['Plan field strategy', 'Use consistent naming', 'Document customizations']
      }
    };
  }

  initializeWorkflowPatterns() {
    return {
      'Data Entry': {
        stages: ['preparation', 'entry', 'validation', 'completion'],
        bestPractices: ['Validate as you go', 'Use required field indicators', 'Save frequently']
      },
      'Configuration': {
        stages: ['planning', 'implementation', 'testing', 'deployment'],
        bestPractices: ['Test in sandbox first', 'Document changes', 'Train users']
      }
    };
  }

  initializeBestPractices() {
    return {
      'User': [
        'Always assign appropriate profiles and permission sets',
        'Use consistent username conventions',
        'Enable multi-factor authentication for security'
      ],
      'User Management': [
        'Follow the principle of least privilege',
        'Regularly review user access and permissions',
        'Use permission sets for temporary or additional access'
      ],
      'Object Manager': [
        'Plan your field strategy before creating fields',
        'Use consistent naming conventions',
        'Document all customizations for future reference'
      ]
    };
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
        // Add a small delay to ensure DOM is fully loaded
        setTimeout(() => {
          this.detectContext(); // Refresh context
          this.analyzeStorageData(); // Refresh storage analysis

          // Apply privacy filtering to all data before sending
          const filteredResponse = this.applyPrivacyFiltering({
            context: this.context,
            content: this.extractPageContent(),
            storage: this.storageData,
            enhanced: true, // Flag to indicate enhanced context
            // Enhanced contextual understanding data
            pageStructure: this.pageStructure,
            semanticComponents: this.semanticComponents,
            conversationalContext: this.conversationalContext,
            knowledgeContext: this.knowledgeBase ? this.knowledgeBase.matchPageContext(this.pageStructure, this.semanticComponents) : null
          });

          console.log('Salesforce Advisor: Sending context response:', {
            pageType: filteredResponse.context?.pageType,
            fieldCount: filteredResponse.content?.fields?.length || 0,
            fields: filteredResponse.content?.fields?.map(f => f.label) || []
          });

          sendResponse(filteredResponse);
        }, 100);
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

// Initialize the analyzer and make it globally accessible
try {
  window.salesforceContextAnalyzer = new SalesforceContextAnalyzer();
  console.log('Salesforce Context Analyzer initialized successfully');
} catch (error) {
  console.error('Failed to initialize Salesforce Context Analyzer:', error);
  
  // Create a minimal fallback analyzer
  window.salesforceContextAnalyzer = {
    context: {
      pageType: 'Unknown',
      userInterface: 'Unknown',
      errors: [],
      url: window.location.href,
      title: document.title
    },
    pageStructure: {},
    semanticComponents: {},
    conversationalContext: {},
    detectContext: function() {
      console.log('Using fallback context detection');
    }
  };
}

// Periodically update context for dynamic pages
setInterval(() => {
  if (window.salesforceContextAnalyzer) {
    window.salesforceContextAnalyzer.detectContext();
  }
}, 5000);