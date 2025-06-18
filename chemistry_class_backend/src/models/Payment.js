const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChemistryClass',
    required: true
  }],
  zoomGmail: {
    type: String,
    required: false
  },
  paymentSlipUrl: {
    type: String,
    required: true
  },
  receiptType: {
    type: String,
    required: false
  },
  userDetails: {
    fullName: String,
    phoneNumber: String,
    nic: String,
    district: String,
    nicFrontUrl: String,
    nicBackUrl: String
  },
  status: {
    type: String,
    enum: ['submitted', 'approved', 'rejected'],
    default: 'submitted'
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

module.exports = mongoose.model('Payment', paymentSchema);