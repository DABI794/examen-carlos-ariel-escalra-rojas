"use strict";

// Adaptador MongoDB (esqueleto). Usa el driver oficial `mongodb`.
// No se conecta automáticamente: llamar a `connect()` antes de usar.

const { MongoClient } = require('mongodb');
const config = require('../config/db');

let _client = null;
let _db = null;

async function connect(uri = config.uri, dbName = config.dbName) {
  if (_db) return _db;
  _client = new MongoClient(uri, { useUnifiedTopology: true });
  await _client.connect();
  _db = _client.db(dbName);
  // Ensure index on id if needed
  await _db.collection('tasks').createIndex({ id: 1 }, { unique: true });
  return _db;
}

async function saveTask(task) {
  const col = _db.collection('tasks');
  await col.insertOne(task);
  return task;
}

async function findPending() {
  const col = _db.collection('tasks');
  return col.find({ completed: { $ne: true } }).toArray();
}

async function updateTask(id, patch) {
  const col = _db.collection('tasks');
  const res = await col.findOneAndUpdate({ id: id }, { $set: patch }, { returnDocument: 'after' });
  return res.value;
}

async function close() {
  if (_client) await _client.close();
  _client = null;
  _db = null;
}

module.exports = {
  connect,
  saveTask,
  findPending,
  updateTask,
  close
};
