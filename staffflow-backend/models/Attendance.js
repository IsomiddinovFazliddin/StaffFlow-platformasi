const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:       { type: String, required: true }, // 'YYYY-MM-DD'
  checkIn:    { type: String, default: null },  // 'HH:MM'
  checkOut:   { type: String, default: null },
  totalHours: { type: Number, default: 0 },
  // 'On Time' if checkIn <= 09:00, else 'Late', 'Absent' if no checkIn
  status:     { type: String, enum: ['On Time', 'Late', 'Absent'], default: 'Absent' },
}, { timestamps: true });

// Compound unique: one record per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
