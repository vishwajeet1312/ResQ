import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SOS from '../models/SOS.model.js';
import Incident from '../models/Incident.model.js';
import Resource from '../models/Resource.model.js';
import Triage from '../models/Triage.model.js';
import Mission from '../models/Mission.model.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Sample data
const sampleSOS = [
  {
    userId: 'user_1',
    userName: 'John Doe',
    location: {
      type: 'Point',
      coordinates: [-71.0589, 42.3601],
      address: '123 Main St, Boston, MA',
      sector: 'North-West Metro'
    },
    status: 'BROADCASTING',
    severity: 'Critical',
    description: 'Trapped in flooded basement, water rising',
    respondersNearby: 3
  },
  {
    userId: 'user_2',
    userName: 'Jane Smith',
    location: {
      type: 'Point',
      coordinates: [-71.0567, 42.3584],
      address: '456 Oak Ave, Boston, MA',
      sector: 'North-West Metro'
    },
    status: 'ACKNOWLEDGED',
    severity: 'High',
    description: 'Medical emergency - elderly person needs assistance',
    respondersNearby: 5
  }
];

const sampleIncidents = [
  {
    reportId: 'REP-902',
    userId: 'user_1',
    userName: 'John Doe',
    type: 'Flash Flood',
    location: {
      type: 'Point',
      coordinates: [-71.0589, 42.3601],
      address: 'River Basin, Sector 4',
      sector: 'Sector 4'
    },
    description: 'Flash flooding in low-lying areas, several homes affected',
    severity: 'High',
    status: 'In Progress',
    affectedCount: 15
  },
  {
    reportId: 'REP-899',
    userId: 'user_3',
    userName: 'Mike Johnson',
    type: 'Structural Collapse',
    location: {
      type: 'Point',
      coordinates: [-71.0612, 42.3625],
      address: 'Old Town Square',
      sector: 'Old Town'
    },
    description: 'Partial building collapse, rescue operations in progress',
    severity: 'Critical',
    status: 'In Progress',
    affectedCount: 8
  }
];

const sampleResources = [
  {
    name: 'Medical Supplies',
    category: 'Health',
    status: 'Critical',
    stock: 24,
    total: 100,
    location: {
      type: 'Point',
      coordinates: [-71.0589, 42.3601],
      address: 'Community Center, Main St',
      sector: 'North-West Metro'
    },
    availability: 'Available',
    owner: {
      userId: 'org_1',
      userName: 'Red Cross Boston',
      organization: 'Red Cross'
    }
  },
  {
    name: 'Water Purifiers',
    category: 'Sanitation',
    status: 'Stable',
    stock: 85,
    total: 100,
    location: {
      type: 'Point',
      coordinates: [-71.0567, 42.3584],
      address: 'Warehouse District',
      sector: 'Warehouse District'
    },
    availability: 'Available',
    owner: {
      userId: 'org_2',
      userName: 'FEMA Boston',
      organization: 'FEMA'
    }
  },
  {
    name: 'Emergency Rations',
    category: 'Food',
    status: 'Low',
    stock: 42,
    total: 100,
    location: {
      type: 'Point',
      coordinates: [-71.0545, 42.3598],
      address: 'Food Bank Center',
      sector: 'Central'
    },
    availability: 'Available',
    owner: {
      userId: 'org_3',
      userName: 'Local Food Bank',
      organization: 'Food Bank'
    }
  },
  {
    name: 'Power Generators',
    category: 'Energy',
    status: 'Active',
    stock: 12,
    total: 15,
    location: {
      type: 'Point',
      coordinates: [-71.0623, 42.3612],
      address: 'Emergency Services HQ',
      sector: 'Downtown'
    },
    availability: 'Deployed',
    owner: {
      userId: 'org_4',
      userName: 'Emergency Services',
      organization: 'City Services'
    }
  }
];

const sampleTriage = [
  {
    requestId: 'REQ-001',
    type: 'Critical',
    userId: 'user_4',
    userName: 'Maria S.',
    location: {
      type: 'Point',
      coordinates: [-71.0534, 42.3623],
      address: 'Sector 7 Residential',
      sector: 'Sector 7',
      distance: 4.2
    },
    need: 'Insulin & Water',
    status: 'CREATED',
    priority: 4,
    score: 92
  },
  {
    requestId: 'REQ-002',
    type: 'Rescue',
    userId: 'user_5',
    userName: 'John D.',
    location: {
      type: 'Point',
      coordinates: [-71.0589, 42.3645],
      address: 'North Bridge',
      sector: 'North Bridge',
      distance: 1.8
    },
    need: 'Boat required (2 people)',
    status: 'CREATED',
    priority: 4,
    score: 88
  },
  {
    requestId: 'REQ-003',
    type: 'Power',
    userId: 'org_5',
    userName: 'Clinic 42',
    location: {
      type: 'Point',
      coordinates: [-71.0512, 42.3578],
      address: 'East Side Medical',
      sector: 'East Side',
      distance: 2.5
    },
    need: 'Generator for ventilators',
    status: 'CREATED',
    priority: 3,
    score: 80
  }
];

const sampleMissions = [
  {
    missionId: 'M-42',
    target: 'Sector 7 Extraction',
    description: 'Extract trapped residents from flooded area',
    status: 'In Progress',
    priority: 'Critical',
    location: {
      type: 'Point',
      coordinates: [-71.0534, 42.3623],
      address: 'Sector 7',
      sector: 'Sector 7'
    },
    objectives: [
      'Locate trapped individuals',
      'Secure evacuation route',
      'Transport to safety'
    ],
    createdBy: {
      userId: 'coordinator_1',
      userName: 'Command Center'
    }
  },
  {
    missionId: 'M-39',
    target: 'North Bridge Resource Drop',
    description: 'Deliver emergency supplies to isolated area',
    status: 'En Route',
    priority: 'High',
    location: {
      type: 'Point',
      coordinates: [-71.0589, 42.3645],
      address: 'North Bridge',
      sector: 'North Bridge'
    },
    objectives: [
      'Deliver food and water',
      'Medical supplies distribution',
      'Assess additional needs'
    ],
    createdBy: {
      userId: 'coordinator_1',
      userName: 'Command Center'
    }
  }
];

// Seed function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Promise.all([
      SOS.deleteMany({}),
      Incident.deleteMany({}),
      Resource.deleteMany({}),
      Triage.deleteMany({}),
      Mission.deleteMany({})
    ]);
    console.log('✅ Cleared existing data');

    // Insert sample data
    await SOS.insertMany(sampleSOS);
    console.log('✅ Seeded SOS data');

    await Incident.insertMany(sampleIncidents);
    console.log('✅ Seeded Incident data');

    await Resource.insertMany(sampleResources);
    console.log('✅ Seeded Resource data');

    await Triage.insertMany(sampleTriage);
    console.log('✅ Seeded Triage data');

    await Mission.insertMany(sampleMissions);
    console.log('✅ Seeded Mission data');

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
