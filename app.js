const express = require('express');
const cors = require('cors');
const config = require('./config/index');
const { initDatabase } = require('./utils/initDb');

const authRoutes = require('./routes/auth');
const matchRoutes = require('./routes/match');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const configRoutes = require('./routes/config');
const publicRoutes = require('./routes/public');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/config', configRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

initDatabase();

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

module.exports = app;
