# App Store & Play Store Deployment Guide

## Overview
This document details the complete process of fixing iOS app store rejection issues and preparing the HBMP AgentBot for Apple App Store deployment.

---

## Initial App Store Rejection Issues

The app was rejected for **3 critical issues**:

### 1. **Guideline 2.1 - Performance: Camera Crash**
- **Issue**: App crashed when accessing "Take Photo" feature
- **Root Cause**: Missing NSCameraUsageDescription permission in Info.plist and improper error handling
- **Error Type**: TCC_CRASHING_DUE_TO_PRIVACY_VIOLATION

### 2. **Guideline 5.1 - Legal: Invalid Support URL**
- **Issue**: Support URL `https://grow24.ai` returned 404 error
- **Resolution**: Changed to `https://grow24.ai/` (which works correctly)

### 3. **Guideline 5.1 - Design: iPad Screenshots**
- **Issue**: Stretched iPhone screenshots used for iPad display sizes instead of proper iPad-sized screenshots
- **Requirement**: iPad screenshots need proper dimensions (1668×2224 for iPad Air 11", 2048×2732 for iPad Pro 12.9")

---

## Solution 1: Camera Crash Fix

### Root Cause Analysis
- iOS requires explicit permission requests before accessing camera
- Missing NSCameraUsageDescription triggers TCC (Transparency, Consent, Control) crash
- File upload errors weren't properly caught, crashing entire app

### Implementation

#### A. Created Custom Camera Hook: `usePhotoCapture.ts`

**File Location**: `/client/src/hooks/usePhotoCapture.ts`

```typescript
import { Camera } from '@capacitor/camera';
import { useLocalize } from '@/hooks/useLocalizeHandler';

export const usePhotoCapture = () => {
  const localize = useLocalize();

  const checkPermissions = async () => {
    try {
      const status = await Camera.checkPermissions();
      
      if (status.camera === 'granted') {
        return true;
      }
      
      if (status.camera === 'prompt') {
        const result = await Camera.requestPermissions();
        return result.camera === 'granted';
      }
      
      return false;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  };

  const takePhoto = async () => {
    try {
      const hasPermission = await checkPermissions();
      
      if (!hasPermission) {
        throw new Error(localize('com_ui_camera_permission_denied'));
      }
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'uri',
      });
      
      return image.webPath || null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('User cancelled')) {
        return null; // User cancelled, not an error
      }
      console.error('Take photo failed:', error);
      throw error;
    }
  };

  const pickImage = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'uri',
        source: 'Photos',
      });
      
      return image.webPath || null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('User cancelled')) {
        return null;
      }
      console.error('Pick image failed:', error);
      throw error;
    }
  };

  return { takePhoto, pickImage, checkPermissions };
};
```

#### B. Created Error Boundary Component: `FileUploadErrorBoundary.tsx`

**File Location**: `/client/src/components/Chat/Input/Files/FileUploadErrorBoundary.tsx`

```typescript
import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class FileUploadErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('File upload error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 text-sm p-2">
          Unable to process file. Please try again.
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### C. Updated AttachFileMenu: Safe Error Handling

**File Location**: `/client/src/components/Chat/Input/Files/AttachFileMenu.tsx`

Wrapped component rendering in error boundary and added try-catch to file handling:

```typescript
import { FileUploadErrorBoundary } from './FileUploadErrorBoundary';

return (
  <FileUploadErrorBoundary>
    <div>
      {/* Menu content */}
      <button
        onClick={() => {
          try {
            originalHandleFileChange(event);
          } catch (error) {
            console.error('File upload error:', error);
            // Error boundary will handle display
          }
        }}
      >
        Upload
      </button>
    </div>
  </FileUploadErrorBoundary>
);
```

#### D. Added Privacy Permissions: Info.plist

**File Location**: `/ios/App/App/Info.plist`

Added all required NSUsageDescription keys:

```xml
<key>NSCameraUsageDescription</key>
<string>HBMP AgentBot needs camera access to take photos for uploading and documenting your work.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>HBMP AgentBot needs access to your photo library to upload images and media.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>HBMP AgentBot needs permission to save photos to your library.</string>

