import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Health', 'Sanitation', 'Food', 'Energy', 'Transport', 'Communication', 'Shelter', 'Other']
  },
  status: {
    type: String,
    enum: ['Critical', 'Low', 'Stable', 'Active', 'Offline'],
    default: 'Stable'
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  total: {
    type: Number,
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
    sector: String
  },
  owner: {
    userId: String,
    userName: String,
    organization: String
  },
  availability: {
    type: String,
    enum: ['Available', 'Reserved', 'Deployed', 'Unavailable'],
    default: 'Available'
  },
  requestedBy: [{
    userId: String,
    userName: String,
    quantity: Number,
    requestedAt: Date,
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Fulfilled']
    }
  }],
  specifications: {
    type: Map,
    of: String
  },
  lastRestockedAt: Date
}, {
  timestamps: true
});

resourceSchema.index({ category: 1, status: 1 });
resourceSchema.index({ 'location.coordinates': '2dsphere' });

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
