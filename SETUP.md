# ResQ Platform - Quick Setup Guide

This guide will help you get ResQ up and running in 10 minutes!

## ✅ Step-by-Step Setup

### 1️⃣ Install Dependencies (5 minutes)

Open PowerShell in the ResQ folder and run:

```powershell
# Install root dependencies
npm install

# Install all project dependencies (server + client)
npm run install:all
```

### 2️⃣ Setup MongoDB (2 minutes)

**Option A: Local MongoDB (Recommended for Development)**
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will auto-start as a Windows service
4. Use connection string: `mongodb://localhost:27017/resq-db`

**Option B: MongoDB Atlas (Cloud - Free Tier)**
1. Sign up at: https://www.mongodb.com/cloud/atlas
2. Create a free cluster (M0)
3. Create database user (username/password)
4. Allow access from anywhere: IP `0.0.0.0/0`
5. Get connection string from "Connect" button
6. Replace `<password>` in connection string

### 3️⃣ Get Clerk API Keys (2 minutes)

1. Go to https://clerk.com and sign up
2. Create a new application
3. Choose authentication methods (Email recommended)
4. Go to **API Keys** section
5. Copy:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

### 4️⃣ Configure Backend (1 minute)

1. Go to `server` folder
2. Copy `.env.example` to `.env`:
   ```powershell
   cd server
   copy .env.example .env
   ```
3. Edit `.env` file with your text editor:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Use your MongoDB connection string
   MONGODB_URI=mongodb://localhost:27017/resq-db
   
   # Paste your Clerk keys here
   CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_key_here
   
   CLIENT_URL=http://localhost:3000
   ```

4. (Optional) Seed database with sample data:
   ```powershell
   npm run seed
   ```

### 5️⃣ Configure Frontend (1 minute)

1. Go to `client` folder
2. Copy `.env.local.example` to `.env.local`:
   ```powershell
   cd ..\client
   copy .env.local.example .env.local
   ```
3. Edit `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   
   # Paste the SAME Clerk keys here
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_key_here
   
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   ```

### 6️⃣ Run the Application

From the root `ResQ` folder:

```powershell
# Run both frontend and backend together
npm run dev
```

This will start:
- Backend API on http://localhost:5000
- Frontend app on http://localhost:3000

**Or run them separately in different terminals:**

```powershell
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend  
npm run dev:client
```

### 7️⃣ Access the Application

1. Open browser to: http://localhost:3000
2. You'll be redirected to sign-in page
3. Click "Sign up" to create an account
4. Use email/password or social login
5. After sign up, you'll be redirected to the dashboard

## 🎉 You're Done!

The application is now running with:
- ✅ Backend API with MongoDB
- ✅ Real-time Socket.IO connections
- ✅ Clerk authentication
- ✅ Full emergency response features

## 🔍 Verify Everything Works

### Test Backend API
Open http://localhost:5000/health in browser
You should see:
```json
{
  "status": "OK",
  "timestamp": "2024-12-30T...",
  "service": "ResQ Emergency Response API"
}
```

### Test Frontend
1. Sign in to the application
2. Click "Emergency SOS" button
3. Try broadcasting an SOS signal
4. Navigate through different tabs (Map View, Resources, Reports, Settings)

## 🚨 Common Issues & Solutions

### ❌ "Cannot connect to MongoDB"
**Solution:**
- Check MongoDB is running: Open Services (Win+R → services.msc), find "MongoDB"
- Verify connection string in `server/.env`
- For Atlas: Check IP whitelist includes your IP

### ❌ "Clerk authentication failed"
**Solution:**
- Verify keys are exactly the same in both `.env` files
- No extra spaces or quotes around keys
- Keys must start with `pk_test_` and `sk_test_`
- Check Clerk dashboard is not showing errors

### ❌ "Port 5000 already in use"
**Solution:**
- Change port in `server/.env`: `PORT=5001`
- Update frontend: `client/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5001`

### ❌ "CORS error"
**Solution:**
- Verify `CLIENT_URL` in `server/.env` is `http://localhost:3000`
- Restart backend server after changing `.env`

### ❌ "Module not found"
**Solution:**
```powershell
# Reinstall dependencies
cd server
Remove-Item -Recurse -Force node_modules
npm install

cd ..\client
Remove-Item -Recurse -Force node_modules
npm install
```

## 📚 Next Steps

Once everything is running:

1. **Explore Features:**
   - Create SOS signals
   - Report incidents
   - Add resources
   - View statistics

2. **Check Documentation:**
   - Main README.md for full documentation
   - server/README.md for API documentation

3. **Customize:**
   - Add your organization details
   - Configure map settings
   - Adjust notification preferences

## 💡 Development Tips

### Useful Commands

```powershell
# Install all dependencies
npm run install:all

# Run both servers (recommended)
npm run dev

# Run only backend
npm run dev:server

# Run only frontend
npm run dev:client

# Seed database with sample data
npm run seed

# Build for production
npm run build

# Start production servers
npm start
```

### Hot Reload
- Backend: Automatically reloads on file changes (nodemon)
- Frontend: Automatically reloads on file changes (Next.js)

### View Logs
- Backend: Check terminal running `dev:server`
- Frontend: Check terminal running `dev:client`
- Browser: Press F12 for developer console

## 🎯 Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in backend
2. Use production MongoDB (Atlas recommended)
3. Update Clerk keys to production keys
4. Build frontend: `npm run build`
5. Deploy to your hosting provider

## 📞 Need Help?

- Check the main README.md
- Review API documentation in server/README.md
- Check Clerk documentation: https://clerk.com/docs
- MongoDB documentation: https://www.mongodb.com/docs

---

**Happy Emergency Response Coordinating! 🚑🚒🚓**
