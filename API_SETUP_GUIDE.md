# 🚀 Salesforce Advisor - API Setup Guide

## Quick Start: Get Your AI Assistant Running in 5 Minutes

### 🎯 **Option 1: OpenRouter (Recommended - FREE Models Available)**

#### **Step 1: Create OpenRouter Account**
1. Go to [OpenRouter.ai](https://openrouter.ai)
2. Click **"Sign Up"** (top right)
3. Use Google/GitHub or create account with email
4. ✅ **Account created - FREE!**

#### **Step 2: Get Your API Key**
1. After login, go to [Keys Page](https://openrouter.ai/keys)
2. Click **"Create Key"**
3. Name it: `Salesforce Advisor`
4. Click **"Create"**
5. **Copy the key** (starts with `sk-or-v1-...`)
6. ⚠️ **Save it safely** - you won't see it again!

#### **Step 3: Configure Extension**
1. **Right-click** Salesforce Advisor extension icon
2. Select **"Options"**
3. **AI Provider**: Select "OpenRouter"
4. **API Key**: Paste your key
5. **Model**: Choose "DeepSeek Chat v3.1 (Free)" ⭐ **RECOMMENDED**
6. Click **"Save Settings"**
7. Click **"Test Connection"** to verify
8. ✅ **Ready to use!**

#### **💰 Cost: FREE Models Available**
- **DeepSeek Chat v3.1**: Completely FREE
- **NVIDIA Nemotron**: Completely FREE  
- **Alibaba Tongyi**: Completely FREE
- **Meta Llama 3.1**: Completely FREE

---

### 🎯 **Option 2: OpenAI (Premium)**

#### **Step 1: Create OpenAI Account**
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Click **"Sign up"**
3. Verify email and phone number
4. Add payment method (required)

#### **Step 2: Get API Key**
1. Go to [API Keys](https://platform.openai.com/api-keys)
2. Click **"Create new secret key"**
3. Name it: `Salesforce Advisor`
4. **Copy the key** (starts with `sk-...`)
5. ⚠️ **Save it safely**

#### **Step 3: Configure Extension**
1. **Right-click** extension icon → **"Options"**
2. **AI Provider**: Select "OpenAI Direct"
3. **API Key**: Paste your key
4. **Model**: Choose "GPT-3.5 Turbo" (cheaper) or "GPT-4" (better)
5. **Save Settings** and **Test Connection**

#### **💰 Cost: Pay-per-use**
- **GPT-3.5 Turbo**: ~$0.002 per conversation
- **GPT-4**: ~$0.02 per conversation

---

### 🎯 **Option 3: Azure OpenAI (Enterprise)**

#### **Step 1: Azure Setup**
1. Go to [Azure Portal](https://portal.azure.com)
2. Create **Azure OpenAI Service**
3. Deploy a model (GPT-3.5 or GPT-4)
4. Get **endpoint URL** and **API key**

#### **Step 2: Configure Extension**
1. **Right-click** extension → **"Options"**
2. **AI Provider**: Select "Azure OpenAI"
3. **API Key**: Your Azure API key
4. **Endpoint**: Your Azure endpoint URL
5. **Deployment**: Your model deployment name
6. **Save Settings** and **Test Connection**

---

## 🔧 **Troubleshooting**

### **❌ "Connection Failed"**
- **Check API key**: Make sure it's copied correctly
- **Check internet**: Ensure stable connection
- **Check credits**: OpenAI requires payment method
- **Try different model**: Some models may be unavailable

### **❌ "Invalid API Key"**
- **Regenerate key**: Create a new API key
- **Check provider**: Ensure correct provider selected
- **Remove spaces**: API key should have no extra spaces

### **❌ "Model Not Found"**
- **Try free models**: DeepSeek, NVIDIA Nemotron, Alibaba Tongyi
- **Check OpenRouter**: Some models may be temporarily unavailable
- **Use fallback**: Extension automatically tries backup models

---

## 🎯 **Recommended Setup for Different Users**

### **🆓 Free Users**
- **Provider**: OpenRouter
- **Model**: DeepSeek Chat v3.1 (Free)
- **Cost**: $0
- **Quality**: Excellent for Salesforce help

### **💼 Business Users**
- **Provider**: OpenRouter
- **Model**: Claude 3.5 Sonnet or GPT-4o
- **Cost**: ~$0.01-0.05 per conversation
- **Quality**: Premium AI assistance

### **🏢 Enterprise Users**
- **Provider**: Azure OpenAI
- **Model**: GPT-4 (your deployment)
- **Cost**: Based on Azure pricing
- **Quality**: Enterprise-grade with data control

---

## 🚀 **Getting Started Tips**

### **First Questions to Try:**
1. *"Help me understand this Salesforce page"*
2. *"Debug this error I'm seeing"*
3. *"What should I do next on this record?"*
4. *"Explain this validation rule"*
5. *"How do I create a flow for this process?"*

### **Best Practices:**
- ✅ **Be specific**: "Help with Lead conversion" vs "Help me"
- ✅ **Include context**: Extension automatically detects your page
- ✅ **Ask follow-ups**: Continue the conversation for better help
- ✅ **Use privacy**: Extension filters sensitive data automatically

---

## 🛡️ **Privacy & Security**

### **What Gets Sent to AI:**
- ✅ **Page context**: What Salesforce page you're on
- ✅ **Your questions**: What you type
- ✅ **Filtered data**: PII and sensitive info automatically removed

### **What NEVER Gets Sent:**
- ❌ **Personal data**: Emails, phones, SSNs filtered out
- ❌ **Salesforce IDs**: Record IDs and session tokens filtered
- ❌ **Passwords**: Any sensitive form data filtered
- ❌ **Your API key**: Stored locally, never transmitted

---

## 📞 **Need Help?**

### **Quick Support:**
- **Test Connection**: Use the "Test Connection" button in settings
- **Try Free Models**: Start with DeepSeek Chat v3.1 (free)
- **Check Console**: Press F12 to see any error messages
- **Restart Extension**: Disable and re-enable the extension

### **Common Solutions:**
1. **Clear browser cache** and restart
2. **Update extension** to latest version
3. **Try different model** if one isn't working
4. **Check Salesforce page** - extension works best on SF pages

---

## 🎉 **You're Ready!**

Once configured, your Salesforce Advisor will:
- 🎯 **Understand your context** automatically
- 🛡️ **Protect your privacy** with advanced filtering
- 💬 **Provide expert help** for any Salesforce question
- 📚 **Remember conversations** for better assistance
- ⚡ **Work instantly** on any Salesforce page

**Happy Salesforce-ing!** 🚀

---

*Last updated: December 2024*
*Version: 2.0.1*