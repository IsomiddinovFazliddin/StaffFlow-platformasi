const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const ROLES = ['admin', 'hr_manager', 'team_lead', 'employee'];

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, required: true, minlength: 6, select: false },
  role:         { type: String, enum: ROLES, default: 'employee' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  position:     { type: String, default: '' },
  salary:       { type: Number, default: 0 },
  phone:        { type: String, default: '' },
  avatar:       { type: String, default: null }, // URL or base64
  status:       { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' },
  joinDate:     { type: Date, default: Date.now },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
