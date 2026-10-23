const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDatabase } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const miscRoutes = require('./routes/miscRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const port = Number(process.env.PORT) || 5001;
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '3mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api', miscRoutes);
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  const { client } = await connectDatabase();
  const server = app.listen(port, () => console.log(`PlateShare API listening on port ${port}`));

  const closeServer = async () => {
    server.close();
    await client.close();
    process.exit(0);
  };
  process.on('SIGINT', closeServer);
  process.on('SIGTERM', closeServer);
}

startServer().catch((error) => {
  console.error(`Could not start PlateShare API: ${error.message}`);
  process.exit(1);
});
