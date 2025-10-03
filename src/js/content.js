// Salesforce Context Detector and DOM Analyzer
class SalesforceContextAnalyzer {
  constructor() {
    this.context = {};
    this.init();
  }

  init() {
    this.detectContext();
    this.setupMessageListener();
  }

  detectContext() {
    const url = window.location.href;
    const title = document.title;
    
    this.context = {
      url: url,
      title: title,
      pageType: this.detectPageType(),
      errors: this.extractErrors(),
      currentObject: this.detectCurrentObject(),
      userInterface: this.detectInterface(),
      timestamp: Date.now()
    };
  }

  detectPageType() {
    const url = window.location.href;
    const pathname = window.location.pathname;
    
    // Lightning Experience detection
    if (url.includes('lightning.force.com') || url.includes('/lightning/')) {
      if (pathname.includes('/setup/')) return 'Setup';
      if (pathname.includes('/apex/')) return 'Apex Class';
      if (pathname.includes('/flow/')) return 'Flow Builder';
      if (pathname.includes('/flexipages/')) return 'Lightning Page Builder';
      if (pathname.includes('/objectManager/')) return 'Object Manager';
      if (url.includes('/r/') && url.includes('/view')) return 'Record View';
      if (url.includes('/e/')) return 'Record Edit';
      if (url.includes('/list')) return 'List View';
      return 'Lightning Experience';
    }
    
    // Classic detection
    if (url.includes('/apex/')) return 'Visualforce Page';
    if (url.includes('/_ui/')) return 'Salesforce Classic';
    
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
    
    // Lightning error messages
    document.querySelectorAll('.slds-notify--error, .slds-notify_error').forEach(el => {
      errors.push({
        type: 'Lightning Error',
        message: el.textContent.trim(),
        element: el.outerHTML.substring(0, 200)
      });
    });
    
    // Apex debug logs or errors
    document.querySelectorAll('.messageText, .errorMsg').forEach(el => {
      if (el.textContent.trim()) {
        errors.push({
          type: 'System Error',
          message: el.textContent.trim(),
          element: el.outerHTML.substring(0, 200)
        });
      }
    });
    
    // Flow errors
    document.querySelectorAll('[data-error-message]').forEach(el => {
      errors.push({
        type: 'Flow Error',
        message: el.getAttribute('data-error-message'),
        element: el.outerHTML.substring(0, 200)
      });
    });
    
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
        sendResponse({
          context: this.context,
          content: this.extractPageContent()
        });
      }
      return true;
    });
  }
}

// Initialize the analyzer
const analyzer = new SalesforceContextAnalyzer();

// Periodically update context for dynamic pages
setInterval(() => {
  analyzer.detectContext();
}, 5000);