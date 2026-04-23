const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  candidate:    { type: String, required: true },
  vacancyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy' },
  interviewerId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date:         { type: String, required: true }, // 'YYYY-MM-DD'
  time:         { type: String, required: true }, // 'HH:MM'
  status:       { type: String, enum: ['Kutilmoqda', 'O\'tkazildi', 'Bekor qilindi'], default: 'Kutilmoqda' },
  result:       { type: String, enum: ['Qabul qilindi', 'Rad etildi', null], default: null },
  feedback:     { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
