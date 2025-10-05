# 🏢 Salesforce Advisor - Your Intelligent Salesforce Copilot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://developer.chrome.com/docs/extensions/)
[![Salesforce](https://img.shields.io/badge/Salesforce-Compatible-00a1e0.svg)](https://salesforce.com)

An enterprise-grade AI copilot designed for Salesforce professionals. Get intelligent contextual assistance, expert debugging guidance, and workflow optimization powered by advanced AI models including Grok, GPT, and Claude.

![Salesforce Advisor Demo](https://via.placeholder.com/800x400/0176d3/ffffff?text=Salesforce+Advisor+Demo)

## ✨ Features

### 🎯 **Context-Aware Intelligence**
- Automatically detects current Salesforce page type, objects, and errors
- Analyzes DOM content for forms, fields, buttons, and navigation
- Understands both Lightning Experience and Salesforce Classic

### 🤖 **Multi-AI Provider Support**
- **OpenRouter**: Access to Grok 4 Fast (free), Claude 3.5 Sonnet, GPT-4o, and more
- **OpenAI Direct**: GPT-3.5 Turbo, GPT-4, GPT-4 Turbo
- **Azure OpenAI**: Enterprise-grade AI integration

### 🔍 **Smart Error Detection**
- Real-time identification of Lightning errors, system errors, and Flow errors
- Contextual troubleshooting suggestions
- Automatic error highlighting and analysis

### ⚡ **Quick Actions**
- Pre-built prompts for common scenarios:
  - "Help me debug this error"
  - "Explain this page"
  - "Suggest next steps"
  - "Find documentation"

### 🛡️ **Advanced Privacy & Security**
- **Comprehensive PII Protection**: Automatically filters emails, phone numbers, SSNs, addresses, credit cards, and more
- **Salesforce Data Security**: Filters record IDs, session tokens, API keys, and confidential Salesforce data
- **Sensitive Field Detection**: Removes data from password fields, financial information, and other sensitive inputs
- **Configurable Privacy Levels**: Choose from Minimal, Standard, or Strict protection modes
- **Real-time Privacy Reports**: See what data was filtered before sending to AI services
- **Zero Data Retention**: No sensitive data stored locally or on external servers
- **API keys stored securely using Chrome's encrypted storage**

## 🚀 Quick Start

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/avicool898/salesforce-advisor.git
   cd salesforce-advisor
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `src` folder
   - The extension icon will appear in your Chrome toolbar

3. **Configure AI Provider**
   - Right-click the extension icon → Options
   - Choose your preferred AI provider (OpenRouter recommended for free Grok access)
   - Add your API key and test the connection
   - Save settings

### Getting API Keys

#### OpenRouter (Recommended - Free Tier Available)
1. Visit [OpenRouter Keys](https://openrouter.ai/keys)
2. Create an account and generate an API key
3. Use the free Grok 4 Fast model or choose from 100+ other models

#### OpenAI
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account and generate an API key
3. Note: Requires paid credits for usage

#### Azure OpenAI
1. Set up Azure OpenAI service in your Azure portal
2. Get your endpoint URL, API key, and deployment name

## Usage

### Quick Start
- Navigate to any Salesforce page
- Click the extension icon
- Use quick action buttons or type your own question
- Get contextual AI-powered suggestions

### Supported Scenarios
- **Debugging Errors**: "Help me debug this error"
- **Page Explanation**: "Explain what I can do on this page"
- **Next Steps**: "What should I do next?"
- **Documentation**: "Find relevant documentation"

### Detected Contexts
- Apex Classes and Triggers
- Flow Builder
- Lightning Page Builder
- Object Manager
- Record Views and Edit Pages
- Setup Pages
- List Views

## Configuration

### AI Provider Setup
The extension supports multiple AI providers:

#### OpenAI
1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add it in the extension settings
3. Choose GPT-3.5-turbo or GPT-4 model

#### Azure OpenAI
1. Set up Azure OpenAI service
2. Configure endpoint and API key
3. Specify deployment name

### Privacy Settings
- **Context Depth**: Control how much page data is sent to AI
- **Auto-Analysis**: Enable automatic error detection
- **Data Retention**: Configure local storage of analysis history

## Development

### Project Structure
```
├── manifest.json          # Extension configuration
├── popup.html             # Main UI interface
├── popup.js              # UI logic and AI integration
├── content.js            # Salesforce page analysis
├── background.js         # Service worker and background tasks
├── icons/                # Extension icons
└── README.md            # This file
```

### Key Components

#### Content Script (`content.js`)
- Analyzes Salesforce DOM structure
- Detects page types, objects, and errors
- Extracts form fields, buttons, and navigation

#### Popup Interface (`popup.js`)
- Handles user interactions
- Manages AI API calls
- Displays contextual information and responses

#### Background Service (`background.js`)
- Manages extension lifecycle
- Handles cross-tab communication
- Stores analysis history

### Adding New AI Providers

1. Update the `callAI` method in `popup.js`
2. Add provider-specific configuration options
3. Implement authentication and API integration

### Extending Context Detection

1. Add new page type detection in `detectPageType()`
2. Implement specific error extraction patterns
3. Update the AI prompt building logic

## API Integration

### OpenAI Integration Example
```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500
  })
});
```

### Custom AI Service
You can integrate with any AI service by implementing the `callAI` method with your specific API endpoints and authentication.

## 🛡️ Privacy & Security

Salesforce Advisor implements enterprise-grade privacy protection to ensure your sensitive data never leaves your control inappropriately.

### Automatic Data Protection

The extension automatically filters sensitive information before sending any data to AI services:

#### Personal Information (PII)
- **Email addresses**: `john@company.com` → `[EMAIL_REDACTED]`
- **Phone numbers**: `(555) 123-4567` → `[PHONE_REDACTED]`
- **Social Security Numbers**: `123-45-6789` → `[SSN_REDACTED]`
- **Credit card numbers**: `4532 1234 5678 9012` → `[CREDITCARD_REDACTED]`
- **Addresses**: `123 Main St, City, NY 12345` → `[ADDRESS_REDACTED]`
- **Dates of birth**: `01/15/1985` → `[DATEOFBIRTH_REDACTED]`

#### Salesforce Confidential Data
- **Record IDs**: `0031234567890ABC` → `[RECORDID_REDACTED]`
- **Session tokens**: `00D123...xyz` → `[SESSIONID_REDACTED]`
- **API keys**: `sk-1234567890...` → `[APIKEY_REDACTED]`
- **User IDs**: `005123456789012` → `[USERID_REDACTED]`
- **Org IDs**: `00D123456789012` → `[ORGID_REDACTED]`

#### Sensitive Form Fields
- Password fields
- Financial information
- Authentication tokens
- Any field containing "confidential", "secret", or "private"

### Privacy Configuration

#### Privacy Levels
1. **Minimal**: Only filters obvious PII like emails and phone numbers
2. **Standard** (Recommended): Filters PII, sensitive fields, and some Salesforce IDs
3. **Strict**: Maximum protection - filters all potentially sensitive data

#### Configurable Options
- ✅ **Remove PII**: Filter personal information
- ✅ **Filter Salesforce IDs**: Remove/mask Salesforce record identifiers
- ✅ **Filter Sensitive Fields**: Remove data from sensitive form fields
- ✅ **Show Privacy Reports**: Display filtering reports when sensitive data is detected

### Privacy Reports

When sensitive data is detected, the extension shows a privacy report:

```
🛡️ Privacy Report

Data Protection Summary:
• Privacy Score: 95%
• Issues Filtered: 3
• Final Risk Level: SAFE

Your data has been automatically protected before sending to AI services.
```

### Testing Privacy Protection

You can test the privacy filtering using the included test page:
1. Open `src/test-privacy.html` in your browser
2. View how different types of sensitive data are filtered
3. See validation reports for risk assessment

### Data Flow Security

1. **Local Processing**: All privacy filtering happens locally in your browser
2. **No Data Storage**: Sensitive data is never stored locally or remotely
3. **Encrypted Storage**: API keys stored using Chrome's encrypted storage
4. **HTTPS Only**: All AI service communications use secure HTTPS
5. **No Tracking**: Extension doesn't track or collect user behavior

### Compliance Features

- **GDPR Compliant**: Automatic PII detection and filtering
- **HIPAA Considerations**: Healthcare data protection patterns
- **SOX Compliance**: Financial data filtering
- **Enterprise Ready**: Configurable privacy levels for different security requirements

## Security Considerations

- API keys are stored locally using Chrome's secure storage
- All sensitive data is filtered before AI processing
- All communication uses HTTPS
- No data is stored on external servers (except filtered AI provider calls)
- Privacy filtering happens locally - no data sent to external privacy services

## Troubleshooting

### Extension Not Working
1. Ensure you're on a Salesforce domain
2. Check that the extension has proper permissions
3. Refresh the Salesforce page and try again

### AI Not Responding
1. Verify your API key is correctly configured
2. Check browser console for error messages
3. Ensure you have sufficient API credits/quota

### Context Not Detected
1. Wait for the page to fully load
2. Try refreshing the page
3. Check if you're in a supported Salesforce interface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on different Salesforce pages
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Roadmap

- [ ] Support for more Salesforce clouds (Service, Marketing, etc.)
- [ ] Integration with Salesforce APIs for deeper context
- [ ] Custom prompt templates
- [ ] Team sharing of common solutions
- [ ] Offline AI model support
- [ ] Integration with Salesforce documentation search