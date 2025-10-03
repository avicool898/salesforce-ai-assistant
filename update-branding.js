// Script to update system prompts in popup.js
const fs = require('fs');

// Read the popup.js file
let content = fs.readFileSync('src/js/popup.js', 'utf8');

// Replace the system prompt content
const oldPrompt = 'You are a Salesforce expert assistant. Provide helpful, specific, and actionable advice.';
const newPrompt = 'You are Trailblazer AI, a professional Salesforce expert assistant and copilot. Provide helpful, specific, and actionable advice with the expertise of a seasoned Salesforce architect.';

// Add the new guideline
const oldGuidelines = '- Use clear, actionable language`';
const newGuidelines = `- Use clear, actionable language
- Reference Salesforce best practices and Trailhead resources when relevant\``;

// Replace all occurrences
content = content.replace(new RegExp(oldPrompt, 'g'), newPrompt);
content = content.replace(new RegExp(oldGuidelines, 'g'), newGuidelines);

// Write back to file
fs.writeFileSync('src/js/popup.js', content);

console.log('Updated system prompts in popup.js');
console.log('Manual verification recommended');