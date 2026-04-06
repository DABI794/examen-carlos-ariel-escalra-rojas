const { useState, useEffect } = React;

function TaskApp(){
  const [desc, setDesc] = useState('');
  const [items, setItems] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [error, setError] = useState('');

  async function load(){
    try{
      const res = await fetch('/api/tasks/pending');
      const data = await res.json();
      setItems(data);
      try {
        const r2 = await fetch('/api/tasks/completed');
        const c = await r2.json();
        setCompleted(c);
      } catch (e) { setCompleted([]); }
    }catch(e){
      setError('No se pudo cargar tareas');
    }
  }

  useEffect(()=>{ load(); }, []);

  async function addTask(){
    try{
      const res = await fetch('/api/tasks', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ description: desc }) });
      const data = await res.json();
      if(data && data.error) throw new Error(data.error);
      setDesc('');
      load();
    }catch(err){
      setError(err.message || 'Error al agregar');
    }
  }

  async function complete(id){
    try{
      await fetch(`/api/tasks/${id}/complete`, { method:'POST' });
      load();
    }catch(e){ setError('Error al marcar completada'); }
  }

  return (
    <main className="app-container">
      <h1 className="app-title">Gestor de Tareas</h1>
      <section className="top-form">
        <input className="input" id="desc" placeholder="Descripción de la tarea" value={desc} onChange={e=>setDesc(e.target.value)} />
        <button className="btn" onClick={addTask}>Agregar tarea</button>
      </section>
      {error && <div className="error">{error}</div>}

      <section className="section">
        <h2>Tareas pendientes</h2>
        <ul className="task-list">
          {items.length===0 && <li className="empty">No hay tareas pendientes</li>}
          {items.map(t => (
            <li key={t.id} className="task-item">
              <span className={`task-desc ${t.completed? 'completed':''}`}>{t.description}</span>
              <span className="task-actions">
                <button className="small-btn positive" onClick={()=>complete(t.id)}>Marcar completada</button>
                <button className="small-btn" onClick={async ()=>{ const newDesc = prompt('Nueva descripción', t.description); if(newDesc){ await fetch(`/api/tasks/${t.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ description: newDesc }) }); load(); }}}>Editar</button>
                <button className="small-btn danger" onClick={async ()=>{ if(confirm('Eliminar tarea?')){ await fetch(`/api/tasks/${t.id}`, { method:'DELETE' }); load(); } }}>Eliminar</button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>Tareas completadas</h2>
        <ul className="task-list">
          {completed.length===0 && <li className="empty">No hay tareas completadas</li>}
          {completed.map(t => (
            <li key={t.id} className="task-item">
              <span className="task-desc completed">{t.description}</span>
              <button className="small-btn" onClick={async ()=>{ if(confirm('Eliminar tarea?')){ await fetch(`/api/tasks/${t.id}`, { method:'DELETE' }); load(); } }}>Eliminar</button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TaskApp />);
