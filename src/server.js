"use strict";

const express = require('express');
const cors = require('cors');
const path = require('path');
const tasks = require('./tasks');
const mongo = require('../services/mongo');
const config = require('../config/db');

const app = express();
app.use(cors());
app.use(express.json());

// Servir frontend estático
app.use('/', express.static(path.join(__dirname, '..', 'public')));

// API básica
app.post('/api/tasks', async (req, res) => {
  try {
    const { description } = req.body;
    const t = tasks.addTask(description);
    // Intentar guardar en Mongo (si posible)
    try {
      await mongo.connect(config.uri, config.dbName);
      await mongo.saveTask(t);
    } catch (_) {
      // no crítico: sigue funcionando en memoria
    }
    res.status(201).json(t);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/tasks/pending', async (req, res) => {
  try {
    // Preferir Mongo si está conectado
    try {
      await mongo.connect(config.uri, config.dbName);
      const pending = await mongo.findPending();
      return res.json(pending);
    } catch (_) {
      return res.json(tasks.listPending());
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks/:id/complete', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = tasks.markCompleted(id);
    try {
      await mongo.connect(config.uri, config.dbName);
      await mongo.updateTask(id, { completed: true, completedAt: updated.completedAt });
    } catch (_) {}
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
