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
    // validar
    tasks.validateDescription(description);

    // Crear objeto de tarea con id generado (timestamp) para persistencia
    const id = Date.now();
    const createdAt = new Date().toISOString();
    const taskObj = { id, description: description.trim(), completed: false, createdAt };

    // Intentar guardar en Mongo primero
    let saved = null;
    try {
      await mongo.connect(config.uri, config.dbName);
      saved = await mongo.saveTask(taskObj);
    } catch (err) {
      // si falla, saved queda null y usaremos fallback en memoria
      saved = null;
    }

    // Guardar en memoria con el mismo id/createdAt para consistencia
    const t = tasks.addTask(description, { id, createdAt });
    res.status(201).json(saved || t);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/tasks/pending', async (req, res) => {
  try {
    
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

const DEFAULT_PORT = 3000;

function _listen(app, port) {
  return new Promise((resolve, reject) => {
    const srv = app.listen(port, () => resolve(srv));
    srv.on('error', (err) => reject(err));
  });
}

async function start() {
  try {
    // Intentar conectar a MongoDB al inicio; si falla, seguimos usando fallback en memoria
    try {
      await mongo.connect(config.uri, config.dbName);
      console.log('Connected to MongoDB');
    } catch (err) {
      console.log('MongoDB not available, using in-memory store');
    }

    // Intentar escuchar en un puerto disponible empezando en DEFAULT_PORT o PORT env
    let port = Number(process.env.PORT) || DEFAULT_PORT;
    let server = null;
    const maxAttempts = 11; // try ports port .. port+10
    for (let i = 0; i < maxAttempts; i++) {
      try {
        server = await _listen(app, port);
        console.log(`Server running on http://localhost:${port}`);
        break;
      } catch (err) {
        if (err && err.code === 'EADDRINUSE') {
          console.warn(`Port ${port} in use, trying ${port + 1}...`);
          port++;
          continue;
        }
        throw err;
      }
    }

    if (!server) {
      console.error('No available port found to start the server');
      process.exit(1);
    }

    // Graceful shutdown handlers
    process.on('SIGINT', async () => {
      console.log('Shutting down...');
      try { await mongo.close(); } catch (e) {}
      server.close(() => process.exit(0));
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
