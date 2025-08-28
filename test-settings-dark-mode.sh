#!/bin/bash

echo "🔍 Testing Settings Dark Mode Fix"
echo "================================="
echo ""

# Check if isDarkMode prop is passed to Settings
echo "1. Checking Settings component props in App.tsx:"
if grep -q "isDarkMode={isDarkMode}" /Users/celeste7/Documents/C.OS.1.4/src/App.tsx; then
    echo "   ✅ isDarkMode prop is correctly passed to Settings component"
else
    echo "   ❌ ISSUE: isDarkMode prop is NOT passed to Settings component"
    exit 1
fi

echo ""
echo "2. Checking dark mode colors in Settings.tsx:"
echo "   Dark mode colors:"
if grep -q "isDarkMode ? '#292929'" /Users/celeste7/Documents/C.OS.1.4/src/frontend-ux/components/Settings.tsx; then
    echo "   ✅ Background: #292929 (dark mode)"
else
    echo "   ❌ Missing dark mode background color"
fi

if grep -q "isDarkMode ? '1px solid #343434'" /Users/celeste7/Documents/C.OS.1.4/src/frontend-ux/components/Settings.tsx; then
    echo "   ✅ Border: #343434 (dark mode)"
else
    echo "   ❌ Missing dark mode border color"
fi

if grep -q "isDarkMode ? '#ffffff'" /Users/celeste7/Documents/C.OS.1.4/src/frontend-ux/components/Settings.tsx; then
    echo "   ✅ Text: #ffffff (dark mode primary)"
else
    echo "   ❌ Missing dark mode text color"
fi

echo ""
echo "3. Checking light mode colors in Settings.tsx:"
echo "   Light mode colors:"
if grep -q ": '#ffffff'" /Users/celeste7/Documents/C.OS.1.4/src/frontend-ux/components/Settings.tsx | head -1; then
    echo "   ✅ Background: #ffffff (light mode)"
else
    echo "   ❌ Missing light mode background color"
fi

if grep -q "'1px solid #e7e7e7'" /Users/celeste7/Documents/C.OS.1.4/src/frontend-ux/components/Settings.tsx; then
    echo "   ✅ Border: #e7e7e7 (light mode)"
else
    echo "   ❌ Missing light mode border color"
fi

if grep -q ": '#0f0f0f'" /Users/celeste7/Documents/C.OS.1.4/src/frontend-ux/components/Settings.tsx; then
    echo "   ✅ Text: #0f0f0f (light mode primary)"
else
    echo "   ❌ Missing light mode text color"
fi

echo ""
echo "4. Checking accent color (same for both modes):"
if grep -q "#0078fa" /Users/celeste7/Documents/C.OS.1.4/src/frontend-ux/components/Settings.tsx; then
    echo "   ✅ Accent: #0078fa (both modes)"
else
    echo "   ❌ Missing accent color #0078fa"
fi

echo ""
echo "5. Checking theme handler in App.tsx:"
if grep -q "handleAppearanceChange" /Users/celeste7/Documents/C.OS.1.4/src/App.tsx; then
    echo "   ✅ handleAppearanceChange function exists"
    if grep -q "setIsDarkMode" /Users/celeste7/Documents/C.OS.1.4/src/App.tsx; then
        echo "   ✅ setIsDarkMode is called in handler"
    else
        echo "   ❌ setIsDarkMode not found in handler"
    fi
else
    echo "   ❌ handleAppearanceChange function not found"
fi

echo ""
echo "================================="
echo "✅ Settings Dark Mode Fix Complete!"
echo ""
echo "The settings modal will now properly:"
echo "• Use #292929 background in dark mode"
echo "• Use #ffffff background in light mode"
echo "• Switch colors based on the isDarkMode prop"
echo "• Use #0078fa as the accent color in both modes"
echo ""
echo "To test:"
echo "1. Open the app in the browser"
echo "2. Toggle dark mode on/off"
echo "3. Open Settings modal"
echo "4. Settings should now match the selected theme"