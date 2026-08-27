# HBMP AgentBot - Knowledge Transfer Guide

## 📋 Overview

**HBMP AgentBot** is an AI chat platform built on LibreChat supporting multiple AI models (Google Gemini, OpenAI, Claude) with agent capabilities like code execution, web search, and file processing.

**Tech Stack:**

- Frontend: React 18 + TypeScript + Vite + TailwindCSS + Capacitor (mobile)
- Backend: Node.js + Express + MongoDB + Meilisearch
- AI: Google Gemini (Primary), OpenAI, Anthropic, Azure OpenAI
- Monorepo with shared packages: `@librechat/data-schemas`, `@librechat/api`, `@librechat/data-provider`

**Architecture:**

```
Frontend (React) :3090 → Backend (Express) :3080 → [MongoDB + Meilisearch + RAG API :8000]
```

---

## ✅ Prerequisites

- **Node.js** v18+ and npm v9+
- **Docker Desktop** (running)
- **Git**
- For iOS: **Xcode** + CocoaPods (`sudo gem install cocoapods`)
- For Android: **Android Studio** + Java JDK 17+

---

## 🚀 First-Time Setup

### 1. Clone & Install

```bash
git clone https://github.com/AbhinavJD7/HBMP-AgentBot.git
cd HBMP-AgentBot
npm install
npm run build:packages  # MUST run this first!
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` - **Required fields:**

```env
PORT=3080
MONGO_URI=mongodb://localhost:27017/LibreChat
MEILI_HOST=http://localhost:7700
GOOGLE_KEY=your_gemini_api_key_here  # REQUIRED
SESSION_SECRET=your_secret_here
JWT_SECRET=your_secret_here
ALLOW_REGISTRATION=true
```

### 3. Configure `librechat.yaml`

Key settings (already configured):

```yaml
version: 1.3.1
interface:
  customWelcome: 'Welcome to HBMP AgentBot!'
endpoints:
  google:
    models:
      default: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash']
    titleModel: 'gemini-2.5-flash'
  agents:
    capabilities: ['execute_code', 'file_search', 'web_search', 'actions', 'artifacts']
```

---

## ▶️ Running the Application

**Terminal 1 - Docker Services:**

```bash
docker-compose up -d
docker-compose ps  # Verify all running
```

**Terminal 2 - Backend:**

```bash
npm run backend:dev  # Runs on http://localhost:3080
```

**Terminal 3 - Frontend:**

```bash
cd client
npm run dev  # Runs on http://localhost:3090 (dev mode with HMR)
```

**Access:** Open browser at `http://localhost:3080` or `http://localhost:3090`

---

## 📁 Project Structure

```
HBMP-AgentBot/
├── api/                # Backend (Node.js/Express)
│   ├── server/         # Entry point, routes, controllers
│   ├── app/clients/    # AI provider integrations
│   ├── models/         # MongoDB schemas
│   └── utils/
├── client/             # Frontend (React/Vite)
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom hooks
│   │   └── store/      # Recoil state
│   └── vite.config.ts
├── packages/           # Shared monorepo packages
│   ├── api/
│   ├── client/
│   ├── data-provider/
│   └── data-schemas/
├── config/             # User management scripts
├── scripts/            # Build scripts
├── .env                # Environment variables
├── librechat.yaml     # App configuration
└── docker-compose.yml
```

---

## 🎨 Key Features

- **Multi-Model AI:** Gemini, GPT, Claude support
- **Agent Capabilities:** Code execution, file search, web search, custom actions
- **File Processing:** PDF, images, audio transcription
- **Mobile Apps:** iOS/Android via Capacitor
- **User Management:** Auth, profiles, conversation history

---

## 📱 Mobile App Build

### iOS Build

```bash
npm run build:client           # Build web app
npm run cap:add:ios            # First time only
npm run cap:sync               # Sync web assets
npm run cap:open:ios           # Opens Xcode
# In Xcode: Configure team, Bundle ID, signing, then build
```

### Android Build

```bash
npm run cap:add:android
npm run cap:sync
npm run cap:open:android       # Opens Android Studio
# Configure signing, then Build → Generate Signed APK
```

---

## 🐛 Troubleshooting

**Backend won't start - module not found:**

```bash
npm run build:packages
```

**Docker services not running:**

```bash
docker-compose down && docker-compose up -d
docker-compose ps
```

**Frontend build out of memory:**

```bash
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build:client
```

