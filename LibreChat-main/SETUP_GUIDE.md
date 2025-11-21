# 🚀 LibreChat Local Setup Guide (Windows)

## Prerequisites

Before starting, make sure you have the following installed:

1. **Node.js** (v20.x or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - You have two options:
   - Option A: Docker Desktop (Recommended) - [Download here](https://www.docker.com/products/docker-desktop/)
   - Option B: MongoDB Community Server - [Download here](https://www.mongodb.com/try/download/community)
3. **Git** (if you haven't cloned the repo yet)

## 📋 Step-by-Step Setup

### Step 1: Configure Your Gemini API Key

1. Open the `.env` file in the root directory (already created for you)
2. Find the line: `GOOGLE_KEY=your_gemini_api_key_here`
3. Replace `your_gemini_api_key_here` with your actual Gemini API key

```bash
# Example:
GOOGLE_KEY=AIzaSyABCDEFGH1234567890abcdefghijk
```

### Step 2: Start MongoDB

#### Option A: Using Docker (Recommended)

1. Make sure Docker Desktop is running
2. Open a terminal in the project root directory
3. Run:
   ```bash
   docker-compose up -d mongodb meilisearch
   ```

#### Option B: Using Local MongoDB

1. Start MongoDB service:
   ```bash
   net start MongoDB
   ```
   Or start it from Services (Windows + R, then type `services.msc`)

### Step 3: Install Dependencies

In your terminal (in the project root directory):

```bash
npm ci
```

This will install all dependencies for the backend, frontend, and packages.

**Note**: This may take 5-10 minutes depending on your internet speed.

### Step 4: Build the Project

Build the frontend and packages:

```bash
npm run frontend
```

This will:
- Build the data-provider package
- Build the data-schemas package  
- Build the API package
- Build the client package
- Create the production build of the React frontend

**Note**: This may take 5-10 minutes and requires ~2GB of RAM.

### Step 5: Start the Backend Server

```bash
npm run backend
```

The server will:
- Connect to MongoDB
- Create necessary database collections
- Initialize search indexes
- Start the API server on port 3080

### Step 6: Access LibreChat

Open your browser and navigate to:
```
http://localhost:3080
```

## 🎯 Quick Start (After Initial Setup)

For subsequent runs, you only need:

1. Make sure MongoDB is running (Docker or local service)
2. Start the backend:
   ```bash
   npm run backend
   ```
3. Open http://localhost:3080

## 👨‍💻 Development Mode

If you want to develop/modify the frontend:

### Terminal 1 - Backend (with auto-reload):
```bash
npm run backend:dev
```

### Terminal 2 - Frontend (with hot-reload):
```bash
npm run frontend:dev
```

Then access the development server at: http://localhost:3090

## 📝 Create Your First User

1. Go to http://localhost:3080
2. Click "Sign up" 
3. Enter your email and password
4. You'll be automatically logged in

## 🤖 Using Gemini

1. After logging in, click on the model selector dropdown
2. Select "Google" as the endpoint
3. Choose your Gemini model (e.g., gemini-2.0-flash-exp, gemini-1.5-pro)
4. Start chatting!

## 🛠️ Troubleshooting

### MongoDB Connection Error

If you see `MongoServerError: Failed to connect`:
- Make sure MongoDB is running
- Check if port 27017 is available
- Verify `MONGO_URI` in `.env` file

### Port 3080 Already in Use

Change the port in `.env`:
```bash
PORT=3081
```
And update `DOMAIN_CLIENT` and `DOMAIN_SERVER` accordingly.

### Gemini API Errors

- Verify your API key is correct
- Check if your API key has the Gemini API enabled
- Ensure you have quota/credits available

### Build Errors

If you encounter build errors:
```bash
# Clean and reinstall
npm run reinstall
```

## 📦 Using Docker Compose (Alternative Full Setup)

If you prefer to run everything in Docker:

```bash
docker-compose up -d
```

This will start:
- LibreChat API
- MongoDB
- Meilisearch
- PostgreSQL (for vector database)
- RAG API

Access at: http://localhost:3080

## 🔧 Advanced Configuration

### Additional AI Models

To add more AI providers, edit the `librechat.yaml` file and add API keys to `.env`:

```yaml
# Example: Add OpenRouter
endpoints:
  custom:
    - name: 'OpenRouter'
      apiKey: '${OPENROUTER_KEY}'
      baseURL: 'https://openrouter.ai/api/v1'
      models:
        default: ['meta-llama/llama-3-70b-instruct']
```

### Enable Web Search

Add to `.env`:
```bash
TAVILY_API_KEY=your_tavily_key
```

### Enable File Uploads

File uploads are enabled by default. Supported files include:
- Images (JPG, PNG, GIF, WebP)
- Documents (PDF, TXT, DOC, DOCX)
- Code files

## 📚 Additional Resources

- Official Documentation: https://docs.librechat.ai
- Discord Community: https://discord.librechat.ai
- GitHub Issues: https://github.com/danny-avila/LibreChat/issues

## 🎉 You're All Set!

Enjoy using LibreChat with Gemini! 🚀

