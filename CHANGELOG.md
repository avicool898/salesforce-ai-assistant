# Changelog

All notable changes to the Salesforce AI Assistant Chrome Extension will be documented in this file.

## [2.0.0] - 2025-01-07

### 🚀 Major Release: Enhanced Context Intelligence & Real-Time Updates

#### Added
- **Enhanced Contextual Understanding**: Revolutionary page analysis that focuses on main content instead of navigation headers
- **Real-Time Context Updates**: Automatic page change detection with multi-layer monitoring (URL, clicks, DOM mutations)
- **Direct Sidepanel Access**: One-click extension opening without popup step
- **Page-Specific Intelligence**: Recognizes 15+ specific Salesforce page types with tailored guidance
- **Enhanced Error Handling**: 30-second timeout protection with automatic retry logic
- **Manual Context Refresh**: Force context update with refresh button (🔄)
- **Visual Feedback**: "Page updated - Context refreshed" notifications
- **Contextual Quick Actions**: Dynamic suggestions based on current page type

#### Changed
- **Content Script**: Replaced complex `content.js` with simplified `content-simple.js` for better reliability
- **AI Prompts**: Enhanced prompt engineering for focused, page-specific responses
- **Context Display**: Compact layout showing actual page content instead of generic information
- **User Experience**: Streamlined workflow with direct sidepanel access
- **Error Messages**: Improved error handling with contextual fallback guidance

#### Fixed
- **API Response Validation**: Comprehensive validation prevents "Cannot read properties of undefined" errors
- **Context Detection**: Accurate page type detection focusing on main content areas
- **Navigation Tracking**: Reliable page change detection across all Salesforce navigation types
- **Memory Management**: Proper cleanup prevents memory leaks from intervals and observers
- **Function Errors**: Eliminated "function not found" errors with robust initialization

#### Technical Improvements
- **Performance**: Debounced updates and smart detection for optimal performance
- **Architecture**: Modular design with clear separation of concerns
- **Privacy**: Maintained comprehensive PII and sensitive data protection
- **Compatibility**: Enhanced support for both Lightning Experience and Salesforce Classic

## [1.0.0] - 2025-01-03

### Added
- Initial release of Salesforce AI Assistant Chrome Extension
- AI-powered contextual assistance for Salesforce users
- Support for OpenRouter (Grok), OpenAI, and Azure OpenAI
- Smart context detection for Lightning Experience and Salesforce Classic
- Automatic error detection and troubleshooting suggestions
- Quick action buttons for common Salesforce tasks
- Comprehensive settings page with API key management
- Connection testing for AI providers
- Real-time page analysis and content extraction
- Support for multiple Salesforce page types:
  - Setup pages
  - Apex classes and triggers
  - Flow Builder
  - Lightning Page Builder
  - Object Manager
  - Record views and edit pages
  - List views
  - Visualforce pages

### Features
- **Context-Aware Analysis**: Automatically detects current Salesforce page type, objects, and errors
- **Multi-AI Provider Support**: Works with OpenRouter (Grok 4 Fast free tier), OpenAI GPT models, and Azure OpenAI
- **Error Detection**: Identifies Lightning errors, system errors, and Flow errors
- **Smart Prompting**: Builds contextual prompts with page information for better AI responses
- **Quick Actions**: Pre-built prompts for debugging, page explanation, next steps, and documentation
- **Configurable Settings**: Adjustable context depth and auto-analysis options
- **Secure Storage**: API keys stored securely using Chrome's storage API

### Technical Details
- Manifest V3 Chrome Extension
- Content script for DOM analysis
- Background service worker for tab management
- Popup interface for user interactions
- Options page for configuration
- Support for Salesforce domains: *.salesforce.com, *.force.com, *.lightning.force.com