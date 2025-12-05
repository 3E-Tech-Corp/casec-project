# Git Monorepo Setup Guide - CASEC Project

## Recommended Folder Structure

```
casec-project/
├── .git/
├── .gitignore (root)
├── README.md
├── docs/
│   ├── API.md
│   ├── SETUP.md
│   └── DEPLOYMENT.md
├── backend/              # .NET Core API
│   ├── CasecApi/
│   │   ├── Controllers/
│   │   ├── Models/
│   │   ├── Data/
│   │   ├── Program.cs
│   │   ├── CasecApi.csproj
│   │   └── appsettings.json
│   ├── CasecApi.sln
│   └── .gitignore
├── frontend/             # React App
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
├── database/
│   ├── migrations/
│   ├── CreateDatabase.sql
│   └── SeedData.sql
└── scripts/
    ├── setup.sh
    ├── deploy.sh
    └── dev-start.sh
```

---

## Step-by-Step Setup

### Step 1: Create Repository Structure

```bash
# Create main project folder
mkdir casec-project
cd casec-project

# Initialize Git
git init

# Create main folders
mkdir backend frontend database docs scripts
```

### Step 2: Move Existing Code

```bash
# Move .NET API
mv /path/to/CasecApi backend/
mv /path/to/CasecApi.sln backend/

# Move React Frontend
mv /path/to/casec-frontend frontend/
```

### Step 3: Create Root .gitignore

Create `/casec-project/.gitignore`:

```gitignore
# Operating System Files
.DS_Store
Thumbs.db
desktop.ini

# IDE Files
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
*.log
logs/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env.local
.env.*.local

# Temporary files
tmp/
temp/
*.tmp
```

### Step 4: Backend .gitignore

Create `/casec-project/backend/.gitignore`:

```gitignore
# .NET Core
bin/
obj/
*.user
*.suo
*.cache
*.dll
*.exe
*.pdb

# Visual Studio
.vs/
*.csproj.user
*.vbproj.user

# User-specific files
*.rsuser
*.suo
*.user
*.userosscache
*.sln.docstates

# Build results
[Dd]ebug/
[Rr]elease/
x64/
x86/
[Aa]ny[Cc]PU/
[Ww]in32/
[Aa]rm/
[Aa]rm64/
bld/
[Bb]in/
[Oo]bj/
[Ll]og/

# NuGet Packages
*.nupkg
*.snupkg
.nuget/
packages/

# Connection Strings (Security)
appsettings.Development.json
appsettings.Production.json
connectionstrings.json

# Database
*.mdf
*.ldf
*.ndf

# Rider
.idea/
*.sln.iml

# Publish
publish/
PublishProfiles/
```

### Step 5: Frontend .gitignore

Create `/casec-project/frontend/.gitignore`:

```gitignore
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
/coverage

# Production
/build
/dist
.cache/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories and files
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Vite
.vite/
dist-ssr/
*.local

# React
.eslintcache
```

### Step 6: Create Root README.md

Create `/casec-project/README.md`:

