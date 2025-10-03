# Changelog

All notable changes to the Salesforce AI Assistant Chrome Extension will be documented in this file.

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