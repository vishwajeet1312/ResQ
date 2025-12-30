import mongoose from 'mongoose';

const missionSchema = new mongoose.Schema({
  missionId: {
    type: String,
    unique: true,
    required: true
  },
  target: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['Planned', 'In Progress', 'En Route', 'Resolved', 'Cancelled'],
    default: 'Planned'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
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
  teams: [{
    teamId: String,
    teamName: String,
    members: [{
      userId: String,
      userName: String,
      role: String
    }],
    status: String,
    assignedAt: Date
  }],
  objectives: [String],
  resources: [{
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    },
    quantity: Number
  }],
  startTime: Date,
  endTime: Date,
  createdBy: {
    userId: String,
    userName: String
  },
  updates: [{
    message: String,
    updatedBy: String,
    timestamp: Date
  }]
}, {
  timestamps: true
});

missionSchema.index({ status: 1, priority: -1, createdAt: -1 });

const Mission = mongoose.model('Mission', missionSchema);

export default Mission;
