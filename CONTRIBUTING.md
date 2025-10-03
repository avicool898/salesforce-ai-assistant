# Contributing to Salesforce AI Assistant

Thank you for your interest in contributing to the Salesforce AI Assistant Chrome Extension! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites
- Google Chrome browser
- Basic knowledge of JavaScript, HTML, and CSS
- Understanding of Chrome Extension development
- Familiarity with Salesforce (Lightning Experience and/or Classic)

### Development Setup
1. Clone the repository
2. Navigate to `chrome://extensions/` in Chrome
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `src` folder
5. Make your changes and reload the extension to test

## Project Structure

```
├── src/                    # Extension source code
│   ├── js/                # JavaScript files
│   │   ├── background.js  # Service worker
│   │   ├── content.js     # Content script for Salesforce pages
│   │   ├── popup.js       # Popup interface logic
│   │   └── options.js     # Settings page logic
│   ├── manifest.json      # Extension manifest
│   ├── popup.html         # Popup interface
│   └── options.html       # Settings page
├── README.md              # Project documentation
├── CHANGELOG.md           # Version history
├── LICENSE                # MIT License
└── .gitignore            # Git ignore rules
```

## How to Contribute

### Reporting Issues
- Use the GitHub Issues tab to report bugs
- Include steps to reproduce the issue
- Specify your Chrome version and Salesforce environment
- Attach screenshots if helpful

### Suggesting Features
- Open an issue with the "enhancement" label
- Describe the feature and its use case
- Explain how it would benefit Salesforce users

### Code Contributions

#### Before You Start
1. Check existing issues to avoid duplicate work
2. Fork the repository
3. Create a feature branch from `main`

#### Development Guidelines
- Follow existing code style and patterns
- Add comments for complex logic
- Test your changes thoroughly on different Salesforce pages
- Ensure the extension works in both Lightning and Classic

#### Pull Request Process
1. Update documentation if needed
2. Add your changes to CHANGELOG.md
3. Test the extension with your changes
4. Submit a pull request with a clear description

## Code Style Guidelines

### JavaScript
- Use ES6+ features where appropriate
- Use meaningful variable and function names
- Add JSDoc comments for public methods
- Handle errors gracefully with try-catch blocks

### HTML/CSS
- Use semantic HTML elements
- Follow existing CSS patterns
- Ensure responsive design for different screen sizes
- Maintain accessibility standards

## Testing Guidelines

### Manual Testing
Test your changes on various Salesforce pages:
- Lightning Experience home page
- Record detail pages
- List views
- Setup pages
- Apex classes/triggers
- Flow Builder
- Salesforce Classic (if applicable)

### AI Integration Testing
- Test with different AI providers (OpenRouter, OpenAI, Azure)
- Verify error handling for API failures
- Test with various prompt types and contexts

## AI Provider Integration

### Adding New AI Providers
1. Update the options page with new provider configuration
2. Add API integration logic in `popup.js`
3. Update the connection testing in `options.js`
4. Add documentation for the new provider

### API Key Security
- Never commit API keys to the repository
- Use Chrome's secure storage for API keys
- Implement proper error handling for authentication failures

## Salesforce Context Detection

### Adding New Page Types
1. Update `detectPageType()` in `content.js`
2. Add specific error extraction patterns if needed
3. Update the AI prompt building logic
4. Test on the new page type

### Improving Context Extraction
- Add new DOM selectors for better content detection
- Improve object detection from URLs and page elements
- Enhance error message extraction

## Documentation

### Code Documentation
- Add JSDoc comments for all public methods
- Document complex algorithms and business logic
- Update README.md for significant changes

### User Documentation
- Update setup instructions for new features
- Add troubleshooting guides for common issues
- Include screenshots for UI changes

## Release Process

### Version Numbering
- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Update version in `manifest.json`
- Add entry to CHANGELOG.md

### Testing Before Release
- Test on multiple Salesforce orgs
- Verify all AI providers work correctly
- Check extension permissions and security
- Test installation and upgrade process

## Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help newcomers learn and contribute
- Focus on the project's goals

### Communication
- Use GitHub Issues for bug reports and feature requests
- Be clear and specific in your communications
- Respond promptly to feedback on your contributions

## Getting Help

### Resources
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Salesforce Developer Documentation](https://developer.salesforce.com/)
- [OpenRouter API Documentation](https://openrouter.ai/docs)

### Questions
- Open an issue with the "question" label
- Check existing issues for similar questions
- Provide context about your development environment

Thank you for contributing to make Salesforce more accessible and user-friendly for everyone!