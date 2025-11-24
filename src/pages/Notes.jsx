import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Menu from "../components/Menu";
import "../App.css";
import { Navigate } from "react-router-dom";

export default function Notes() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { title: "", content: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    (async () => {
      try {
        const me = await API.get("/me");
        setUser(me.data.data);
        await loadNotes();
      } catch (err) {
        console.error("Error cargando usuario/notas:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function loadNotes() {
    try {
      const res = await API.get("/notes");
      if (res.data?.status === "success") {
        setNotes(res.data.data || []);
      } else {
        setNotes([]);
      }
    } catch (err) {
      console.error("Error cargando notas:", err);
      setNotes([]);
    }
  }

  function openNew() {
    setEditingNote(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openView(note) {
    setEditingNote(note);
    setForm({
      title: note.title || "",
      content: note.content || "",
    });
    setModalOpen(true);
  }

  async function saveNote(e) {
    e.preventDefault();
    if (!form.title.trim()) return alert("El título es obligatorio");
    setSaving(true);

    try {
      if (editingNote) {
        const res = await API.put(`/notes/${editingNote.id}`, form);
        if (res.data?.status === "success") {
          await loadNotes();
          setModalOpen(false);
        } else {
          alert("No se pudo actualizar la nota");
        }
      } else {
        const res = await API.post("/notes", form);
        if (res.data?.status === "success") {
          await loadNotes();
          setModalOpen(false);
        } else {
          alert("No se pudo crear la nota");
        }
      }
    } catch (err) {
      console.error("Error guardando nota:", err);
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(note) {
    if (!window.confirm("¿Eliminar esta nota?")) return;
    try {
      const res = await API.delete(`/notes/${note.id}`);
      if (res.data?.status === "success") {
        await loadNotes();
        setModalOpen(false);
      } else {
        alert("No se pudo eliminar");
      }
    } catch (err) {
      console.error("Error eliminando nota:", err);
      alert("Error al eliminar");
    }
  }

  const handleLogout = async () => {
    try {
      await API.post("/logout");
      localStorage.removeItem("token");
      Navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return <p className="text-center mt-5">Cargando...</p>;


  function NoteCard({ note }) {
    return (
      <div className="card mb-3 shadow-sm note-card" onClick={() => openView(note)} style={{ cursor: "pointer" }}>
        <div className="card-body">
          <h6 className="mb-1">{note.title}</h6>
          <p className="small text-muted mb-0">
            {note.content ? note.content.slice(0, 100) + "…" : <em>Sin contenido</em>}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container d-flex">
      <Menu active="notas" onLogout={handleLogout} />
      <div className="content flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-0">Notas</h3>
            <small className="text-muted">Crea, edita y organiza tus notas personales</small>
          </div>
          <button className="btn btn-purple" onClick={openNew}>+ Nueva nota</button>
        </div>

        {notes.length === 0 ? (
          <div className="text-center text-secondary py-5">No tienes notas todavía. Crea la primera.</div>
        ) : (
          notes.map((n) => <NoteCard key={n.id} note={n} />)
        )}

        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{editingNote ? "Editar nota" : "Nueva nota"}</h5>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setModalOpen(false)}>Cerrar</button>
              </div>

              <form onSubmit={saveNote}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Título</label>
                    <input
                      className="form-control"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                      maxLength={255}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Contenido</label>
                    <textarea
                      className="form-control"
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      rows={6}
                    />
                  </div>
                </div>

                <div className="modal-footer d-flex justify-content-between">
                  {editingNote && (
                    <button type="button" className="btn btn-outline-danger" onClick={() => deleteNote(editingNote)}>
                      Eliminar
                    </button>
                  )}
                  <div>
                    <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setModalOpen(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-purple" disabled={saving}>
                      {saving ? "Guardando..." : editingNote ? "Actualizar" : "Crear"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`
          .note-card:hover { background: #f9f9ff; }
          .btn-purple { background: #7a48e3; color: #fff; border: none; }
          .btn-purple:hover { background: #5a36b1; color: #fff; }

          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15,15,20,0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1200;
            padding: 16px;
          }
          .modal-card {
            width: 920px;
            max-width: 98%;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 12px 30px rgba(10,10,20,0.2);
            overflow: hidden;
          }
          .modal-header { padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
          .modal-body { padding: 18px 20px; }
          .modal-footer { padding: 12px 20px; border-top: 1px solid #f0f0f0; }
        `}</style>
      </div>
    </div>
  );
}
