"use strict";


const config = require('../config/db');

let _hasDriver = true;
let _MongoClient = null;
try {
  _MongoClient = require('mongodb').MongoClient;
} catch (err) {
  _hasDriver = false;
}

let _client = null;
let _db = null;

const _store = { tasks: [] };

async function connect(uri = config.uri, dbName = config.dbName) {
  if (!_hasDriver) return null;
  if (_db) return _db;
  _client = new _MongoClient(uri, { useUnifiedTopology: true });
  await _client.connect();
  _db = _client.db(dbName);
  await _db.collection('tasks').createIndex({ id: 1 }, { unique: true });
  return _db;
}

async function saveTask(task) {
  if (!_hasDriver || !_db) {
    _store.tasks.push(task);
    return task;
  }
  const col = _db.collection('tasks');
  await col.insertOne(task);
  return task;
}

async function findPending() {
  if (!_hasDriver || !_db) {
    return _store.tasks.filter(t => !t.completed);
  }
  const col = _db.collection('tasks');
  return col.find({ completed: { $ne: true } }).toArray();
}

async function updateTask(id, patch) {
  if (!_hasDriver || !_db) {
    const t = _store.tasks.find(x => x.id === id);
    if (!t) return null;
    Object.assign(t, patch);
    return t;
  }
  const col = _db.collection('tasks');
  const res = await col.findOneAndUpdate({ id: id }, { $set: patch }, { returnDocument: 'after' });
  return res.value;
}

async function deleteTask(id) {
  if (!_hasDriver || !_db) {
    const idx = _store.tasks.findIndex(x => x.id === id);
    if (idx === -1) return false;
    _store.tasks.splice(idx, 1);
    return true;
  }
  const col = _db.collection('tasks');
  const res = await col.deleteOne({ id: id });
  return res.deletedCount > 0;
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
  close,
  deleteTask,
  _hasDriver
};
