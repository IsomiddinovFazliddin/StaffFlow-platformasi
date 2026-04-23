const mongoose = require('mongoose');

const vacancySchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  description:  { type: String, default: '' },
  requirements: { type: String, default: '' },
  salary:       { type: String, default: '' },
  status:       { type: String, enum: ['Open', 'Closed', 'On Hold'], default: 'Open' },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Vacancy', vacancySchema);
