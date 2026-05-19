const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const certRoutes = require('./routes/certificates');
const courseRoutes = require('./routes/courses');
const branchRoutes = require('./routes/branches');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/certificates', certRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/branches', branchRoutes);

app.get('/', (req, res) => res.json({ success: true, message: 'Eunous IT Certificate Verification API' }));

module.exports = app;