**Invalid YAML config:**

- Check `librechat.yaml` indentation (2 spaces)
- Verify capability names match: `execute_code`, `file_search`, `web_search`, `actions`, `artifacts`

**API key errors:**

- Verify `GOOGLE_KEY` in `.env`
- Restart backend after `.env` changes
- Check backend terminal for API errors

---

## 🔑 Essential Scripts

```bash
# Development
npm run backend:dev              # Start backend (nodemon)
npm run dev                      # Frontend dev server (in client/)
npm run build:packages           # Build monorepo packages (ALWAYS run first)

# Building
npm run build:client             # Production frontend build
npm run build:production         # Full production build

# User Management
npm run create-user              # Create user
npm run list-users               # List users
npm run reset-password           # Reset password

# Mobile
npm run cap:sync                 # Sync web to native
npm run cap:open:ios             # Open Xcode
npm run cap:open:android         # Open Android Studio

# Docker
docker-compose up -d             # Start services
docker-compose down              # Stop services
docker-compose ps                # Check status
```

---

## 🔐 Production Checklist

1. Change all secrets in `.env` (SESSION_SECRET, JWT_SECRET)
2. Set `NODE_ENV=production`
3. Set `ALLOW_REGISTRATION=false` (if not needed)
4. Use strong MongoDB/Meilisearch passwords
5. Enable HTTPS (nginx reverse proxy)
6. Never commit `.env` to git
7. Rotate API keys regularly

---

## 🚢 Deployment

**Docker:**

```bash
docker-compose -f deploy-compose.yml up -d
```

**Cloud Platforms:**

- **Zeabur:** Configured with `nixpacks.toml`
- **Railway:** Configured with `railway.json`
- **Kubernetes:** Helm charts in `helm/librechat/`

---

## 💡 Development Tips

**Daily Workflow:**

```bash
docker-compose up -d          # Start services
npm run backend:dev           # Terminal 1
cd client && npm run dev      # Terminal 2
```

**Important Rules:**

1. Always run `npm run build:packages` after `npm install`
2. Keep Docker running before starting backend
3. Backend changes need manual restart
4. Frontend auto-refreshes with Vite HMR
5. Config/env changes need backend restart

**Debugging:**

- Backend errors: Check terminal output
- Frontend errors: Chrome DevTools console
- Database: Use MongoDB Compass
- API testing: Use Postman

---

## 📚 Resources

- LibreChat Docs: https://www.librechat.ai/docs
- Capacitor Docs: https://capacitorjs.com/docs
- Vite Docs: https://vitejs.dev

---

## 🆘 Common Issues

**Q: Backend shows "Cannot find module '@librechat/...'?"**  
A: Run `npm run build:packages`

**Q: Docker containers not starting?**  
A: Ensure Docker Desktop is running, then `docker-compose up -d`

**Q: Frontend won't connect to backend?**  
A: Check both are running, backend on :3080, frontend proxies correctly

**Q: API calls failing?**  
A: Verify API keys in `.env`, restart backend, check logs

**Q: Meilisearch errors in logs?**  
A: Usually non-critical, restart with `docker-compose restart meilisearch`

---

## 🍎 App Store & Play Store Deployment

### App Store Rejection Issues & Fixes

The iOS app faced 3 App Store rejections. Here's how we fixed them:

#### 1. Camera Crash (Guideline 2.1 - Performance)

**Problem:** App crashed when accessing camera due to missing `NSCameraUsageDescription` in Info.plist.

**Solution - Created `usePhotoCapture` hook** (`/client/src/hooks/usePhotoCapture.ts`):

```typescript
import { Camera } from '@capacitor/camera';
import { useLocalize } from '@/hooks/useLocalizeHandler';

export const usePhotoCapture = () => {
  const localize = useLocalize();

  const checkPermissions = async () => {
    const status = await Camera.checkPermissions();
    if (status.camera === 'granted') return true;
    if (status.camera === 'prompt') {
      const result = await Camera.requestPermissions();
      return result.camera === 'granted';
    }
    return false;
  };

  const takePhoto = async () => {
    const hasPermission = await checkPermissions();
    if (!hasPermission) throw new Error(localize('com_ui_camera_permission_denied'));
    
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: 'uri',
    });
    return image.webPath || null;
  };

  return { takePhoto, checkPermissions };
};
```

**Created Error Boundary** (`/client/src/components/Chat/Input/Files/FileUploadErrorBoundary.tsx`):

