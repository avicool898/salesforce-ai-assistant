// Store Assets Generator for Salesforce Advisor
// This script helps create all required assets for Chrome Web Store and Microsoft Edge Add-ons

const fs = require('fs');
const path = require('path');

// Create directories for store assets
const createDirectories = () => {
  const dirs = [
    'store-assets',
    'store-assets/icons',
    'store-assets/screenshots',
    'store-assets/promotional',
    'store-assets/descriptions'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
};

// Generate HTML template for creating icons
const generateIconTemplate = () => {
  const iconTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>Salesforce Advisor - Store Icons Generator</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .icon-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 30px;
            margin: 30px 0;
        }
        .icon-container {
            text-align: center;
            padding: 20px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            background: #fafafa;
        }
        .icon {
            width: 128px;
            height: 128px;
            margin: 0 auto 15px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            color: white;
            background: linear-gradient(135deg, #0176d3 0%, #0099e0 50%, #00a1e0 100%);
            box-shadow: 0 4px 12px rgba(1, 118, 211, 0.3);
            position: relative;
            overflow: hidden;
        }
        .icon::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }
        .icon-text {
            position: relative;
            z-index: 2;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .icon-16 { width: 16px; height: 16px; font-size: 8px; }
        .icon-48 { width: 48px; height: 48px; font-size: 20px; }
        .icon-128 { width: 128px; height: 128px; font-size: 48px; }
        .icon-300 { width: 300px; height: 300px; font-size: 120px; }
        .download-btn {
            background: #0176d3;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            margin: 5px;
        }
        .download-btn:hover {
            background: #014486;
        }
        .instructions {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #0176d3;
        }
        .promotional-container {
            margin: 40px 0;
            padding: 30px;
            background: linear-gradient(135deg, #0176d3 0%, #0099e0 100%);
            color: white;
            border-radius: 12px;
            text-align: center;
        }
        .promo-large {
            width: 920px;
            height: 680px;
            max-width: 100%;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            margin: 20px auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 2px dashed rgba(255,255,255,0.3);
        }
        .promo-small {
            width: 440px;
            height: 280px;
            max-width: 100%;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            margin: 20px auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 2px dashed rgba(255,255,255,0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏢 Salesforce Advisor - Store Assets</h1>
        <p>Generate all required icons and promotional images for Chrome Web Store and Microsoft Edge Add-ons.</p>
        
        <div class="instructions">
            <h3>📋 Instructions:</h3>
            <ol>
                <li>Right-click on each icon and select "Save image as..."</li>
                <li>Save with the exact filename shown (e.g., "icon-128.png")</li>
                <li>Use PNG format for all icons</li>
                <li>For promotional images, take screenshots of the templates below</li>
            </ol>
        </div>

        <h2>🎯 Extension Icons</h2>
        <div class="icon-grid">
            <div class="icon-container">
                <canvas class="icon icon-16" id="icon16" width="16" height="16"></canvas>
                <h3>16x16 Toolbar Icon</h3>
                <p>Used in browser toolbar</p>
                <button class="download-btn" onclick="downloadIcon('icon16', 'icon-16.png')">Download PNG</button>
            </div>
            
            <div class="icon-container">
                <canvas class="icon icon-48" id="icon48" width="48" height="48"></canvas>
                <h3>48x48 Management Icon</h3>
                <p>Used in extension management</p>
                <button class="download-btn" onclick="downloadIcon('icon48', 'icon-48.png')">Download PNG</button>
            </div>
            
            <div class="icon-container">
                <canvas class="icon icon-128" id="icon128" width="128" height="128"></canvas>
                <h3>128x128 Store Icon</h3>
                <p>Used in Chrome Web Store</p>
                <button class="download-btn" onclick="downloadIcon('icon128', 'icon-128.png')">Download PNG</button>
            </div>
            
            <div class="icon-container">
                <canvas class="icon icon-300" id="icon300" width="300" height="300"></canvas>
                <h3>300x300 Edge Logo</h3>
                <p>Used in Microsoft Edge Add-ons</p>
                <button class="download-btn" onclick="downloadIcon('icon300', 'icon-300.png')">Download PNG</button>
            </div>
        </div>

        <h2>🖼️ Promotional Images</h2>
        <div class="promotional-container">
            <h3>Chrome Web Store - Large Tile (920x680)</h3>
            <div class="promo-large">
                <div style="font-size: 48px; margin-bottom: 20px;">🏢</div>
                <h2 style="margin: 0; font-size: 36px;">Salesforce Advisor</h2>
                <p style="font-size: 18px; margin: 10px 0;">Your Intelligent Salesforce Copilot</p>
                <div style="display: flex; gap: 20px; margin-top: 30px; flex-wrap: wrap; justify-content: center;">
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; min-width: 150px;">
                        <div style="font-size: 24px;">🎯</div>
                        <div style="font-size: 14px; margin-top: 5px;">Context-Aware AI</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; min-width: 150px;">
                        <div style="font-size: 24px;">🛡️</div>
                        <div style="font-size: 14px; margin-top: 5px;">Privacy Protected</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; min-width: 150px;">
                        <div style="font-size: 24px;">⚡</div>
                        <div style="font-size: 14px; margin-top: 5px;">Smart Debugging</div>
                    </div>
                </div>
            </div>
            <button class="download-btn" onclick="capturePromoImage('promo-large', 'chrome-large-tile.png')">Capture Large Tile</button>
        </div>

        <div class="promotional-container">
            <h3>Chrome Web Store - Small Tile (440x280)</h3>
            <div class="promo-small">
                <div style="font-size: 32px; margin-bottom: 15px;">🏢</div>
                <h2 style="margin: 0; font-size: 24px;">Salesforce Advisor</h2>
                <p style="font-size: 14px; margin: 8px 0;">AI-Powered Salesforce Copilot</p>
                <p style="font-size: 12px; margin: 8px 0; opacity: 0.9;">Context-Aware • Privacy-First • Multi-AI</p>
            </div>
            <button class="download-btn" onclick="capturePromoImage('promo-small', 'chrome-small-tile.png')">Capture Small Tile</button>
        </div>

        <h2>📱 Screenshot Guidelines</h2>
        <div class="instructions">
            <h3>Required Screenshots (1280x800 or 640x400):</h3>
            <ol>
                <li><strong>Main Interface</strong>: Side panel open with AI conversation</li>
                <li><strong>Context Detection</strong>: Extension detecting Salesforce page type</li>
                <li><strong>Error Analysis</strong>: AI helping debug a Salesforce error</li>
                <li><strong>Privacy Features</strong>: Privacy settings or filtering in action</li>
                <li><strong>Settings Page</strong>: AI provider configuration</li>
            </ol>
            <p><strong>Tips:</strong></p>
            <ul>
                <li>Use a clean Salesforce org for screenshots</li>
                <li>Show realistic but non-sensitive data</li>
                <li>Highlight key features with callouts if needed</li>
                <li>Ensure text is readable at thumbnail size</li>
            </ul>
        </div>
    </div>

    <script>
        // Draw icons on canvas elements
        function drawIcon(canvasId, size) {
            const canvas = document.getElementById(canvasId);
            const ctx = canvas.getContext('2d');
            
            // Create gradient background
            const gradient = ctx.createLinearGradient(0, 0, size, size);
            gradient.addColorStop(0, '#0176d3');
            gradient.addColorStop(0.5, '#0099e0');
            gradient.addColorStop(1, '#00a1e0');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);
            
            // Add subtle pattern
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            for (let i = 0; i < size; i += 10) {
                ctx.fillRect(i, 0, 1, size);
                ctx.fillRect(0, i, size, 1);
            }
            
            // Add "SA" text
            ctx.fillStyle = 'white';
            ctx.font = \`bold \${size * 0.4}px Arial\`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = size * 0.05;
            ctx.shadowOffsetY = size * 0.02;
            ctx.fillText('SA', size / 2, size / 2);
        }
        
        // Download icon as PNG
        function downloadIcon(canvasId, filename) {
            const canvas = document.getElementById(canvasId);
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
        
        // Initialize icons
        drawIcon('icon16', 16);
        drawIcon('icon48', 48);
        drawIcon('icon128', 128);
        drawIcon('icon300', 300);
        
        // Capture promotional image (placeholder function)
        function capturePromoImage(elementClass, filename) {
            alert(\`To capture \${filename}:\\n1. Right-click on the promotional area\\n2. Select "Save image as..." or use screenshot tool\\n3. Save as \${filename}\`);
        }
    </script>
</body>
</html>`;

  fs.writeFileSync('store-assets/icon-generator.html', iconTemplate);
  console.log('✅ Created icon generator: store-assets/icon-generator.html');
};

// Generate store descriptions
const generateStoreDescriptions = () => {
  const descriptions = {
    'chrome-short.txt': 'AI-powered Salesforce copilot with advanced privacy protection. Get expert help, debug errors, and optimize workflows.',
    
    'chrome-detailed.txt': `🏢 Salesforce Advisor - Your Intelligent Salesforce Copilot

Transform your Salesforce experience with AI-powered assistance that understands your context and protects your data.

✨ KEY FEATURES:
• Context-Aware Intelligence: Automatically detects page types, objects, and errors
• Multi-AI Support: OpenRouter (Grok, Claude, GPT), OpenAI, Azure OpenAI
• Smart Error Detection: Real-time identification and troubleshooting
• Advanced Privacy Protection: Enterprise-grade PII and data filtering
• Quick Actions: Pre-built prompts for common scenarios

🛡️ PRIVACY & SECURITY:
• Comprehensive PII filtering (emails, phones, SSNs, addresses)
• Salesforce data protection (record IDs, session tokens, API keys)
• Configurable privacy levels (Minimal, Standard, Strict)
• Local processing - no external data storage
• GDPR, HIPAA, and SOX compliance considerations

🎯 PERFECT FOR:
• Salesforce Administrators
• Developers and Consultants
• Business Users
• Anyone working with Salesforce daily

🚀 GET STARTED:
1. Install the extension
2. Configure your AI provider (free options available)
3. Navigate to any Salesforce page
4. Click the extension icon to start getting help

🔧 SUPPORTED AI PROVIDERS:
• OpenRouter: Access to 50+ models including Grok, Claude, GPT-4
• OpenAI: Direct integration with GPT-3.5 and GPT-4
• Azure OpenAI: Enterprise-grade AI services

📞 SUPPORT:
Need help? Visit our documentation or contact support.
Privacy Policy: [Your privacy policy URL]`,

    'edge-detailed.txt': `🏢 Salesforce Advisor - Your Intelligent Salesforce Copilot

An enterprise-grade AI assistant designed specifically for Salesforce professionals. Get contextual help, debug errors, and optimize your workflows with advanced privacy protection.

✨ CORE FEATURES:
• Context-Aware Intelligence: Automatically understands your current Salesforce page
• Multi-AI Provider Support: Choose from OpenRouter, OpenAI, or Azure OpenAI
• Smart Error Detection: Identifies and helps resolve Salesforce errors
• Privacy-First Design: Advanced PII and sensitive data filtering
• Quick Actions: Pre-built prompts for common Salesforce scenarios

🛡️ ENTERPRISE PRIVACY:
• Automatic PII filtering (emails, phone numbers, SSNs, addresses)
• Salesforce data protection (record IDs, session tokens, API keys)
• Three privacy levels: Minimal, Standard, and Strict
• Local data processing - no external storage
• Compliance-ready for GDPR, HIPAA, and SOX requirements

🎯 IDEAL FOR:
• Salesforce Administrators managing complex orgs
• Developers building on the Salesforce platform
• Consultants working across multiple orgs
• Business users needing Salesforce guidance

🚀 QUICK START:
1. Install the extension from Microsoft Edge Add-ons
2. Configure your preferred AI provider
3. Navigate to any Salesforce page
4. Open the side panel to start getting intelligent assistance

🔧 AI PROVIDER OPTIONS:
• OpenRouter: Access to 50+ models including latest Grok, Claude, and GPT models
• OpenAI: Direct integration with GPT-3.5 Turbo and GPT-4
• Azure OpenAI: Enterprise-grade AI with your organization's Azure subscription

📊 SUPPORTED SALESFORCE FEATURES:
• Lightning Experience and Salesforce Classic
• Setup pages and Object Manager
• Record views, edit pages, and list views
• Flow Builder and Process Builder
• Apex development and debugging
• Reports and Dashboards

📞 SUPPORT & DOCUMENTATION:
Comprehensive documentation and support available.
Privacy Policy: [Your privacy policy URL]
Terms of Service: [Your terms URL]`
  };

  Object.entries(descriptions).forEach(([filename, content]) => {
    fs.writeFileSync(`store-assets/descriptions/${filename}`, content);
    console.log(`✅ Created description: store-assets/descriptions/${filename}`);
  });
};

// Generate privacy policy template
const generatePrivacyPolicy = () => {
  const privacyPolicy = `# Privacy Policy - Salesforce Advisor

**Last Updated**: [Current Date]

## Overview
Salesforce Advisor ("we", "our", or "the extension") is committed to protecting your privacy and ensuring the security of your data. This privacy policy explains how we collect, use, and protect information when you use our Chrome extension.

## Information We Collect

### Information You Provide
- **AI API Keys**: Stored locally in your browser's encrypted storage
- **Configuration Settings**: Privacy preferences and AI provider settings
- **Optional Information**: Site URL and name for OpenRouter integration (optional)

### Information We Automatically Collect
- **Salesforce Page Context**: Page type, object information, and error messages (filtered for privacy)
- **Usage Analytics**: Extension usage patterns (if analytics are enabled)

### Information We Do NOT Collect
- **Personal Information**: No PII is transmitted to our servers
- **Salesforce Data**: All sensitive Salesforce data is filtered before AI processing
- **Conversation History**: Stored locally only, never transmitted to our servers

## How We Use Information

### Primary Uses
- **AI Processing**: Filtered context data sent to your chosen AI provider
- **Extension Functionality**: Providing contextual Salesforce assistance
- **Privacy Protection**: Filtering sensitive data before AI processing

### We Do NOT Use Information For
- **Advertising**: No advertising or marketing purposes
- **Data Sales**: We never sell or share your data with third parties
- **Tracking**: No cross-site tracking or user profiling

## Data Protection

### Privacy Filtering
- **Automatic PII Filtering**: Emails, phone numbers, SSNs, addresses automatically filtered
- **Salesforce Data Protection**: Record IDs, session tokens, API keys filtered
- **Configurable Privacy**: Choose from Minimal, Standard, or Strict protection levels

### Data Security
- **Local Processing**: All privacy filtering happens locally in your browser
- **Encrypted Storage**: API keys stored using Chrome's secure storage
- **No Data Retention**: Sensitive data is never stored or retained

### Third-Party Services
- **AI Providers**: Filtered data may be sent to OpenRouter, OpenAI, or Azure OpenAI based on your configuration
- **No Other Third Parties**: No data shared with any other third-party services

## Your Rights

### Data Control
- **Configuration**: Full control over privacy settings and data sharing
- **Deletion**: Uninstall the extension to remove all local data
- **Access**: All data is stored locally and accessible to you

### Privacy Choices
- **Privacy Levels**: Choose your preferred level of data protection
- **AI Provider**: Select which AI service to use (if any)
- **Opt-Out**: Disable features or uninstall at any time

## Compliance

### Regulatory Compliance
- **GDPR**: Compliant with EU General Data Protection Regulation
- **CCPA**: Compliant with California Consumer Privacy Act
- **HIPAA**: Healthcare data protection patterns implemented
- **SOX**: Financial data filtering for Sarbanes-Oxley compliance

## Changes to This Policy
We may update this privacy policy from time to time. We will notify users of any material changes through the extension or our website.

## Contact Information
If you have questions about this privacy policy or our data practices:

- **Email**: [Your support email]
- **Website**: [Your website URL]
- **Support**: [Your support URL]

## Effective Date
This privacy policy is effective as of [Current Date].`;

  fs.writeFileSync('store-assets/privacy-policy.md', privacyPolicy);
  console.log('✅ Created privacy policy template: store-assets/privacy-policy.md');
};

// Generate package creation script
const generatePackageScript = () => {
  const packageScript = `#!/bin/bash
# Package creation script for store submissions

echo "🚀 Creating Salesforce Advisor extension packages..."

# Create clean build directory
rm -rf build
mkdir -p build

# Copy source files (excluding development files)
cp -r src/* build/
rm -f build/test-*.html
rm -f build/*.md

# Create Chrome Web Store package
cd build
zip -r ../store-assets/salesforce-advisor-chrome.zip . -x "*.DS_Store" "*.git*" "node_modules/*"
cd ..

# Create Microsoft Edge package (same as Chrome for Manifest v3)
cp store-assets/salesforce-advisor-chrome.zip store-assets/salesforce-advisor-edge.zip

echo "✅ Packages created:"
echo "   - store-assets/salesforce-advisor-chrome.zip"
echo "   - store-assets/salesforce-advisor-edge.zip"

# Display package info
echo ""
echo "📦 Package Information:"
ls -lh store-assets/*.zip

echo ""
echo "🎯 Next Steps:"
echo "1. Test packages in Chrome and Edge"
echo "2. Create store screenshots"
echo "3. Submit to Chrome Web Store"
echo "4. Submit to Microsoft Edge Add-ons"`;

  fs.writeFileSync('create-packages.sh', packageScript);
  fs.chmodSync('create-packages.sh', '755');
  console.log('✅ Created package script: create-packages.sh');
};

// Main execution
console.log('🏢 Salesforce Advisor - Store Assets Generator');
console.log('============================================');

createDirectories();
generateIconTemplate();
generateStoreDescriptions();
generatePrivacyPolicy();
generatePackageScript();

console.log('');
console.log('✅ All store assets generated successfully!');
console.log('');
console.log('📋 Next Steps:');
console.log('1. Open store-assets/icon-generator.html to create icons');
console.log('2. Take screenshots of the extension in action');
console.log('3. Review and customize descriptions in store-assets/descriptions/');
console.log('4. Update privacy policy with your contact information');
console.log('5. Run ./create-packages.sh to create submission packages');
console.log('6. Submit to Chrome Web Store and Microsoft Edge Add-ons');