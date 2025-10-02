const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const { PORT } = require('./config');
require('./db'); // initialize mongoose

const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');

const app = express();
app.use(cors());
app.use(express.json()); // replaces body-parser

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', quizRoutes);

// Serve frontend (production build)
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