```typescript
import React, { Component, ReactNode, ErrorInfo } from 'react';

export class FileUploadErrorBoundary extends Component<{ children: ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-500 text-sm p-2">Unable to process file.</div>;
    }
    return this.props.children;
  }
}
```

**Added Privacy Permissions** to `/ios/App/App/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>HBMP AgentBot needs camera access to take photos.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>HBMP AgentBot needs access to your photo library.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>HBMP AgentBot needs permission to save photos.</string>

<key>NSMicrophoneUsageDescription</key>
<string>HBMP AgentBot needs microphone access for voice features.</string>

<!-- Plus 6 more: NSLocationWhenInUseUsageDescription, NSSpeechRecognitionUsageDescription, NSContactsUsageDescription, NSCalendarsUsageDescription, NSRemindersUsageDescription, NSFaceIDUsageDescription -->
```

#### 2. Invalid Support URL (Guideline 5.1)

**Problem:** Support URL `https://grow24.ai` returned 404.

**Solution:** Changed to `https://grow24.ai/` (verified working).

**Steps in App Store Connect:**
1. Go to **App Information** → **Support URL**
2. Enter working URL
3. Click **Save**

#### 3. iPad Screenshots (Guideline 5.1)

**Problem:** Using stretched iPhone screenshots for iPad instead of proper iPad-sized images.

**Solution - Download iPad Simulator & Capture Real Screenshots:**

```bash
# Download iPad Air 13" simulator via Xcode Settings
xcode-select --install  # If needed

# Build and sync
npm run build:client
npm run cap:sync

# Open Xcode and run on iPad simulator
npm run cap:open:ios
# Then: Select iPad Air 13" and run
```

**In Xcode Simulator:**
1. Navigate to main chat screen
2. Press **⌘S** to take screenshot (3 times for 3 screens)
3. Screenshots save automatically

**Upload to App Store Connect:**
1. Go to **Media Manager** → **iPad** tab
2. For each iPad size (11", 12.9"):
   - Click **Edit**
   - Upload 3 iPad screenshots (1668×2224 or 2048×2732)
   - Click **Save**

### App Icon Fix

**Problem:** Icon reverted to default after iOS platform regeneration.

**Solution - Convert to Opaque PNG:**

```bash
# Strip alpha channel using sips (macOS)
sips "client/public/assets/iconapp.png" --setProperty format jpeg -o /tmp/iconapp_opaque.jpg
sips -z 1024 1024 /tmp/iconapp_opaque.jpg --out /tmp/iconapp_1024.jpg
sips /tmp/iconapp_1024.jpg --setProperty format png -o "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png"

# Remove default icon fallback
rm -f "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
```

**Update** `/ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json`:

```json
{
  "images": [
    {
      "idiom": "universal",
      "filename": "AppIcon-1024.png",
      "scale": "1x"
    }
  ]
}
```

### Build & Submit Process

**Step 1 - Clean Build:**

```bash
xcodebuild clean -project ios/App/App.xcodeproj -scheme App
# Or in Xcode: Product → Clean Build Folder (⇧⌘K)
```

**Step 2 - Archive:**

```bash
# In Xcode: Select "Any iOS Device (arm64)" scheme
# Product → Archive
# Wait for completion (~2-3 minutes)
```

**Step 3 - Upload:**

```bash
# Xcode Organizer will open after archive
# Click "Distribute App" → "App Store Connect" → "Upload"
# Select team "Rishika Seth"
```

**Step 4 - Add Build & Submit:**

In App Store Connect:
1. Go to **Distribution** → **iOS App Version 1.0**
2. Scroll to **Build** section → Click **+** to add build
3. Select newly uploaded build
4. Click **Save**
5. Click **Resubmit to App Review**

### Submission Checklist

- ✅ Camera permission hook (usePhotoCapture)
- ✅ Error boundary (FileUploadErrorBoundary)
- ✅ 10 privacy descriptions in Info.plist
- ✅ App icon opaque (1024×1024 PNG)
- ✅ Real iPad screenshots (proper dimensions)
- ✅ Support URL working
- ✅ Clean build & archive
- ✅ Build uploaded
- ✅ Build added to version
- ✅ Submitted for review

**Review Timeline:** Typically 24-48 hours

---

**Last Updated:** February 2026 | **Version:** v0.8.1-rc1 | **Maintainer:** Abhinav Rai
