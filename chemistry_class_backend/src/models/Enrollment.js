const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
    required: true
  },
  payment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Payment',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// Prevent duplicate enrollments
enrollmentSchema.index({ user: 1, class: 1 }, { unique: true });

// Static method to get enrollment stats
enrollmentSchema.statics.getEnrollmentStats = async function(classId) {
  const stats = await this.aggregate([
    {
      $match: { class: classId }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  return stats;
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);
