import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userName: String,
  type: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number], // [longitude, latitude]
    address: String,
    sector: String
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  affectedCount: {
    type: Number,
    default: 0
  },
  responders: [{
    userId: String,
    userName: String,
    assignedAt: Date
  }],
  attachments: [{
    type: String,
    url: String
  }],
  updates: [{
    message: String,
    updatedBy: String,
    timestamp: Date
  }]
}, {
  timestamps: true
});

incidentSchema.index({ 'location.coordinates': '2dsphere' });
incidentSchema.index({ status: 1, severity: -1, createdAt: -1 });

const Incident = mongoose.model('Incident', incidentSchema);

export default Incident;
