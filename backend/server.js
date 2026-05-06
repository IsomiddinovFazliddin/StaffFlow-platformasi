require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',             require('./routes/auth'));
app.use('/api/employees',        require('./routes/employees'));
app.use('/api/attendance',       require('./routes/attendance'));
app.use('/api/tasks',            require('./routes/tasks'));
app.use('/api/departments',      require('./routes/departments'));
app.use('/api/salary',           require('./routes/salary'));
app.use('/api/analytics',        require('./routes/analytics'));
app.use('/api/admin/approvals',  require('./routes/approvals'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));
app.use((_, res) => res.status(404).json({ message: 'Route topilmadi' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
