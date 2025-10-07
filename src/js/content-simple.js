// Simplified Salesforce Context Detector
class SalesforceContextAnalyzer {
  constructor() {
    this.context = {};
    this.pageStructure = {};
    this.semanticComponents = {};
    this.conversationalContext = {};
    
    // Initialize privacy filter
    try {
      this.privacyFilter = new PrivacyFilter();
    } catch (error) {
      console.warn('Privacy filter not available:', error);
      this.privacyFilter = null;
    }
    
    this.privacySettings = {
      removePII: true,
      removeSalesforceIds: false,
      removeSensitiveFields: true,
      maskingChar: '[FILTERED]'
    };

    this.init();
  }

  init() {
    console.log('Salesforce Advisor: Content script initializing on', window.location.href);
    
    try {
      this.detectContext();
      this.setupMessageListener();
      this.setupPageChangeDetection();
      console.log('Salesforce Advisor: Initialization complete. Page type:', this.context.pageType);
    } catch (error) {
      console.error('Initialization failed:', error);
    }
  }

  setupPageChangeDetection() {
    // Store current URL to detect changes
    this.currentUrl = window.location.href;
    
    // Method 1: Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', () => {
      this.handlePageChange();
    });

    // Method 2: Monitor URL changes for SPA navigation
    this.urlCheckInterval = setInterval(() => {
      if (window.location.href !== this.currentUrl) {
        this.handlePageChange();
      }
    }, 1000); // Check every second

    // Method 3: Listen for Salesforce-specific navigation events
    document.addEventListener('click', (event) => {
      // Check if clicked element might cause navigation
      const target = event.target.closest('a, button, [role="button"]');
      if (target) {
        // Delay context update to allow navigation to complete
        setTimeout(() => {
          if (window.location.href !== this.currentUrl) {
            this.handlePageChange();
          }
        }, 500);
      }
    });

    // Method 4: MutationObserver for dynamic content changes
    this.setupMutationObserver();
  }

  setupMutationObserver() {
    try {
      this.mutationObserver = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        mutations.forEach((mutation) => {
          // Check for significant DOM changes that might indicate page change
          if (mutation.type === 'childList') {
            // Look for changes in main content areas
            const target = mutation.target;
            if (target.classList && (
              target.classList.contains('slds-page-header') ||
              target.classList.contains('forceListViewManager') ||
              target.classList.contains('oneHeader') ||
              target.id === 'content' ||
              target.classList.contains('setupTab')
            )) {
              shouldUpdate = true;
            }
          }
          
          // Check for attribute changes that might indicate navigation
          if (mutation.type === 'attributes' && 
              mutation.attributeName === 'class' &&
              mutation.target.classList.contains('slds-is-active')) {
            shouldUpdate = true;
          }
        });

        if (shouldUpdate) {
          // Debounce updates to avoid excessive calls
          clearTimeout(this.updateTimeout);
          this.updateTimeout = setTimeout(() => {
            this.handlePageChange();
          }, 1000);
        }
      });

      // Observe the entire document for changes
      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'data-aura-rendered-by']
      });
    } catch (error) {
      console.warn('Failed to setup mutation observer:', error);
    }
  }

  handlePageChange() {
    const newUrl = window.location.href;
    
    if (newUrl !== this.currentUrl) {
      console.log('Salesforce Advisor: Page change detected', {
        from: this.currentUrl,
        to: newUrl
      });
      
      this.currentUrl = newUrl;
      
      // Wait a bit for the page to load, then update context
      setTimeout(() => {
        this.detectContext();
        this.notifySidepanelOfPageChange();
      }, 1500); // Give page time to load
    }
  }

  notifySidepanelOfPageChange() {
    // Send message to sidepanel about page change
    try {
      chrome.runtime.sendMessage({
        action: 'pageChanged',
        context: this.context,
        url: window.location.href
      });
    } catch (error) {
      console.warn('Failed to notify sidepanel of page change:', error);
    }
  }

  detectContext() {
    try {
      const url = window.location.href;
      const title = document.title;
      const pageHeader = this.getPageHeader();
      const mainContent = this.getMainPageContent();

      this.context = {
        url: url,
        title: title,
        pageType: this.detectPageType(),
        pageHeader: pageHeader,
        mainContentSummary: this.summarizeMainContent(mainContent),
        visibleElements: this.getVisibleElements(),
        errors: this.extractErrors(),
        currentObject: this.detectCurrentObject(),
        userInterface: this.detectInterface(),
        timestamp: Date.now()
      };

      // Enhanced semantic analysis
      this.semanticComponents = {
        pageIntent: this.identifyPageIntent(),
        userJourney: { stage: 'unknown', progress: 0 },
        primaryContent: this.identifyPrimaryContent(),
        availableActions: this.getAvailableActions()
      };

      // Enhanced conversational context
      this.conversationalContext = {
        userLevel: 'unknown',
        contextualTone: 'informative-helpful',
        responseStyle: 'contextual-explanation',
        priorityFocus: this.determinePriorityFocus(),
        pageSpecificContext: this.getPageSpecificContext()
      };

    } catch (error) {
      console.warn('Context detection failed:', error);
      this.context = {
        url: window.location.href,
        title: document.title,
        pageType: 'Unknown',
        pageHeader: '',
        mainContentSummary: '',
        visibleElements: [],
        errors: [],
        currentObject: null,
        userInterface: 'Unknown',
        timestamp: Date.now()
      };
    }
  }

  summarizeMainContent(content) {
    // Extract key information from main content
    const summary = {
      hasTable: content.includes('Name') && content.includes('Type'),
      hasForm: content.includes('Required') || content.includes('Save'),
      hasList: content.includes('New') && content.includes('Edit'),
      keyTerms: this.extractKeyTerms(content)
    };

    return summary;
  }

  extractKeyTerms(content) {
    // Extract important terms that indicate page purpose
    const terms = [];
    const keywords = [
      'Object Manager', 'All Users', 'Permission Sets', 'Profiles', 'Custom Labels',
      'Apex Classes', 'Flows', 'Validation Rules', 'Page Layouts', 'Fields',
      'New User', 'Edit User', 'User Detail', 'Setup Home'
    ];

    keywords.forEach(keyword => {
      if (content.includes(keyword)) {
        terms.push(keyword);
      }
    });

    return terms;
  }

  getVisibleElements() {
    // Get key visible elements that define the page
    const elements = [];
    
    // Check for specific UI patterns
    if (document.querySelector('.setupTab')) elements.push('Setup Tab Interface');
    if (document.querySelector('.slds-page-header')) elements.push('Lightning Page Header');
    if (document.querySelector('.listViewport')) elements.push('List View');
    if (document.querySelector('.forceListViewManager')) elements.push('List Manager');
    if (document.querySelector('.slds-table')) elements.push('Data Table');
    if (document.querySelector('.record-form')) elements.push('Record Form');
    if (document.querySelector('.slds-form')) elements.push('Form Interface');

    return elements;
  }

  identifyPrimaryContent() {
    // Identify what the main content of the page is about
    const url = window.location.href;
    const pageHeader = this.getPageHeader();
    const mainContent = this.getMainPageContent();

    if (url.includes('/ObjectManager/')) {
      if (mainContent.includes('Fields & Relationships')) return 'Object Fields Management';
      if (mainContent.includes('Page Layouts')) return 'Page Layout Configuration';
      if (mainContent.includes('Validation Rules')) return 'Validation Rules Setup';
      return 'Object Configuration';
    }

    if (pageHeader.includes('Users') || mainContent.includes('All Users')) {
      return 'User Management Interface';
    }

    if (pageHeader.includes('Permission Set')) return 'Permission Set Management';
    if (pageHeader.includes('Profile')) return 'Profile Management';
    if (pageHeader.includes('Setup Home')) return 'Setup Dashboard';

    return 'General Salesforce Interface';
  }

  getAvailableActions() {
    // Get available actions on the current page
    const actions = [];
    
    // Look for common action buttons
    const buttons = document.querySelectorAll('button, .slds-button, input[type="button"]');
    buttons.forEach(btn => {
      const text = btn.textContent.trim();
      if (text && text.length < 30) { // Reasonable button text length
        actions.push(text);
      }
    });

    return actions.slice(0, 10); // Limit to 10 actions
  }

  getPageSpecificContext() {
    // Get context specific to the current page type
    const url = window.location.href;
    const context = {};

    if (url.includes('/ObjectManager/')) {
      context.area = 'Object Management';
      context.purpose = 'Configure custom objects, fields, and relationships';
      context.commonTasks = ['Create fields', 'Set validation rules', 'Configure page layouts'];
    } else if (url.includes('/Users/') || url.includes('ManageUsers')) {
      context.area = 'User Administration';
      context.purpose = 'Manage user accounts, permissions, and access';
      context.commonTasks = ['Create users', 'Assign profiles', 'Set permissions'];
    } else if (url.includes('/setup/')) {
      context.area = 'Salesforce Setup';
      context.purpose = 'Configure and customize Salesforce org';
      context.commonTasks = ['Manage users', 'Configure objects', 'Set up automation'];
    }

    return context;
  }

  detectPageType() {
    const url = window.location.href;
    const title = document.title;
    
    // Get main content area for more accurate detection
    const mainContent = this.getMainPageContent();
    const pageHeader = this.getPageHeader();

    if (url.includes('lightning.force.com') || url.includes('/lightning/')) {
      if (url.includes('/setup/')) {
        // More specific Object Manager detection
        if (url.includes('/ObjectManager/')) {
          if (mainContent.includes('Object Manager') || pageHeader.includes('Object Manager')) {
            if (url.includes('/FieldsAndRelationships/')) return 'Setup - Object Fields & Relationships';
            if (url.includes('/PageLayouts/')) return 'Setup - Object Page Layouts';
            if (url.includes('/ValidationRules/')) return 'Setup - Object Validation Rules';
            return 'Setup - Object Manager';
          }
        }
        
        // Enhanced User Management detection
        if (url.includes('/Users/') || url.includes('ManageUsers') || pageHeader.includes('Users')) {
          if (url.includes('/new') || mainContent.includes('New User') || title.includes('New User')) {
            return 'Setup - New User Creation';
          }
          if (mainContent.includes('All Users') || pageHeader.includes('All Users')) {
            return 'Setup - All Users List';
          }
          return 'Setup - User Management';
        }
        
        // More specific setup page detection
        if (url.includes('/FlowDefinitionView/') || pageHeader.includes('Flow')) return 'Setup - Flow Builder';
        if (url.includes('/PermSets/') || pageHeader.includes('Permission Set')) return 'Setup - Permission Sets';
        if (url.includes('/Profiles/') || pageHeader.includes('Profile')) return 'Setup - Profiles';
        if (url.includes('/CustomLabels/') || pageHeader.includes('Custom Label')) return 'Setup - Custom Labels';
        if (url.includes('/ApexClasses/') || pageHeader.includes('Apex Class')) return 'Setup - Apex Classes';
        
        // Check main content for setup page identification
        if (mainContent.includes('Setup Home') || pageHeader.includes('Setup Home')) return 'Setup Home';
        
        return 'Setup Page';
      }
      
      if (url.includes('/r/') && url.includes('/view')) return 'Record Detail';
      if (url.includes('/r/') && url.includes('/edit')) return 'Record Edit';
      if (url.includes('/e/')) return 'Record Create/Edit';
      if (url.includes('/list')) return 'List View';
      
      return 'Lightning Experience';
    }

    if (url.includes('/apex/')) return 'Visualforce Page';
    if (url.includes('/_ui/')) return 'Salesforce Classic';
    
    return 'Unknown Salesforce Page';
  }

  getMainPageContent() {
    // Get the main content area, excluding navigation and headers
    const mainSelectors = [
      '.slds-page-header__detail-row',
      '.forceListViewManager',
      '.setupTab .pbBody',
      '.oneContent',
      '.slds-card__body',
      '.record-body-container',
      '.setupContent'
    ];

    let content = '';
    for (const selector of mainSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        content += element.textContent || '';
        break; // Use the first match
      }
    }

    // Fallback to body content but exclude navigation areas
    if (!content) {
      const body = document.body.cloneNode(true);
      // Remove navigation elements
      const navSelectors = ['.slds-global-header', '.oneHeader', '.slds-context-bar', '.setupNav'];
      navSelectors.forEach(selector => {
        const navElements = body.querySelectorAll(selector);
        navElements.forEach(el => el.remove());
      });
      content = body.textContent || '';
    }

    return content.substring(0, 1000); // Limit content length
  }

  getPageHeader() {
    // Get page header information for better context
    const headerSelectors = [
      '.slds-page-header__title',
      '.pageDescription h2',
      '.setupTab h2',
      '.pbHeader h2',
      '.slds-card__header-title',
      'h1',
      'h2'
    ];

    for (const selector of headerSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }

    return document.title;
  }

  identifyPageIntent() {
    const url = window.location.href;
    const title = document.title;

    if (url.includes('/new') || title.includes('New ')) return 'create';
    if (url.includes('/edit') || title.includes('Edit ')) return 'edit';
    if (url.includes('/list') || title.includes(' List')) return 'browse';
    if (url.includes('/setup/')) return 'configure';
    return 'view';
  }

  determinePriorityFocus() {
    const focus = [];
    
    const errors = document.querySelectorAll('.slds-has-error, .error').length;
    const requiredEmpty = document.querySelectorAll('[required]:invalid, [aria-required="true"]:invalid').length;
    
    if (errors > 0) focus.push('error-resolution');
    if (requiredEmpty > 0) focus.push('required-field-completion');
    
    return focus.length > 0 ? focus : ['general-assistance'];
  }

  detectCurrentObject() {
    const url = window.location.href;
    
    const lightningMatch = url.match(/\/lightning\/[or]\/(\w+)\//);
    if (lightningMatch) return lightningMatch[1];
    
    const classicMatch = url.match(/\/(\w+)\/[oe]/);
    if (classicMatch) return classicMatch[1];
    
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
      const errorSelectors = [
        '.slds-notify--error',
        '.slds-notify_error',
        '.slds-has-error',
        '.error-message',
        '.messageText',
        '.errorMsg'
      ];

      errorSelectors.forEach(selector => {
        try {
          document.querySelectorAll(selector).forEach(el => {
            const message = el.textContent.trim();
            if (message) {
              errors.push({
                type: 'Error',
                message: message.substring(0, 200),
                element: el.outerHTML.substring(0, 200)
              });
            }
          });
        } catch (e) {
          // Skip invalid selectors
        }
      });
    } catch (error) {
      console.warn('Error extraction failed:', error);
    }

    return errors;
  }

  extractPageContent() {
    const content = {
      forms: this.extractForms(),
      buttons: this.extractButtons(),
      fields: this.extractFields()
    };
    return content;
  }

  extractForms() {
    const forms = [];
    try {
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
    } catch (error) {
      console.warn('Form extraction failed:', error);
    }
    return forms;
  }

  extractButtons() {
    const buttons = [];
    try {
      document.querySelectorAll('button, .slds-button, input[type="button"]').forEach(btn => {
        const text = btn.textContent.trim() || btn.value;
        if (text) {
          buttons.push(text);
        }
      });
    } catch (error) {
      console.warn('Button extraction failed:', error);
    }
    return buttons;
  }

  extractFields() {
    const fields = [];
    
    try {
      const formSelectors = [
        'lightning-input',
        'lightning-combobox',
        'lightning-textarea',
        '.slds-form-element',
        '.forceInputField',
        '.requiredInput',
        '.dataCol input',
        'tr input'
      ];

      formSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            const label = this.extractFieldLabel(element);
            const type = this.extractFieldType(element);
            const required = this.isFieldRequired(element);

            if (label && !this.isSearchField(label)) {
              fields.push({
                label: label,
                type: type,
                required: required,
                value: element.value ? '[HAS_VALUE]' : ''
              });
            }
          });
        } catch (e) {
          // Skip invalid selectors
        }
      });
    } catch (error) {
      console.warn('Field extraction failed:', error);
    }

    return fields.slice(0, 25);
  }

  extractFieldLabel(element) {
    let label = '';

    try {
      label = element.getAttribute('label') ||
        element.getAttribute('field-label') ||
        element.getAttribute('data-field-label') ||
        element.getAttribute('aria-label');

      if (label) return label;

      const labelElement = element.closest('.slds-form-element')?.querySelector('label, .slds-form-element__label, .labelCol');
      if (labelElement) {
        label = labelElement.textContent?.trim();
      }

      if (label) return label;

      const tableRow = element.closest('tr');
      if (tableRow) {
        const labelCell = tableRow.querySelector('td:first-child, th:first-child, .labelCol');
        if (labelCell) {
          const labelText = labelCell.textContent.trim();
          return labelText.replace(/\*|\s*\*\s*/g, '').trim();
        }
      }
    } catch (error) {
      // Ignore errors in label extraction
    }

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
    try {
      return element.hasAttribute('required') ||
        element.getAttribute('required') === 'true' ||
        element.getAttribute('aria-required') === 'true' ||
        element.closest('.slds-is-required, .requiredInput') !== null;
    } catch (error) {
      return false;
    }
  }

  isSearchField(label) {
    const searchTerms = ['search', 'filter', 'find', 'lookup'];
    return searchTerms.some(term => label.toLowerCase().includes(term));
  }

  findFieldLabel(input) {
    try {
      const id = input.id;
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) return label.textContent.trim();
      }

      const parent = input.closest('.slds-form-element, .requiredInput, .dataCol, tr, .pbSubsection');
      if (parent) {
        const label = parent.querySelector('label, .labelCol, .dataLabel, th');
        if (label) return label.textContent.trim();
      }

      const ariaLabel = input.getAttribute('aria-label');
      if (ariaLabel) return ariaLabel;
    } catch (error) {
      // Ignore errors
    }

    return '';
  }

  setupMessageListener() {
    try {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'getContext') {
          setTimeout(() => {
            this.detectContext();

            const response = {
              context: this.context,
              content: this.extractPageContent(),
              enhanced: true,
              pageStructure: this.pageStructure,
              semanticComponents: this.semanticComponents,
              conversationalContext: this.conversationalContext
            };

            sendResponse(response);
          }, 100);
        } else if (request.action === 'refreshContext') {
          // Force refresh context
          console.log('Salesforce Advisor: Forced context refresh requested');
          this.detectContext();
          sendResponse({ success: true });
        }
        return true;
      });
    } catch (error) {
      console.error('Failed to setup message listener:', error);
    }
  }
}

// Initialize with error handling
try {
  window.salesforceContextAnalyzer = new SalesforceContextAnalyzer();
  console.log('Salesforce Context Analyzer (Simple) v2.0 initialized successfully');
} catch (error) {
  console.error('Failed to initialize Salesforce Context Analyzer:', error);
  
  // Create minimal fallback
  window.salesforceContextAnalyzer = {
    context: {
      pageType: 'Unknown',
      userInterface: 'Unknown',
      errors: [],
      url: window.location.href,
      title: document.title
    },
    pageStructure: {},
    semanticComponents: { pageIntent: 'view' },
    conversationalContext: { userLevel: 'unknown' },
    detectContext: function() {
      console.log('Using fallback context detection');
    }
  };
}

// Clear any old references that might be cached
if (window.analyzer) {
  delete window.analyzer;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.salesforceContextAnalyzer && window.salesforceContextAnalyzer.urlCheckInterval) {
    clearInterval(window.salesforceContextAnalyzer.urlCheckInterval);
  }
  if (window.salesforceContextAnalyzer && window.salesforceContextAnalyzer.mutationObserver) {
    window.salesforceContextAnalyzer.mutationObserver.disconnect();
  }
});