# CASEC - Chinese American Social and Cultural Exchange

Full-stack membership management system for community organizations.

## 🏗️ Project Structure

```
casec-monorepo/
├── backend/          # .NET Core 8 Web API
├── frontend/         # React 18 + Vite
├── database/         # SQL Server scripts
├── docs/             # Documentation
└── scripts/          # Automation scripts
```

## 🚀 Quick Start

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- SQL Server 2019+
- Git

### Backend Setup
```bash
cd backend/CasecApi
dotnet restore
dotnet run
# API runs on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend/casec-frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### Database Setup
```bash
sqlcmd -S localhost -i database/CreateDatabase.sql
sqlcmd -S localhost -i database/Migration_AddMissingColumns.sql
```

## 📚 Documentation

See `/docs` folder for detailed documentation:
- API Documentation
- Setup Guides
- Database Schema
- Deployment Guides

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
- React Router

## 📋 Features

- ✅ User Registration & Authentication
- ✅ Membership Management
- ✅ Club Management with Sub-Admins
- ✅ Event Management & Registration
- ✅ Family Membership Groups
- ✅ Payment Processing (Zelle)
- ✅ Board of Directors Showcase
- ✅ Theme Customization
- ✅ Admin Dashboard

## 🔧 Development

### Run Both Services
```bash
# Terminal 1 - Backend
cd backend/CasecApi
dotnet watch run

# Terminal 2 - Frontend
cd frontend/casec-frontend
npm run dev
```

### Database Migrations
```bash
cd backend/CasecApi
dotnet ef migrations add MigrationName
dotnet ef database update
```

## 📦 Build for Production

### Backend
```bash
cd backend/CasecApi
dotnet publish -c Release -o ./publish
```

### Frontend
```bash
cd frontend/casec-frontend
npm run build
# Output in /dist folder
```

## 🌐 Environment Variables

### Backend (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=CasecDb;..."
  },
  "JwtSettings": {
    "Secret": "your-secret-key"
  }
}
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📄 License

MIT License

## 👥 Contributors

Developed with ❤️ for the Chinese American community
