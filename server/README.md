# ResQ Backend Server

Emergency response platform backend API with real-time capabilities, MongoDB database, and Clerk authentication.

## Features

- 🚨 **Emergency SOS Broadcasting** - Real-time emergency signal management
- 📋 **Incident Reporting** - Submit and track disaster incidents
- 📦 **Resource Management** - Inventory tracking and resource allocation
- 🎯 **Triage System** - Priority-based emergency request handling
- 🎖️ **Mission Management** - Coordinate rescue operations
- 🔔 **Real-time Notifications** - Socket.IO powered live updates
- 📊 **Analytics & Stats** - Dashboard statistics and insights
- 🔐 **Clerk Authentication** - Secure user authentication
- 🗺️ **Geospatial Queries** - Location-based resource and emergency tracking

## Tech Stack

- **Node.js** & **Express** - Server framework
- **MongoDB** & **Mongoose** - Database
- **Socket.IO** - Real-time communication
- **Clerk** - Authentication & user management
- **Helmet** - Security headers
- **Morgan** - HTTP request logging

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
   - Set MongoDB URI
   - Add Clerk API keys
   - Configure ports and URLs

4. Seed the database (optional):
```bash
npm run seed
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## API Endpoints

### Authentication
All routes except `/health` require Clerk authentication token in headers.

### SOS Endpoints
- `POST /api/sos` - Broadcast emergency SOS
- `GET /api/sos` - Get all SOS signals
- `GET /api/sos/:id` - Get specific SOS
- `PATCH /api/sos/:id/acknowledge` - Acknowledge SOS
- `PATCH /api/sos/:id/status` - Update SOS status
- `GET /api/sos/nearby/:lng/:lat` - Get nearby SOS

### Incident Endpoints
- `POST /api/incidents` - Create incident report
- `GET /api/incidents` - Get all incidents
- `GET /api/incidents/:id` - Get specific incident
- `PATCH /api/incidents/:id` - Update incident
- `POST /api/incidents/:id/assign` - Assign responder
- `GET /api/incidents/nearby/:lng/:lat` - Get nearby incidents

### Resource Endpoints
- `POST /api/resources` - Add resource
- `GET /api/resources` - Get all resources
- `GET /api/resources/:id` - Get specific resource
- `PATCH /api/resources/:id` - Update resource
- `POST /api/resources/:id/request` - Request resource
- `POST /api/resources/:id/restock` - Restock resource
- `GET /api/resources/nearby/:lng/:lat` - Get nearby resources
- `GET /api/resources/category/:category` - Get by category

### Triage Endpoints
- `POST /api/triage` - Create triage request
- `GET /api/triage` - Get all triage requests
- `GET /api/triage/:id` - Get specific triage
- `PATCH /api/triage/:id/status` - Update status
- `POST /api/triage/:id/assign` - Assign responder
- `GET /api/triage/priority/high` - Get high priority
- `GET /api/triage/user/:userId` - Get user's triage
- `GET /api/triage/assigned/:userId` - Get assigned triage

### Mission Endpoints
- `POST /api/missions` - Create mission
- `GET /api/missions` - Get all missions
- `GET /api/missions/:id` - Get specific mission
- `PATCH /api/missions/:id` - Update mission
- `POST /api/missions/:id/teams` - Assign team
- `GET /api/missions/active/all` - Get active missions
- `DELETE /api/missions/:id` - Cancel mission

### Notification Endpoints
- `POST /api/notifications` - Create notification
- `GET /api/notifications` - Get user's notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read/all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Stats Endpoints
- `GET /api/stats/dashboard` - Get dashboard statistics
- `GET /api/stats/sos` - Get SOS statistics
- `GET /api/stats/incidents` - Get incident statistics
- `GET /api/stats/resources` - Get resource statistics
- `GET /api/stats/triage` - Get triage statistics

## Socket.IO Events

### Client to Server
- `join-sector` - Join sector room for targeted updates
- `disconnect` - Handle client disconnection

### Server to Client
- `sos-broadcast` - New SOS signal
- `sos-acknowledged` - SOS acknowledged by responder
- `sos-status-updated` - SOS status changed
- `new-incident` - New incident reported
- `incident-updated` - Incident updated
- `incident-assigned` - Responder assigned to incident
- `resource-added` - New resource added
- `resource-updated` - Resource updated
- `resource-requested` - Resource requested
- `new-triage` - New triage request
- `triage-status-updated` - Triage status changed
- `new-mission` - New mission created
- `mission-updated` - Mission updated
- `new-notification` - New notification for user

## Database Models

- **SOS** - Emergency distress signals
- **Incident** - Disaster incident reports
- **Resource** - Emergency resources and inventory
- **Triage** - Priority-based emergency requests
- **Mission** - Coordinated rescue operations
- **Notification** - User notifications

All models support geospatial indexing for location-based queries.

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Clerk authentication
- Request validation

## Development

The API follows REST conventions and returns JSON responses with the following structure:

```json
{
  "success": true,
  "data": {},
  "count": 0,
  "total": 0
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## License

MIT
