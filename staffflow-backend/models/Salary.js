const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month:      { type: String, required: true }, // 'YYYY-MM'
  base:       { type: Number, required: true },
  bonus:      { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  net:        { type: Number },
  status:     { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  paidAt:     { type: Date, default: null },
}, { timestamps: true });

// Auto-calculate net before save
salarySchema.pre('save', function (next) {
  this.net = this.base + this.bonus - this.deductions;
  next();
});

salarySchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Salary', salarySchema);
