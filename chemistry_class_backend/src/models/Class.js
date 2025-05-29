const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a class title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be a positive number']
  },
  duration: {
    type: String,
    required: [true, 'Please add class duration']
  },
  schedule: {
    day: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    }
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxStudents: {
    type: Number,
    default: 30
  },
  enrolledStudents: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate class titles
classSchema.index({ title: 1, teacher: 1 }, { unique: true });

// Static method to get total enrolled students
classSchema.statics.getEnrolledCount = async function(classId) {
  const obj = await this.aggregate([
    {
      $match: { _id: classId }
    },
    {
      $project: {
        count: { $size: "$enrolledStudents" }
      }
    }
  ]);

  return obj[0]?.count || 0;
};

module.exports = mongoose.model('Class', classSchema);
