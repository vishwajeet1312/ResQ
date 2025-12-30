# 🚀 ResQ Platform - Quick Reference

## 📂 Project Structure
```
ResQ/
├── server/          → Backend API (Node.js/Express)
├── client/          → Frontend (Next.js/React)
├── README.md        → Full documentation
├── SETUP.md         → Detailed setup guide
└── CHECKLIST.md     → Setup verification checklist
```

## ⚡ Quick Commands

### From Root Directory
```bash
npm install              # Install root dependencies
npm run install:all      # Install all (server + client)
npm run dev             # Run both servers
npm run seed            # Seed database with sample data
```

### Backend Only (from /server)
```bash
npm install             # Install backend dependencies
npm run dev            # Start backend (auto-reload)
npm start              # Start backend (production)
npm run seed           # Seed database
npm run validate       # Validate configuration
```

### Frontend Only (from /client)
```bash
npm install             # Install frontend dependencies
npm run dev            # Start frontend dev server
npm run build          # Build for production
npm start              # Start production server
```

## 🌐 Default URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health
- **Sign In:** http://localhost:3000/sign-in
- **Sign Up:** http://localhost:3000/sign-up

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resq-db
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLIENT_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## 📡 Main API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| POST | /api/sos | Broadcast SOS |
| GET | /api/sos | Get all SOS |
| POST | /api/incidents | Create incident |
| GET | /api/incidents | Get all incidents |
| POST | /api/resources | Add resource |
| GET | /api/resources | Get all resources |
| POST | /api/triage | Create triage |
| GET | /api/triage | Get all triage |
| POST | /api/missions | Create mission |
| GET | /api/missions | Get all missions |
| GET | /api/stats/dashboard | Get statistics |

## 🔌 Socket.IO Events

### Server → Client
- `sos-broadcast` - New SOS signal
- `sos-acknowledged` - SOS acknowledged
- `new-incident` - New incident
- `resource-updated` - Resource updated
- `new-triage` - New triage request
- `new-notification` - New notification

### Client → Server
- `join-sector` - Join sector room

## 🛠️ Common Issues & Quick Fixes

### ❌ Port Already in Use
```bash
# Change ports in .env files
# Backend: PORT=5001
# Frontend: NEXT_PUBLIC_API_URL=http://localhost:5001
```

### ❌ MongoDB Connection Failed
```bash
# Check MongoDB is running
# Windows: services.msc → MongoDB Server
# Or restart: net stop MongoDB && net start MongoDB
```

### ❌ Clerk Authentication Error
```bash
# Verify keys in BOTH .env files match
# Clear browser cache and cookies
# Restart both servers
```

### ❌ CORS Error
```bash
# Verify CLIENT_URL in server/.env
# Should be: http://localhost:3000
# Restart backend server
```

## 🎯 Testing Quick Start

1. **Start Application:** `npm run dev`
2. **Open Browser:** http://localhost:3000
3. **Sign Up:** Create test account
4. **Test SOS:** Click "Emergency SOS" button
5. **Check Real-time:** Open second tab, see updates

## 📊 Default Test Data (after seeding)

- **SOS Signals:** 2 sample signals
- **Incidents:** 2 sample incidents  
- **Resources:** 4 sample resources
- **Triage Requests:** 3 sample requests
- **Missions:** 2 sample missions

## 🔐 Authentication Flow

1. User visits http://localhost:3000
2. Redirected to /sign-in (Clerk)
3. Sign up or sign in
4. Clerk generates JWT token
5. Token sent with all API requests
6. Backend validates with Clerk
7. User accesses protected features

## 📱 Main Features

- ✅ Emergency SOS Broadcasting
- ✅ Incident Reporting & Tracking
- ✅ Resource Inventory Management
- ✅ Priority-based Triage System
- ✅ Mission Coordination
- ✅ Real-time Notifications
- ✅ Geospatial Mapping
- ✅ Analytics Dashboard

## 🎨 Tech Stack

**Frontend:**
- Next.js 16 (React 19)
- Tailwind CSS
- Radix UI Components
- Socket.IO Client
- Clerk Authentication

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO Server
- Clerk SDK
- Helmet (Security)

## 📞 Support Resources

- **Main Docs:** README.md
- **Setup Guide:** SETUP.md
- **Checklist:** CHECKLIST.md
- **API Docs:** server/README.md
- **Clerk Docs:** https://clerk.com/docs
- **MongoDB Docs:** https://www.mongodb.com/docs

## 💡 Pro Tips

1. **Use `npm run validate`** before starting backend
2. **Keep MongoDB running** in background
3. **Use separate terminals** for frontend/backend logs
4. **Check browser console** for real-time event logs
5. **Seed database** for testing with sample data
6. **Clear browser cache** if auth issues occur

---

**Need help? Check SETUP.md for detailed instructions!**
