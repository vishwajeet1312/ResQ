import mongoose from 'mongoose';

const sosSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
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
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String,
    sector: String
  },
  status: {
    type: String,
    enum: ['CREATED', 'BROADCASTING', 'ACKNOWLEDGED', 'RESPONDED', 'RESOLVED', 'CANCELLED'],
    default: 'CREATED'
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'High'
  },
  description: String,
  respondersNearby: {
    type: Number,
    default: 0
  },
  acknowledgedBy: [{
    userId: String,
    userName: String,
    timestamp: Date
  }],
  resolvedBy: {
    userId: String,
    userName: String,
    timestamp: Date
  },
  broadcastRadius: {
    type: Number,
    default: 5 // kilometers
  }
}, {
  timestamps: true
});

// Index for geospatial queries
sosSchema.index({ 'location.coordinates': '2dsphere' });
sosSchema.index({ status: 1, createdAt: -1 });

const SOS = mongoose.model('SOS', sosSchema);

export default SOS;
