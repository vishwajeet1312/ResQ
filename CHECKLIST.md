# 🎯 ResQ Platform Setup Checklist

Use this checklist to ensure everything is configured correctly.

## ✅ Pre-Installation Checklist

- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm or pnpm installed (`npm --version`)
- [ ] MongoDB installed OR MongoDB Atlas account created
- [ ] Clerk account created (https://clerk.com)
- [ ] Git installed (optional, for version control)

## ✅ Installation Steps

### 1. Project Dependencies
- [ ] Opened PowerShell in ResQ folder
- [ ] Ran `npm install` (root)
- [ ] Ran `npm run install:all` (all projects)
- [ ] No error messages during installation

### 2. MongoDB Setup
**For Local MongoDB:**
- [ ] MongoDB Community Server downloaded
- [ ] MongoDB installed with default settings
- [ ] MongoDB service is running (check Windows Services)
- [ ] Can connect to `mongodb://localhost:27017`

**For MongoDB Atlas:**
- [ ] Created free M0 cluster
- [ ] Created database user with username/password
- [ ] Whitelisted IP address (0.0.0.0/0 for development)
- [ ] Copied connection string
- [ ] Replaced `<password>` in connection string

### 3. Clerk Configuration
- [ ] Created Clerk account
- [ ] Created new Clerk application
- [ ] Enabled Email authentication
- [ ] (Optional) Enabled social providers (Google, GitHub)
- [ ] Copied Publishable Key (starts with `pk_test_`)
- [ ] Copied Secret Key (starts with `sk_test_`)

### 4. Backend Configuration
- [ ] Navigated to `server` folder
- [ ] Copied `.env.example` to `.env`
- [ ] Updated `MONGODB_URI` with your connection string
- [ ] Pasted `CLERK_PUBLISHABLE_KEY`
- [ ] Pasted `CLERK_SECRET_KEY`
- [ ] Set `CLIENT_URL=http://localhost:3000`
- [ ] Saved `.env` file

### 5. Backend Validation
- [ ] Ran `npm run validate` in server folder
- [ ] All environment variables show ✅
- [ ] MongoDB connection test passed
- [ ] Clerk keys format validated
- [ ] No error messages

### 6. Frontend Configuration
- [ ] Navigated to `client` folder
- [ ] Copied `.env.local.example` to `.env.local`
- [ ] Set `NEXT_PUBLIC_API_URL=http://localhost:5000`
- [ ] Pasted SAME `CLERK_PUBLISHABLE_KEY`
- [ ] Pasted SAME `CLERK_SECRET_KEY`
- [ ] Set Clerk redirect URLs
- [ ] Saved `.env.local` file

### 7. Database Seeding (Optional)
- [ ] Ran `npm run seed` from server folder
- [ ] Sample data loaded successfully
- [ ] No error messages

## ✅ Running the Application

### Starting Servers
- [ ] Opened PowerShell in ResQ root folder
- [ ] Ran `npm run dev` (starts both servers)
- [ ] Backend started on http://localhost:5000
- [ ] Frontend started on http://localhost:3000
- [ ] No error messages in console

### Backend Health Check
- [ ] Opened http://localhost:5000/health
- [ ] Received JSON response with `"status": "OK"`
- [ ] MongoDB connection confirmed

### Frontend Access
- [ ] Opened http://localhost:3000
- [ ] Redirected to sign-in page
- [ ] Sign-in page loads correctly
- [ ] Clerk authentication UI displays

## ✅ First Use Testing

### Authentication
- [ ] Clicked "Sign up"
- [ ] Entered email and password
- [ ] (Optional) Verified email
- [ ] Successfully created account
- [ ] Redirected to main dashboard

### Dashboard Features
- [ ] Dashboard loads without errors
- [ ] Statistics cards display data
- [ ] Map view shows correctly
- [ ] Navigation tabs work (Map View, Resources, Reports, Settings)

### Core Features
- [ ] Can open Emergency SOS dialog
- [ ] Can create SOS signal (test)
- [ ] Can view notifications dropdown
- [ ] Can access user profile (top right)
- [ ] Can navigate between tabs
- [ ] Can open incident reporting
- [ ] Can view resource inventory
- [ ] Can see triage dashboard

### Real-time Features
- [ ] Opened application in two browser tabs
- [ ] Performed action in one tab (create SOS)
- [ ] Update appears in second tab (real-time)
- [ ] Socket.IO connection confirmed (check browser console)

## ✅ Troubleshooting Completed

If you encountered issues, check that:
- [ ] All ports are available (5000, 3000)
- [ ] MongoDB is running
- [ ] Clerk keys match in both .env files
- [ ] No typos in environment variables
- [ ] Network firewall not blocking connections
- [ ] Node modules properly installed

## 🎉 Success Criteria

Mark complete when ALL of the following work:
- [ ] Backend API responds at http://localhost:5000/health
- [ ] Frontend loads at http://localhost:3000
- [ ] Can sign up/sign in with Clerk
- [ ] Dashboard displays after sign-in
- [ ] Can create and view SOS signals
- [ ] Real-time updates work between tabs
- [ ] No console errors in browser
- [ ] No errors in backend terminal

## 📝 Configuration Summary

**Backend Port:** 5000
**Frontend Port:** 3000
**MongoDB:** `[Local/Atlas]`
**Clerk Environment:** `[Test/Production]`

**Last Verified:** _______________
**Verified By:** _______________

## 🚀 Ready for Development!

Once all items are checked:
- ✅ Your ResQ platform is fully operational
- ✅ All features are working correctly
- ✅ Ready for customization and development
- ✅ Real-time communication established

## 📚 Next Steps

1. **Explore Features:**
   - Try all emergency response features
   - Test resource management
   - Create and manage incidents

2. **Read Documentation:**
   - README.md - Full documentation
   - SETUP.md - Detailed setup guide
   - server/README.md - API documentation

3. **Customize:**
   - Update organization details
   - Customize UI theme
   - Add additional features

4. **Deploy:**
   - Prepare for production deployment
   - Configure production environment
   - Set up monitoring

---

**Congratulations! Your ResQ Emergency Response Platform is ready! 🎊**
