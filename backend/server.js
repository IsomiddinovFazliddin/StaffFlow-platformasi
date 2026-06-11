require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

// CORS — barcha originlardan ruxsat berish (dev rejim)
const corsOptions = {
  origin: function(origin, callback) {
    // origin yo'q bo'lganda (curl, Postman) ham ruxsat berish
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      process.env.CLIENT_URL,
    ].filter(Boolean);
    if (allowed.includes(origin)) return callback(null, true);
    return callback(null, true); // dev rejimda barcha origin ruxsat
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight uchun
app.use(express.json({ limit: '10mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/employees',     require('./routes/employees'));
app.use('/api/departments',   require('./routes/departments'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/attendance',    require('./routes/attendance'));
app.use('/api/salary',        require('./routes/salary'));
app.use('/api/penalties',     require('./routes/penalties'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics',     require('./routes/analytics'));
app.use('/api/approvals',     require('./routes/approvals'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));
app.use((_, res) => res.status(404).json({ message: 'Route topilmadi' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ StaffFlow API running on port ${PORT}`));
