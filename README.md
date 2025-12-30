# ResQ-Link - Emergency Response Platform

A comprehensive real-time emergency response and disaster management platform built with Next.js (frontend) and Node.js/Express (backend), featuring Clerk authentication, MongoDB database, and Socket.IO for real-time updates.

## 🚀 Features

### Core Functionality
- 🚨 **Emergency SOS Broadcasting** - Real-time distress signal management with geolocation
- 📋 **Incident Reporting** - Submit and track disaster incidents
- 📦 **Resource Management** - Inventory tracking and resource allocation
- 🎯 **Triage System** - AI-powered priority-based emergency request handling
- 🎖️ **Mission Coordination** - Organize and track rescue operations
- 🔔 **Real-time Notifications** - Live updates via Socket.IO
- 📊 **Analytics Dashboard** - Comprehensive statistics and insights
- 🗺️ **Geospatial Mapping** - Interactive map with location-based features

### Technical Features
- 🔐 **Clerk Authentication** - Secure user authentication and management
- ⚡ **Real-time Updates** - Socket.IO powered live communication
- 🗄️ **MongoDB Database** - Scalable NoSQL database with geospatial indexing
- 🎨 **Modern UI** - Dark theme with Tailwind CSS and Radix UI
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher) - Can use MongoDB Atlas for cloud database
- **npm** or **pnpm** package manager
- **Clerk Account** - Sign up at [clerk.com](https://clerk.com)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
cd "c:\Users\LALA BANA\Downloads\ResQ"
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd server
npm install
```

#### Configure Environment Variables
Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration (choose one)
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/resq-db
# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resq-db

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

#### Seed Database (Optional)
```bash
npm run seed
```

#### Start Backend Server
```bash
# Development mode with auto-reload
npm run dev

# OR Production mode
npm start
```

Server will start on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../client
npm install
# OR
pnpm install
```

#### Configure Environment Variables
Create a `.env.local` file in the `client` directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

#### Start Frontend Development Server
```bash
npm run dev
# OR
pnpm dev
```

Frontend will start on `http://localhost:3000`

## 🔑 Getting Clerk API Keys

1. Go to [clerk.com](https://clerk.com) and sign up/login
2. Create a new application
3. Go to **API Keys** in the dashboard
4. Copy your **Publishable Key** and **Secret Key**
5. Paste them into both backend and frontend `.env` files

### Configure Clerk Settings
1. In Clerk Dashboard, go to **User & Authentication** → **Email, Phone, Username**
2. Enable Email authentication
3. (Optional) Enable social logins (Google, GitHub, etc.)
4. Save settings

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB
1. Install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl start mongod
   ```
3. Use connection string: `mongodb://localhost:27017/resq-db`

### Option 2: MongoDB Atlas (Cloud)
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string from "Connect" button
6. Update `MONGODB_URI` in backend `.env`

## 🚀 Running the Application

### Development Mode

1. **Start MongoDB** (if running locally)
2. **Start Backend Server:**
   ```bash
   cd server
   npm run dev
   ```
3. **Start Frontend (in new terminal):**
   ```bash
   cd client
   npm run dev
   ```
4. **Open Browser:** Navigate to `http://localhost:3000`
5. **Sign Up/Login** using Clerk authentication

### Production Mode

#### Backend
```bash
cd server
npm start
```

#### Frontend
```bash
cd client
npm run build
npm start
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All API requests (except `/health`) require Clerk authentication token in headers:
```
Authorization: Bearer <clerk_token>
```

### Main Endpoints

#### SOS Endpoints
- `POST /api/sos` - Broadcast emergency SOS
- `GET /api/sos` - Get all SOS signals
- `GET /api/sos/:id` - Get specific SOS
- `PATCH /api/sos/:id/acknowledge` - Acknowledge SOS
- `GET /api/sos/nearby/:lng/:lat` - Get nearby SOS

#### Incident Endpoints
- `POST /api/incidents` - Create incident report
- `GET /api/incidents` - Get all incidents
- `PATCH /api/incidents/:id` - Update incident
- `POST /api/incidents/:id/assign` - Assign responder

#### Resource Endpoints
- `POST /api/resources` - Add resource
- `GET /api/resources` - Get all resources
- `POST /api/resources/:id/request` - Request resource
- `POST /api/resources/:id/restock` - Restock resource

#### Triage Endpoints
- `POST /api/triage` - Create triage request
- `GET /api/triage` - Get all triage requests
- `PATCH /api/triage/:id/status` - Update status

#### Stats Endpoints
- `GET /api/stats/dashboard` - Get dashboard statistics

For complete API documentation, see [server/README.md](server/README.md)

## 🔌 Socket.IO Events

The application uses Socket.IO for real-time updates:

### Client Events
- `join-sector` - Join sector room for updates

### Server Events
- `sos-broadcast` - New SOS signal
- `new-incident` - New incident reported
- `resource-updated` - Resource updated
- `new-triage` - New triage request
- `new-notification` - New notification

## 🛡️ Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Clerk authentication with JWT tokens
- Environment variable protection
- Input validation

## 📁 Project Structure

```
ResQ/
├── client/                 # Next.js frontend
│   ├── app/               # Next.js app directory
│   │   ├── sign-in/      # Authentication pages
│   │   ├── sign-up/
│   │   ├── layout.jsx    # Root layout with Clerk
│   │   └── page.jsx      # Main application page
│   ├── components/        # React components
│   ├── contexts/          # React contexts (AppContext)
│   ├── lib/              # API client and Socket.IO setup
│   │   ├── api.js        # API client functions
│   │   └── socket.js     # Socket.IO client
│   ├── middleware.js     # Clerk middleware
│   └── package.json
│
└── server/                # Node.js/Express backend
    ├── config/           # Database configuration
    ├── models/           # MongoDB models
    ├── routes/           # API routes
    ├── middleware/       # Custom middleware
    ├── utils/            # Utility functions (seed script)
    ├── server.js         # Main server file
    └── package.json
```

## 🧪 Testing the Application

1. **Sign up** with a new account
2. **Create an SOS** signal from the Emergency SOS button
3. **Report an incident** from the Reports tab
4. **Add resources** from the Resources tab
5. **View dashboard stats** on the Map View
6. **Check real-time updates** - Open in multiple browser tabs

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access (for Atlas)

**Port Already in Use:**
```bash
# Change PORT in server/.env
PORT=5001
```

**Clerk Authentication Error:**
- Verify Clerk keys are correct
- Check Clerk dashboard settings

### Frontend Issues

**API Connection Error:**
- Ensure backend is running
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS settings in backend

**Clerk Error:**
- Clear browser cache
- Verify Clerk keys match frontend/backend
- Check Clerk dashboard status

## 📝 Environment Variables Summary

### Backend (`server/.env`)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `CLIENT_URL` - Frontend URL for CORS

### Frontend (`client/.env.local`)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Authentication by [Clerk](https://clerk.com)
- UI components from [Radix UI](https://radix-ui.com)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Database by [MongoDB](https://mongodb.com)

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review API documentation in `server/README.md`
- Open an issue on GitHub

---

**Made with ❤️ for Emergency Response Teams**
#   R e s Q  
 