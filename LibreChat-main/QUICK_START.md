# ⚡ LibreChat Quick Start Guide

## 🎯 You're Almost There!

I've set up everything for you. Here's what to do next:

## 📝 Step-by-Step Instructions

### **1. Add Your Gemini API Key** (2 minutes)

Open the `.env` file and replace `user_provided` with your actual Gemini API key:

```bash
# Open the file
notepad .env

# Find this line:
GOOGLE_KEY=user_provided

# Change it to (replace with your actual key):
GOOGLE_KEY=AIzaSyABCDEFGH1234567890_your_actual_key_here

# Save and close
```

### **2. Start Docker Desktop** (1 minute)

1. Press Windows key and search for "Docker Desktop"
2. Click to open it
3. Wait until you see "Docker Desktop is running" in the system tray (green icon)

### **3. Run the Automated Setup** (15-20 minutes first time)

Double-click on `setup-and-run.bat` or run in terminal:

```bash
setup-and-run.bat
```

This script will:
- ✅ Install all dependencies (~5-10 min)
- ✅ Build the frontend (~5-10 min)
- ✅ Start MongoDB and Meilisearch
- ✅ Start LibreChat server

### **4. Access LibreChat**

Once you see "Connected to MongoDB", open your browser:
```
http://localhost:3080
```

### **5. Create Your Account**

1. Click "Sign up"
2. Enter your email and password
3. Click "Sign up"
4. You're in! 🎉

### **6. Start Using Gemini**

1. Click on the model dropdown (top of chat)
2. Select "Google" endpoint
3. Choose a Gemini model:
   - `gemini-2.0-flash-exp` (fastest, latest)
   - `gemini-1.5-pro` (most capable)
   - `gemini-1.5-flash` (balanced)
4. Start chatting!

---

## 🔄 **For Next Time** (Quick Start)

After the initial setup, you only need:

1. **Start Docker Desktop** (if not running)
2. **Double-click:** `start-librechat.bat`
3. **Open browser:** http://localhost:3080

---

## ❓ Troubleshooting

### "Docker is not running"
- Open Docker Desktop and wait for it to fully start
- You should see a green icon in your system tray

### "MongoDB connection failed"
Run in terminal:
```bash
docker compose up -d mongodb meilisearch
```

### "Port 3080 is already in use"
Something else is using that port. Change it in `.env`:
```bash
PORT=3081
DOMAIN_CLIENT=http://localhost:3081
DOMAIN_SERVER=http://localhost:3081
```

### Need to reinstall everything?
```bash
npm run reinstall
```

---

## 🎨 **What You Can Do**

✅ Chat with Gemini AI models  
✅ Upload and analyze images  
✅ Attach documents and PDFs  
✅ Create conversation presets  
✅ Search your chat history  
✅ Fork conversations for different paths  
✅ Share conversations  
✅ Create custom prompts  

---

## 📚 **Learn More**

- **Full Documentation:** https://docs.librechat.ai
- **Discord Community:** https://discord.librechat.ai
- **YouTube Tutorials:** https://www.youtube.com/@LibreChat

---

## 🚀 **Next Steps**

1. Try uploading an image and asking Gemini to analyze it
2. Create a custom preset with your favorite settings
3. Explore the Prompts library
4. Check out the documentation for advanced features

---

**Need help?** Check `SETUP_GUIDE.md` for detailed instructions!

**Happy chatting! 💬✨**

