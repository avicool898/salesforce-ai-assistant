// Advanced Privacy Filter for Salesforce Data Protection
class PrivacyFilter {
  constructor() {
    this.piiPatterns = this.initializePIIPatterns();
    this.salesforceConfidentialPatterns = this.initializeSalesforcePatterns();
    this.sensitiveFieldNames = this.initializeSensitiveFields();
  }

  initializePIIPatterns() {
    return {
      // Email patterns
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      
      // Phone number patterns (various formats)
      phone: /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
      
      // Social Security Number patterns
      ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
      
      // Credit card patterns
      creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
      
      // Address patterns (basic)
      address: /\b\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b/gi,
      
      // ZIP codes
      zipCode: /\b\d{5}(?:-\d{4})?\b/g,
      
      // Date of birth patterns
      dateOfBirth: /\b(?:0[1-9]|1[0-2])[-/](?:0[1-9]|[12]\d|3[01])[-/](?:19|20)\d{2}\b/g,
      
      // Bank account patterns
      bankAccount: /\b\d{8,17}\b/g,
      
      // Driver's license patterns (basic)
      driversLicense: /\b[A-Z]{1,2}\d{6,8}\b/g,
      
      // Passport patterns
      passport: /\b[A-Z]{1,2}\d{6,9}\b/g
    };
  }

  initializeSalesforcePatterns() {
    return {
      // Salesforce Record IDs (15 or 18 characters)
      recordId: /\b[a-zA-Z0-9]{15}(?:[a-zA-Z0-9]{3})?\b/g,
      
      // API Keys and Tokens
      apiKey: /\b(?:sk-|pk_|rk_)[a-zA-Z0-9]{20,}\b/g,
      
      // Session IDs
      sessionId: /\b[A-Z0-9!.]{100,}\b/g,
      
      // OAuth tokens
      oauthToken: /\b[A-Za-z0-9+/]{40,}={0,2}\b/g,
      
      // Salesforce Org IDs
      orgId: /\b00D[a-zA-Z0-9]{12,15}\b/g,
      
      // User IDs
      userId: /\b005[a-zA-Z0-9]{12,15}\b/g,
      
      // Custom object IDs (starts with a01, a02, etc.)
      customObjectId: /\ba[0-9]{2}[a-zA-Z0-9]{12,15}\b/g
    };
  }

  initializeSensitiveFields() {
    return [
      // Personal Information
      'ssn', 'social_security_number', 'tax_id', 'ein',
      'date_of_birth', 'dob', 'birth_date',
      'drivers_license', 'passport_number',
      
      // Financial Information
      'credit_card', 'bank_account', 'routing_number',
      'account_number', 'card_number', 'cvv', 'security_code',
      
      // Contact Information
      'personal_email', 'home_phone', 'mobile_phone',
      'personal_address', 'home_address',
      
      // Sensitive Business Data
      'salary', 'compensation', 'revenue', 'profit',
      'confidential', 'internal', 'restricted',
      
      // Authentication
      'password', 'token', 'api_key', 'secret',
      'session_id', 'auth_token', 'access_token'
    ];
  }

  filterText(text, options = {}) {
    if (!text || typeof text !== 'string') return text;
    
    const {
      removePII = true,
      removeSalesforceIds = true,
      removeSensitiveFields = true,
      maskingChar = '[REDACTED]',
      preserveStructure = true
    } = options;

    let filteredText = text;

    // Remove PII
    if (removePII) {
      filteredText = this.removePII(filteredText, maskingChar);
    }

    // Remove Salesforce confidential data
    if (removeSalesforceIds) {
      filteredText = this.removeSalesforceConfidential(filteredText, maskingChar);
    }

    // Remove sensitive field data
    if (removeSensitiveFields) {
      filteredText = this.removeSensitiveFieldData(filteredText, maskingChar);
    }

    return filteredText;
  }

  removePII(text, maskingChar) {
    let filtered = text;
    
    Object.entries(this.piiPatterns).forEach(([type, pattern]) => {
      filtered = filtered.replace(pattern, `[${type.toUpperCase()}_${maskingChar}]`);
    });

    return filtered;
  }

  removeSalesforceConfidential(text, maskingChar) {
    let filtered = text;
    
    Object.entries(this.salesforceConfidentialPatterns).forEach(([type, pattern]) => {
      filtered = filtered.replace(pattern, `[${type.toUpperCase()}_${maskingChar}]`);
    });

    return filtered;
  }

