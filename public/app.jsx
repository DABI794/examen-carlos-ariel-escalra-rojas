const { useState, useEffect } = React;

function TaskApp(){
  const [desc, setDesc] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  async function load(){
    try{
      const res = await fetch('/api/tasks/pending');
      const data = await res.json();
      setItems(data);
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
    <main>
      <h1>Gestor de Tareas (React)</h1>
      <section id="form" style={{display:'flex', gap:8, marginBottom:12}}>
        <input id="desc" placeholder="Descripción de la tarea" value={desc} onChange={e=>setDesc(e.target.value)} style={{flex:1, padding:8}} />
        <button onClick={addTask}>Agregar tarea</button>
      </section>
      {error && <div className="error">{error}</div>}

      <section>
        <h2>Tareas pendientes</h2>
        <ul style={{listStyle:'none', padding:0}}>
          {items.length===0 && <li>No hay tareas pendientes</li>}
          {items.map(t => (
            <li key={t.id} style={{display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #eee'}}>
              <span>{t.id} - {t.description}</span>
              <button onClick={()=>complete(t.id)}>Marcar completada</button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TaskApp />);
