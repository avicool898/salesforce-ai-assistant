# Project Structure

This document outlines the organization of the Salesforce AI Assistant Chrome Extension project.

## Directory Structure

```
salesforce-ai-assistant/
├── src/                          # Extension source code (load this folder in Chrome)
│   ├── js/                       # JavaScript files
│   │   ├── background.js         # Service worker for background tasks
│   │   ├── content.js            # Content script for Salesforce page analysis
│   │   ├── popup.js              # Popup interface logic and AI integration
│   │   └── options.js            # Settings page logic and configuration
│   ├── manifest.json             # Chrome extension manifest (Manifest V3)
│   ├── popup.html                # Main popup interface
│   └── options.html              # Settings/configuration page
├── .gitignore                    # Git ignore rules
├── .vscode/                      # VS Code settings (optional)
├── CHANGELOG.md                  # Version history and release notes
├── CONTRIBUTING.md               # Contribution guidelines
├── LICENSE                       # MIT License
├── package.json                  # Project metadata and scripts
├── PROJECT_STRUCTURE.md          # This file
└── README.md                     # Main project documentation
```

## File Descriptions

### Core Extension Files (`src/`)

#### `manifest.json`
- Chrome Extension Manifest V3 configuration
- Defines permissions, content scripts, and extension metadata
- Specifies Salesforce domain permissions

#### `popup.html` & `js/popup.js`
- Main user interface when clicking the extension icon
- Handles AI interactions and displays responses
- Manages context display and quick actions

#### `options.html` & `js/options.js`
- Settings page for configuring AI providers
- API key management and connection testing
- Extension preferences and configuration

#### `js/content.js`
- Injected into Salesforce pages for DOM analysis
- Detects page types, errors, forms, and content
- Extracts contextual information for AI processing

#### `js/background.js`
- Service worker for background tasks
- Manages tab updates and extension lifecycle
- Handles cross-tab communication and storage

### Documentation Files

#### `README.md`
- Main project documentation
- Installation and setup instructions
- Feature overview and usage guide

#### `CHANGELOG.md`
- Version history and release notes
- Feature additions and bug fixes
- Breaking changes and migration notes

#### `CONTRIBUTING.md`
- Guidelines for contributors
- Development setup and testing procedures
- Code style and submission process

#### `LICENSE`
- MIT License terms
- Usage and distribution rights

### Configuration Files

#### `package.json`
- Project metadata and dependencies
- Build scripts and repository information
- Keywords and author information

#### `.gitignore`
- Files and directories to exclude from Git
- API keys, build outputs, and temporary files

#### `.vscode/settings.json`
- VS Code editor configuration
- Code formatting and extension settings

## Development Workflow

### 1. Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/salesforce-ai-assistant.git
cd salesforce-ai-assistant

# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the 'src' folder
```

### 2. Making Changes
- Edit files in the `src/` directory
- Reload the extension in Chrome to test changes
- Use Chrome DevTools for debugging

### 3. Testing
- Test on various Salesforce pages and environments
- Verify AI provider integrations work correctly
- Check error handling and edge cases

### 4. Packaging for Distribution
```bash
# Create a zip file for Chrome Web Store
npm run package
```

## Key Components

### AI Integration
- **OpenRouter**: Primary AI provider with free Grok access
- **OpenAI**: Direct integration with GPT models
- **Azure OpenAI**: Enterprise AI integration

### Salesforce Context Detection
- **Page Types**: Lightning Experience, Classic, Setup, Apex, Flow Builder
- **Error Detection**: Lightning errors, system errors, Flow errors
- **Content Analysis**: Forms, fields, buttons, navigation, lists

### Security Features
- **Secure Storage**: API keys encrypted in Chrome storage
- **Permission Management**: Minimal required permissions
- **Data Privacy**: Configurable context depth

## Browser Compatibility

- **Chrome**: Version 88+ (Manifest V3 support)
- **Edge**: Chromium-based versions
- **Other Browsers**: Not currently supported (Chrome extension specific)

## Salesforce Compatibility

- **Lightning Experience**: Full support
- **Salesforce Classic**: Basic support
- **Salesforce Clouds**: Sales, Service, Marketing, Community
- **Custom Domains**: *.salesforce.com, *.force.com, *.lightning.force.com