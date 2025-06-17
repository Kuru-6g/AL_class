const mongoose = require('mongoose');

const chemistryClassSchema = new mongoose.Schema({
  className: {
    type: String,
    required: [true, 'Class name is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  subject: {
    type: String,
    default: 'Chemistry'
  },
  schedule: {
    type: Object
  },
  maxStudents: {
    type: Number,
    default: 30
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChemistryClass', chemistryClassSchema, 'classes');