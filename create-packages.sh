#!/bin/bash
# Package creation script for store submissions

echo "🚀 Creating Salesforce Advisor extension packages..."

# Create clean build directory
rm -rf build
mkdir -p build
mkdir -p store-assets

# Copy source files (excluding development files)
cp -r src/* build/
rm -f build/test-*.html
rm -f build/*.md

# Validate manifest
echo "🔍 Validating manifest.json..."
if ! python3 -m json.tool build/manifest.json > /dev/null 2>&1; then
    echo "❌ Invalid manifest.json"
    exit 1
fi

# Create Chrome Web Store package
echo "📦 Creating Chrome Web Store package..."
cd build
zip -r ../store-assets/salesforce-advisor-chrome.zip . -x "*.DS_Store" "*.git*" "node_modules/*" "*.log"
cd ..

# Create Microsoft Edge package (same as Chrome for Manifest v3)
echo "📦 Creating Microsoft Edge package..."
cp store-assets/salesforce-advisor-chrome.zip store-assets/salesforce-advisor-edge.zip

echo "✅ Packages created:"
echo "   - store-assets/salesforce-advisor-chrome.zip"
echo "   - store-assets/salesforce-advisor-edge.zip"

# Display package info
echo ""
echo "📦 Package Information:"
ls -lh store-assets/*.zip

# Validate package contents
echo ""
echo "🔍 Package Contents:"
unzip -l store-assets/salesforce-advisor-chrome.zip | head -20

echo ""
echo "🎯 Next Steps:"
echo "1. Test packages in Chrome and Edge"
echo "2. Create store screenshots using the extension"
echo "3. Generate icons using store-assets/icon-generator.html"
echo "4. Submit to Chrome Web Store Developer Dashboard"
echo "5. Submit to Microsoft Edge Add-ons Partner Center"

# Check package size
CHROME_SIZE=$(stat -f%z store-assets/salesforce-advisor-chrome.zip 2>/dev/null || stat -c%s store-assets/salesforce-advisor-chrome.zip)
CHROME_SIZE_MB=$((CHROME_SIZE / 1024 / 1024))

echo ""
echo "📊 Package Size: ${CHROME_SIZE_MB}MB (Chrome limit: 128MB, Edge limit: 200MB)"

if [ $CHROME_SIZE_MB -gt 128 ]; then
    echo "⚠️  Warning: Package exceeds Chrome Web Store limit (128MB)"
fi

echo ""
echo "🚀 Ready for store submission!"