  removeSensitiveFieldData(text, maskingChar) {
    let filtered = text;
    
    // Remove sensitive field values from form data
    this.sensitiveFieldNames.forEach(fieldName => {
      const patterns = [
        new RegExp(`"${fieldName}"\\s*:\\s*"[^"]*"`, 'gi'),
        new RegExp(`${fieldName}\\s*=\\s*"[^"]*"`, 'gi'),
        new RegExp(`${fieldName}\\s*:\\s*[^,\\n}]+`, 'gi')
      ];
      
      patterns.forEach(pattern => {
        filtered = filtered.replace(pattern, `"${fieldName}": "[${maskingChar}]"`);
      });
    });

    return filtered;
  }

  filterObject(obj, options = {}) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const filtered = JSON.parse(JSON.stringify(obj)); // Deep clone
    
    return this.recursivelyFilterObject(filtered, options);
  }

  recursivelyFilterObject(obj, options) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.recursivelyFilterObject(item, options));
    }
    
    if (obj && typeof obj === 'object') {
      const filtered = {};
      
      Object.entries(obj).forEach(([key, value]) => {
        // Check if key is sensitive
        if (this.isSensitiveKey(key)) {
          filtered[key] = '[REDACTED]';
        } else if (typeof value === 'string') {
          filtered[key] = this.filterText(value, options);
        } else if (typeof value === 'object') {
          filtered[key] = this.recursivelyFilterObject(value, options);
        } else {
          filtered[key] = value;
        }
      });
      
      return filtered;
    }
    
    return obj;
  }

  isSensitiveKey(key) {
    const lowerKey = key.toLowerCase();
    return this.sensitiveFieldNames.some(sensitiveField => 
      lowerKey.includes(sensitiveField.toLowerCase())
    );
  }

  filterDOMElement(element, options = {}) {
    if (!element) return null;
    
    const clone = element.cloneNode(true);
    
    // Remove sensitive input values
    const inputs = clone.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (this.isSensitiveInput(input)) {
        input.value = '[REDACTED]';
        input.setAttribute('value', '[REDACTED]');
      }
    });
    
    // Filter text content
    const textNodes = this.getTextNodes(clone);
    textNodes.forEach(node => {
      node.textContent = this.filterText(node.textContent, options);
    });
    
    return clone;
  }

  isSensitiveInput(input) {
    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    const placeholder = (input.placeholder || '').toLowerCase();
    const type = (input.type || '').toLowerCase();
    
    // Check input type
    if (['password', 'email', 'tel'].includes(type)) {
      return true;
    }
    
    // Check field names
    const fieldIdentifiers = [name, id, placeholder].join(' ');
    return this.sensitiveFieldNames.some(sensitiveField => 
      fieldIdentifiers.includes(sensitiveField.toLowerCase())
    );
  }

  getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    
    return textNodes;
  }

  // Validate if content is safe to send to AI
  validateContentSafety(content) {
    const issues = [];
    
    // Check for PII
    Object.entries(this.piiPatterns).forEach(([type, pattern]) => {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          type: 'PII',
          category: type,
          count: matches.length,
          severity: 'HIGH'
        });
      }
    });
    
    // Check for Salesforce confidential data
    Object.entries(this.salesforceConfidentialPatterns).forEach(([type, pattern]) => {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          type: 'SALESFORCE_CONFIDENTIAL',
          category: type,
          count: matches.length,
          severity: 'MEDIUM'
        });
      }
    });
    
    return {
      isSafe: issues.length === 0,
      issues: issues,
      riskLevel: this.calculateRiskLevel(issues)
    };
  }

  calculateRiskLevel(issues) {
    if (issues.length === 0) return 'SAFE';
    
    const highRiskIssues = issues.filter(issue => issue.severity === 'HIGH');
    if (highRiskIssues.length > 0) return 'HIGH_RISK';
    
    const mediumRiskIssues = issues.filter(issue => issue.severity === 'MEDIUM');
    if (mediumRiskIssues.length > 2) return 'MEDIUM_RISK';
    
    return 'LOW_RISK';
  }

  // Generate privacy report
  generatePrivacyReport(originalContent, filteredContent) {
    const originalValidation = this.validateContentSafety(originalContent);
    const filteredValidation = this.validateContentSafety(filteredContent);
    
    return {
      originalRisk: originalValidation.riskLevel,
      filteredRisk: filteredValidation.riskLevel,
      issuesRemoved: originalValidation.issues.length - filteredValidation.issues.length,
      remainingIssues: filteredValidation.issues,
      privacyScore: this.calculatePrivacyScore(originalValidation, filteredValidation)
    };
  }

  calculatePrivacyScore(original, filtered) {
    const maxIssues = Math.max(original.issues.length, 1);
    const removedIssues = original.issues.length - filtered.issues.length;
    return Math.round((removedIssues / maxIssues) * 100);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PrivacyFilter;
} else {
  window.PrivacyFilter = PrivacyFilter;
}