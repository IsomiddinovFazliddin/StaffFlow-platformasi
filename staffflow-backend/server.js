require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const connectDB  = require('./config/db');

const app    = express();
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true },
});

// Store userId → socketId mapping for targeted notifications
const onlineUsers = new Map();

io.on('connection', (socket) => {
  // Client sends { userId } after connecting
  socket.on('join', (userId) => {
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
  });

  socket.on('disconnect', () => {
    onlineUsers.forEach((sid, uid) => { if (sid === socket.id) onlineUsers.delete(uid); });
  });
});

app.set('io', io); // make io accessible in routes

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' })); // allow base64 avatars

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/departments',   require('./routes/departments'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/attendance',    require('./routes/attendance'));
app.use('/api/salary',        require('./routes/salary'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/vacancies',     require('./routes/vacancies'));
app.use('/api/interviews',    require('./routes/interviews'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

// 404
app.use((_, res) => res.status(404).json({ message: 'Route topilmadi' }));

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
