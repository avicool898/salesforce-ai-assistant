@echo off
REM Package creation script for store submissions (Windows)

echo 🚀 Creating Salesforce Advisor extension packages...

REM Create clean build directory
if exist build rmdir /s /q build
mkdir build
if not exist store-assets mkdir store-assets

REM Copy source files (excluding development files)
xcopy src build\ /e /i /q
if exist build\test-*.html del build\test-*.html
if exist build\*.md del build\*.md

echo 🔍 Validating manifest.json...
REM Basic validation - check if file exists and is not empty
if not exist build\manifest.json (
    echo ❌ manifest.json not found
    exit /b 1
)

echo 📦 Creating Chrome Web Store package...
cd build
powershell -command "Compress-Archive -Path * -DestinationPath ..\store-assets\salesforce-advisor-chrome.zip -Force"
cd ..

echo 📦 Creating Microsoft Edge package...
copy store-assets\salesforce-advisor-chrome.zip store-assets\salesforce-advisor-edge.zip

echo ✅ Packages created:
echo    - store-assets\salesforce-advisor-chrome.zip
echo    - store-assets\salesforce-advisor-edge.zip

echo.
echo 📦 Package Information:
dir store-assets\*.zip

echo.
echo 🎯 Next Steps:
echo 1. Test packages in Chrome and Edge
echo 2. Create store screenshots using the extension
echo 3. Generate icons using store-assets\icon-generator.html
echo 4. Submit to Chrome Web Store Developer Dashboard
echo 5. Submit to Microsoft Edge Add-ons Partner Center

echo.
echo 🚀 Ready for store submission!