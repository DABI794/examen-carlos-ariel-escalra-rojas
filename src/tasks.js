"use strict";

const tasks = [];
let nextId = 1;

function _validateDescription(desc) {
  if (!desc || typeof desc !== 'string' || desc.trim() === '') {
    throw new Error('La descripción de la tarea no puede estar vacía');
  }
}

function _createTaskObject(description) {
  return {
    id: nextId++,
    description: description.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };
}

function addTask(description) {
  _validateDescription(description);
  const task = _createTaskObject(description);
  tasks.push(task);
  return task;
}

function listPending() {
  return tasks.filter(t => !t.completed);
}

function markCompleted(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) throw new Error('Tarea no encontrada');
  t.completed = true;
  t.completedAt = new Date().toISOString();
  return t;
}

// Helpers para pruebas/estado (no expuesto al usuario final en una app real)
function _clearAllForTests() {
  tasks.length = 0;
  nextId = 1;
}

module.exports = {
  addTask,
  listPending,
  markCompleted,
  _clearAllForTests
};