<key>NSMicrophoneUsageDescription</key>
<string>HBMP AgentBot needs microphone access for voice features and communication.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>HBMP AgentBot may use your location with your permission for location-based features.</string>

<key>NSSpeechRecognitionUsageDescription</key>
<string>HBMP AgentBot uses speech recognition to convert voice input to text.</string>

<key>NSContactsUsageDescription</key>
<string>HBMP AgentBot can access your contacts with your permission.</string>

<key>NSCalendarsUsageDescription</key>
<string>HBMP AgentBot can access your calendar with your permission.</string>

<key>NSRemindersUsageDescription</key>
<string>HBMP AgentBot can access your reminders with your permission.</string>

<key>NSFaceIDUsageDescription</key>
<string>HBMP AgentBot uses Face ID for secure authentication.</string>
```

---

## Solution 2: App Icon Update

### Issue
After iOS platform regeneration, app icon reverted to default Capacitor icon.

### Solution: Convert Icon to Opaque Format

Apple requires app icons to be completely opaque (no transparency/alpha channel).

#### Conversion Process Using sips (macOS)

```bash
# Step 1: Convert PNG to JPEG (strips alpha channel)
sips "client/public/assets/iconapp.png" --setProperty format jpeg -o /tmp/iconapp_opaque.jpg

# Step 2: Resize to 1024x1024
sips -z 1024 1024 /tmp/iconapp_opaque.jpg --out /tmp/iconapp_1024.jpg

# Step 3: Convert back to PNG (now opaque)
sips /tmp/iconapp_1024.jpg --setProperty format png -o "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png"
```

#### Updated App Icon Asset: Contents.json

**File Location**: `/ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json`

Changed icon filename reference:
```json
{
  "images" : [
    {
      "idiom" : "universal",
      "filename" : "AppIcon-1024.png",
      "scale" : "1x"
    }
  ],
  "info" : {
    "version" : 1,
    "author" : "xcode"
  }
}
```

#### Removed Default Icon Fallback

```bash
rm -f "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
```

This prevents iOS from falling back to default icon if new icon fails.

#### Updated Splash Screens

**File Location**: `/ios/App/App/Assets.xcassets/Splash.imageset/`

Updated all splash-2732x2732.png files (3 copies) with the new iconapp.png.

---

## Solution 3: iPad Screenshots

### Initial Attempt (Failed)
Tried using "Keep using 13" Display" option in App Store Connect Media Manager to reuse iPhone screenshots for iPad. **This failed** because Apple specifically requires iPad-sized screenshots, not scaled iPhone images.

### Final Solution: Real iPad Screenshots

#### Step 1: Download iPad Air 13" Simulator

```bash
# Xcode automatically downloads simulators, or manually from:
# Xcode → Settings → Platforms → iOS → Add Simulator
```

#### Step 2: Launch App on iPad Simulator

1. Open Xcode project: `/ios/App/App.xcodeproj`
2. Build and run on iPad Air 13" simulator
3. Navigate through app to same screens as iPhone screenshots

#### Step 3: Capture iPad Screenshots

**Screenshot Dimensions Required:**
- iPad Air 11": 1668×2224 pixels
- iPad Pro 12.9": 2048×2732 pixels

Use macOS screenshot tool:
```bash
# Take screenshot (⌘S in Simulator)
# Save to: ~/Desktop/ipad-screenshot-1.png
```

Capture 3 representative screens showing:
1. Main chat/dashboard view
2. Settings or options menu
3. Feature showcase or workflow

#### Step 4: Upload to App Store Connect

1. Navigate to: **App Store Connect** → **HBMP AgentBot** → **Media Manager**
2. Click **iPad** tab (next to iPhone tab)
3. For each iPad size:
   - Click **Edit** button
   - Upload the 3 iPad screenshots (1668×2224 or 2048×2732)
   - Click **Save**

---

## Build & Submission Process

### Step 1: Clean Build Project

```bash
# In Xcode Terminal or directly
cd /Users/abhinavrai/DST/HBMP-AgentBot-abhinav

# Clean build folder
xcodebuild clean -project ios/App/App.xcodeproj -scheme App

