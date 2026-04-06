"use strict";

/**
 * Adaptador NoSQL (esqueleto).
 * Implementación mínima: interfaz para futuras integraciones con MongoDB/Cosmos/etc.
 * Actualmente actúa como stub en memoria para facilitar pruebas.
 */

const _store = {
  tasks: []
};

function connect(/*uri, opts*/) {
  // En un adaptador real se establecería conexión con la BD aquí.
  return Promise.resolve(true);
}

async function saveTask(task) {
  _store.tasks.push(task);
  return task;
}

async function findPending() {
  return _store.tasks.filter(t => !t.completed);
}

async function updateTask(id, patch) {
  const t = _store.tasks.find(x => x.id === id);
  if (!t) return null;
  Object.assign(t, patch);
  return t;
}

module.exports = {
  connect,
  saveTask,
  findPending,
  updateTask
};