```markdown
# CASEC - Chinese American Social and Cultural Exchange

Full-stack membership management system for community organizations.

## 🏗️ Project Structure

- **backend/** - .NET Core 8 Web API
- **frontend/** - React 18 + Vite
- **database/** - SQL Server scripts
- **docs/** - Documentation
- **scripts/** - Automation scripts

## 🚀 Quick Start

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- SQL Server 2019+
- Git

### Backend Setup
```bash
cd backend
dotnet restore
dotnet run --project CasecApi
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
```bash
sqlcmd -S localhost -i database/CreateDatabase.sql
```

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Setup Guide](docs/SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🛠️ Technology Stack

**Backend:**
- .NET Core 8
- Entity Framework Core
- SQL Server
- JWT Authentication

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Zustand (State Management)

## 📄 License

MIT License
```

### Step 7: Create Development Script

Create `/casec-project/scripts/dev-start.sh`:

```bash
#!/bin/bash

# Start development servers for both backend and frontend

echo "🚀 Starting CASEC Development Environment"
echo "========================================"

# Start backend in background
echo "Starting .NET Backend..."
cd backend
dotnet run --project CasecApi &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend in background
echo "Starting React Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development servers started!"
echo "================================"
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
```

Make it executable:
```bash
chmod +x scripts/dev-start.sh
```

### Step 8: Initial Commit

```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: CASEC monorepo with .NET API and React frontend"

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/yourusername/casec-project.git

# Push to remote
git push -u origin main
```

---

## Working with ClaudeCode

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/casec-project.git
cd casec-project
```

### 2. Tell ClaudeCode About Structure

When starting a conversation with ClaudeCode:

```
I have a monorepo with:
- Backend: /backend/CasecApi (C# .NET Core 8 API)
- Frontend: /frontend (React 18 + Vite)
- Database: /database (SQL Server scripts)

Please help me work on [specific feature]
```

### 3. ClaudeCode Commands

**View backend file:**
```
Show me backend/CasecApi/Controllers/AuthController.cs
```

**View frontend file:**
```
Show me frontend/src/pages/Dashboard.jsx
```

**Update backend:**
```
Update the User entity in backend/CasecApi/Models/EnhancedEntities.cs to add a new field
```

**Update frontend:**
```
Update frontend/src/components/Layout.jsx to add a new menu item
```

### 4. Running the Project

**Development mode:**
```bash
./scripts/dev-start.sh
```

**Backend only:**
```bash
cd backend
dotnet run --project CasecApi
```

**Frontend only:**
```bash
cd frontend
npm run dev
```

---

## Branch Strategy

### Main Branches
- `main` - Production-ready code
- `develop` - Development branch

### Feature Branches
```bash
# Create feature branch
git checkout -b feature/user-authentication

# Work on feature...
git add .
git commit -m "Add user authentication"

# Push feature branch
git push origin feature/user-authentication

# Merge back to develop
git checkout develop
git merge feature/user-authentication
```

### Example Branch Names
- `feature/club-management`
- `feature/event-registration`
- `bugfix/login-error`
- `hotfix/security-patch`

---

## CI/CD Integration (Optional)

### GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: 8.0.x
      - name: Restore
        run: dotnet restore backend/CasecApi.sln
      - name: Build
        run: dotnet build backend/CasecApi.sln --no-restore
      - name: Test
        run: dotnet test backend/CasecApi.sln --no-build

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install
        run: cd frontend && npm ci
      - name: Build
        run: cd frontend && npm run build
```

---

## Environment Variables

### Backend (.env or appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=CasecDb;Trusted_Connection=True;"
  },
  "JwtSettings": {
    "Secret": "your-secret-key-here",
    "Issuer": "CasecAPI",
    "Audience": "CasecApp"
  }
}
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Deployment Structure

### Option 1: Separate Deployments
- Backend → Azure App Service / AWS Elastic Beanstalk
- Frontend → Vercel / Netlify / Azure Static Web Apps
- Database → Azure SQL / AWS RDS

### Option 2: Single Server
```
/var/www/casec/
├── api/          (Backend published files)
├── web/          (Frontend build files)
└── nginx.conf
```

---

## Git Tips for ClaudeCode

### 1. Keep Code Organized
```bash
# Backend changes
git add backend/
git commit -m "Backend: Add user authentication"

# Frontend changes
git add frontend/
git commit -m "Frontend: Add login page"

# Database changes
git add database/
git commit -m "Database: Add user roles migration"
```

### 2. Use Descriptive Commits
```bash
✅ Good: "Backend: Add JWT authentication to AuthController"
❌ Bad: "Update files"

✅ Good: "Frontend: Implement theme customization UI"
❌ Bad: "Fix bug"
```

### 3. Pull Before Push
```bash
git pull origin main
git push origin main
```

---

## Common Commands

```bash
# Clone repo
git clone <repo-url>

# Create new branch
git checkout -b feature/my-feature

# Stage changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push branch
git push origin feature/my-feature

# Switch branch
git checkout develop

# Update from remote
git pull origin main

# View status
git status

# View history
git log --oneline
```

---

## Status: ✅ Ready for Monorepo!

Your CASEC project is now organized as a single Git repository that:
- ✅ Contains both backend and frontend
- ✅ Has proper .gitignore for each part
- ✅ Includes documentation
- ✅ Has development scripts
- ✅ Works with ClaudeCode
- ✅ Supports CI/CD

**Next Steps:**
1. Create GitHub repository
2. Follow Step-by-Step Setup
3. Push code
4. Start developing with ClaudeCode!
