"use strict";

// Módulo de gestión de tareas (ligero, en memoria). Refactor: nombres privados y helpers.
const _tasks = [];
let _nextId = 1;

function _now() {
  return new Date().toISOString();
}

function _validateDescription(desc) {
  if (!desc || typeof desc !== 'string' || desc.trim() === '') {
    throw new Error('La descripción de la tarea no puede estar vacía');
  }
}

function _createTaskObject(description, opts) {
  const createdAt = (opts && opts.createdAt) ? opts.createdAt : _now();
  let id;
  if (opts && typeof opts.id !== 'undefined') {
    id = opts.id;
    // Ensure nextId stays ahead to avoid duplicates
    if (id >= _nextId) _nextId = id + 1;
  } else {
    id = _nextId++;
  }
  return {
    id,
    description: description.trim(),
    completed: false,
    createdAt
  };
}

function addTask(description, opts) {
  _validateDescription(description);
  const task = _createTaskObject(description, opts);
  _tasks.push(task);
  return task;
}

// Expose validation for external callers (server)
function validateDescription(desc) {
  return _validateDescription(desc);
}

function listPending() {
  return _tasks.filter(t => !t.completed);
}

function markCompleted(id) {
  const t = _tasks.find(x => x.id === id);
  if (!t) throw new Error('Tarea no encontrada');
  t.completed = true;
  t.completedAt = _now();
  return t;
}

function deleteTask(id) {
  const idx = _tasks.findIndex(x => x.id === id);
  if (idx === -1) return false;
  _tasks.splice(idx, 1);
  return true;
}

function updateTaskLocal(id, fields) {
  const t = _tasks.find(x => x.id === id);
  if (!t) return null;
  if (fields.description) t.description = fields.description.trim();
  if (typeof fields.completed !== 'undefined') t.completed = !!fields.completed;
  if (fields.completed) t.completedAt = _now();
  return t;
}

// Helpers para pruebas/estado (internos)
function _clearAllForTests() {
  _tasks.length = 0;
  _nextId = 1;
}

module.exports = {
  addTask,
  listPending,
  markCompleted,
  _clearAllForTests,
  validateDescription
};