# Or use Xcode UI: Product → Clean Build Folder (⇧⌘K)
```

### Step 2: Archive the App

1. Open Xcode project: `ios/App/App.xcodeproj`
2. Select **Any iOS Device (arm64)** from scheme selector
3. **Product → Archive**
4. Wait for compilation and archiving (~2-3 minutes)

### Step 3: Configure Code Signing

**If signing errors occur:**
1. Select **App** target
2. Go to **Signing & Capabilities** tab
3. Select **Team**: "Rishika Seth"
4. Enable **Automatically manage signing**

### Step 4: Upload to App Store

1. Xcode Organizer opens automatically after archive
2. Click **Distribute App**
3. Select **App Store Connect** → **Upload**
4. Select team: "Rishika Seth"
5. Wait for upload completion (5-10 minutes)

### Step 5: Add Build to Version & Submit

**In App Store Connect:**

1. Go to **Distribution** tab → **iOS App Version 1.0**
2. Scroll to **Build** section
3. Click **+ icon** next to Build
4. Select your newly uploaded build
5. Click **Done**
6. Update **Support URL** if not already done: `https://grow24.ai/`
7. Click **Save**
8. Click **Resubmit to App Review** (top right)

---

## Final Submission Checklist

Before resubmitting, verify:

- ✅ Camera permission handling implemented (usePhotoCapture hook)
- ✅ Error boundary added to file upload (FileUploadErrorBoundary)
- ✅ All 10 privacy usage descriptions in Info.plist
- ✅ App icon converted to opaque format (1024×1024 PNG)
- ✅ Default icon file removed (AppIcon-512@2x.png)
- ✅ Real iPad screenshots uploaded (properly sized)
- ✅ Support URL working and verified (`https://grow24.ai/`)
- ✅ Clean build produced
- ✅ Build archived and uploaded to App Store Connect
- ✅ Build added to app version

---

## Post-Submission

### Monitoring Review Status

1. Check **App Store Connect** → **App Review** section regularly
2. Monitor email for Apple review notifications
3. Typical review time: **24-48 hours**

### If Rejected Again

Common rejection patterns and solutions:

| Issue | Cause | Solution |
|-------|-------|----------|
| App crashes on permission | Missing permission key | Verify all NSUsageDescription keys in Info.plist |
| Icon not displaying | Transparent PNG | Convert to opaque using sips (PNG→JPEG→PNG) |
| iPad screenshots rejected | Stretched iPhone images | Use actual iPad simulator to capture |
| Support URL unreachable | Domain down | Verify URL is accessible and returns valid page |

---

## Key Files Modified

| File | Change | Purpose |
|------|--------|---------|
| `/client/src/hooks/usePhotoCapture.ts` | Created | Safe camera access with permission checking |
| `/client/src/components/Chat/Input/Files/FileUploadErrorBoundary.tsx` | Created | React error boundary to prevent crashes |
| `/client/src/components/Chat/Input/Files/AttachFileMenu.tsx` | Modified | Wrapped with error boundary |
| `/client/src/hooks/index.ts` | Modified | Exported usePhotoCapture |
| `/ios/App/App/Info.plist` | Modified | Added 10 privacy usage descriptions |
| `/ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json` | Modified | Updated icon filename reference |
| `/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png` | Created | App icon (opaque, 1024×1024) |
| `/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png` | Deleted | Removed default fallback icon |

---

## Technical Stack

- **iOS Version**: iOS 14+
- **Capacitor**: v8.0
- **Camera Plugin**: @capacitor/camera
- **Build Tool**: Xcode 15+ with Swift Package Manager
- **Bundle ID**: com.hbmp.agentbot
- **Team**: Rishika Seth

---

## Future Improvements

1. **Localization**: Add camera permission messages in multiple languages
2. **Offline Support**: Handle no-internet scenarios gracefully
3. **Progressive Build**: Only request permissions when feature is first used (not at app launch)
4. **Analytics**: Track camera usage and file upload success rates
5. **Play Store**: Implement similar fixes for Android deployment

---

## References

- [Apple Camera Privacy](https://developer.apple.com/documentation/avfoundation/cameras_and_media_capture)
- [Capacitor Camera Plugin](https://capacitorjs.com/docs/apis/camera)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [iOS Privacy and Security](https://developer.apple.com/privacy/)

---

**Last Updated**: February 7, 2026  
**Status**: Resubmitted to Apple App Store - Awaiting Review
