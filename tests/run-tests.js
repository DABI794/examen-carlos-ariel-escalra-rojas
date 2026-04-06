const assert = require('assert');
const tasks = require('../src/tasks');

function run() {
  console.log('Ejecutando 2 pruebas...');
  tasks._clearAllForTests();

  // Prueba 1: agregar y listar pendientes
  const t1 = tasks.addTask('comprar leche');
  const pending1 = tasks.listPending();
  assert.strictEqual(pending1.length, 1, 'Debe existir 1 tarea pendiente');
  assert.strictEqual(pending1[0].description, 'comprar leche');

  // Prueba 1.5: validación - no permitir descripciones vacías
  let threw = false;
  try {
    tasks.addTask('   ');
  } catch (err) {
    threw = true;
  }
  assert.strictEqual(threw, true, 'Debe lanzar error al agregar tarea vacía');

  // Prueba 2: marcar completada
  const marked = tasks.markCompleted(t1.id);
  assert.strictEqual(marked.completed, true, 'La tarea debe quedar como completada');
  const pending2 = tasks.listPending();
  assert.strictEqual(pending2.length, 0, 'No debe haber tareas pendientes después de completar');

  console.log('Todas las pruebas pasaron.');
}

try {
  run();
  process.exit(0);
} catch (err) {
  console.error('Fallo en pruebas:', err.message);
  process.exit(1);
}
