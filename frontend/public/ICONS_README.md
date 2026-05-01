# PWA Icons Setup

## Required Icons

For the PWA to work properly, you need to add two icon files to this directory:

### 1. icon-192.png
- **Size:** 192x192 pixels
- **Format:** PNG
- **Purpose:** App icon for mobile devices
- **Usage:** Home screen icon, app launcher

### 2. icon-512.png
- **Size:** 512x512 pixels
- **Format:** PNG
- **Purpose:** High-resolution app icon
- **Usage:** Splash screen, app store listings

## How to Create Icons

### Option 1: Use Your Business Logo
1. Open your logo in an image editor (Photoshop, GIMP, Canva)
2. Resize to 512x512 pixels
3. Export as PNG
4. Create a 192x192 version
5. Save both files in this directory

### Option 2: Use a Free Tool
1. Visit https://realfavicongenerator.net/
2. Upload your logo
3. Generate icons
4. Download and extract
5. Rename to icon-192.png and icon-512.png

### Option 3: Use a Simple Design
Create a simple colored square with your business initial:
1. Background: Orange (#f97316)
2. Text: White, large font
3. Letter: First letter of business name
4. Export as PNG in both sizes

## Design Guidelines

### Best Practices:
- ✅ Use simple, recognizable design
- ✅ High contrast colors
- ✅ Avoid fine details (they don't scale well)
- ✅ Test on both light and dark backgrounds
- ✅ Use your brand colors

### Avoid:
- ❌ Text that's too small
- ❌ Complex gradients
- ❌ Transparent backgrounds (use solid color)
- ❌ Photos (use logos or symbols)

## Quick Template

If you need a quick solution, use this CSS to generate a simple icon:

```html
<div style="width: 512px; height: 512px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); display: flex; align-items: center; justify-content: center; font-size: 280px; color: white; font-weight: bold; font-family: Arial;">
  B
</div>
```

Take a screenshot and save as icon-512.png, then resize to 192x192.

## Verification

After adding icons:
1. Check manifest.json references them correctly
2. Test PWA install on mobile device
3. Verify icon appears on home screen
4. Check splash screen shows icon

## Fallback

If icons are missing, the PWA will still work but:
- Default browser icon will be used
- Install prompt may not appear
- Home screen icon will be generic

## Current Status

⚠️ **Icons not yet added** - Please add icon-192.png and icon-512.png to this directory.

Once added, the PWA will be fully functional!
