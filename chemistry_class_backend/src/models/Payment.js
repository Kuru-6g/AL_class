const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  referenceNumber: {
    type: String,
    required: [true, 'Please add a reference number']
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'credit_card', 'other'],
    default: 'bank_transfer'
  },
  slipImage: {
    type: String,
    required: [true, 'Please upload a payment slip']
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  remarks: {
    type: String
  },
  paidAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate reference numbers
paymentSchema.index({ referenceNumber: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
