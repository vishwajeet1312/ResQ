import mongoose from 'mongoose';

const triageSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Critical', 'Rescue', 'Power', 'Resource', 'Medical', 'Other']
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number],
    address: String,
    sector: String,
    distance: Number // distance from responder in km
  },
  need: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['CREATED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'CREATED'
  },
  priority: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  assignedTo: [{
    userId: String,
    userName: String,
    assignedAt: Date,
    role: String
  }],
  estimatedResponseTime: Number, // in minutes
  actualResponseTime: Number, // in minutes
  notes: String,
  updates: [{
    message: String,
    updatedBy: String,
    timestamp: Date
  }]
}, {
  timestamps: true
});

triageSchema.index({ score: -1, createdAt: -1 });
triageSchema.index({ status: 1, priority: -1 });
triageSchema.index({ 'location.coordinates': '2dsphere' });

const Triage = mongoose.model('Triage', triageSchema);

export default Triage;
