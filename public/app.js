const api = {
  add: (desc) => fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ description: desc }) }).then(r => r.json()),
  pending: () => fetch('/api/tasks/pending').then(r => r.json()),
  complete: (id) => fetch(`/api/tasks/${id}/complete`, { method: 'POST' }).then(r => r.json())
};

const descInput = document.getElementById('desc');
const addBtn = document.getElementById('addBtn');
const pendingList = document.getElementById('pending');
const msg = document.getElementById('msg');

function showMsg(text) {
  msg.textContent = text;
  setTimeout(() => { msg.textContent = ''; }, 3000);
}

function renderPending(items) {
  pendingList.innerHTML = '';
  if (!items || items.length === 0) {
    pendingList.innerHTML = '<li>No hay tareas pendientes</li>';
    return;
  }
  items.forEach(t => {
    const li = document.createElement('li');
    li.textContent = `${t.id} - ${t.description}`;
    const btn = document.createElement('button');
    btn.textContent = 'Marcar completada';
    btn.addEventListener('click', async () => {
      await api.complete(t.id);
      load();
    });
    li.appendChild(btn);
    pendingList.appendChild(li);
  });
}

async function load() {
  const items = await api.pending();
  renderPending(items);
}

addBtn.addEventListener('click', async () => {
  const d = descInput.value;
  try {
    const res = await api.add(d);
    if (res && res.error) throw new Error(res.error);
    descInput.value = '';
    load();
  } catch (err) {
    showMsg(err.message || 'Error');
  }
});

load();
