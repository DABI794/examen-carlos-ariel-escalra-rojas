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

function _createTaskObject(description) {
  return {
    id: _nextId++,
    description: description.trim(),
    completed: false,
    createdAt: _now()
  };
}

function addTask(description) {
  _validateDescription(description);
  const task = _createTaskObject(description);
  _tasks.push(task);
  return task;
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

// Helpers para pruebas/estado (internos)
function _clearAllForTests() {
  _tasks.length = 0;
  _nextId = 1;
}

module.exports = {
  addTask,
  listPending,
  markCompleted,
  _clearAllForTests
};
