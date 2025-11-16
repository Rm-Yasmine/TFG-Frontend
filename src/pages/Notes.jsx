import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Menu from "../components/Menu";
import "../App.css";

/**
 * Notes.jsx
 * Página de Notas: listar, crear, editar, eliminar, ver compartidas.
 *
 * Requiere:
 * - API axios con baseURL y token (localStorage token).
 * - Rutas backend:
 *    GET  /notes
 *    GET  /notes/shared
 *    POST /notes
 *    PUT  /notes/{id}
 *    DELETE /notes/{id}
 */

export default function Notes() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("mine"); // 'mine' | 'shared'

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // form
  const emptyForm = { title: "", content: "", is_shared: false };
  const [form, setForm] = useState(emptyForm);

  // load user + notes
  useEffect(() => {
    (async () => {
      try {
        const me = await API.get("/me");
        setUser(me.data.data);

        await loadNotes();
        await loadSharedNotes();
      } catch (err) {
        console.error("Error fetching user/notes:", err.response?.data || err.message);
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
        console.error("Notes: unexpected response", res.data);
      }
    } catch (err) {
      console.error("Error loading notes:", err.response?.data || err.message);
      setNotes([]);
    }
  }

  async function loadSharedNotes() {
    try {
      const res = await API.get("/notes/shared");
      if (res.data?.status === "success") {
        setSharedNotes(res.data.data || []);
      } else {
        setSharedNotes([]);
      }
    } catch (err) {
      console.error("Error loading shared notes:", err.response?.data || err.message);
      setSharedNotes([]);
    }
  }

  // open new note modal
  function openNew() {
    setEditingNote(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  // open edit modal
  function openEdit(note) {
    setEditingNote(note);
    setForm({
      title: note.title || "",
      content: note.content || "",
      is_shared: !!note.is_shared,
    });
    setModalOpen(true);
  }

  // save note (create or update)
  async function saveNote(e) {
    e.preventDefault();
    if (!form.title.trim()) return alert("El título es obligatorio");

    setSaving(true);
    try {
      if (editingNote) {
        // update
        const res = await API.put(`/notes/${editingNote.id}`, {
          title: form.title,
          content: form.content,
          is_shared: form.is_shared,
        });
        if (res.data?.status === "success") {
          await loadNotes();
          await loadSharedNotes();
          setModalOpen(false);
        } else {
          alert("No se pudo actualizar la nota");
        }
      } else {
        // create
        const res = await API.post("/notes", {
          title: form.title,
          content: form.content,
          is_shared: form.is_shared,
        });
        if (res.data?.status === "success") {
          await loadNotes();
          await loadSharedNotes();
          setModalOpen(false);
        } else {
          alert("No se pudo crear la nota");
        }
      }
    } catch (err) {
      console.error("Save note error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Error guardando la nota");
    } finally {
      setSaving(false);
    }
  }

  // delete note
  async function deleteNote(note) {
    if (!window.confirm("¿Seguro que quieres eliminar esta nota?")) return;
    try {
      const res = await API.delete(`/notes/${note.id}`);
      if (res.data?.status === "success") {
        await loadNotes();
        await loadSharedNotes();
      } else {
        alert("No se pudo eliminar la nota");
      }
    } catch (err) {
      console.error("Delete note error:", err.response?.data || err.message);
      alert("Error eliminando la nota");
    }
  }

  // toggle share quick from list (optimistic)
  async function toggleShare(note) {
    try {
      const res = await API.put(`/notes/${note.id}`, {
        is_shared: !note.is_shared,
      });
      if (res.data?.status === "success") {
        await loadNotes();
        await loadSharedNotes();
      } else {
        alert("No se pudo actualizar");
      }
    } catch (err) {
      console.error("toggle share error:", err.response?.data || err.message);
      alert("Error actualizando");
    }
  }

  // UI small components
  function NoteCard({ note, isMine = true }) {
    return (
      <div className="card mb-3 shadow-sm note-card">
        <div className="card-body d-flex justify-content-between align-items-start">
          <div style={{ flex: 1 }}>
            <div className="d-flex align-items-center mb-1">
              <h6 className="mb-0 me-2">{note.title}</h6>
              {note.is_shared && <span className="badge bg-purple text-white">Compartida</span>}
            </div>
            <p className="small text-muted mb-1">
              {note.content ? note.content.slice(0, 120) : <em>Sin contenido</em>}
            </p>
            <small className="text-muted">Creada: {new Date(note.created_at).toLocaleString()}</small>
          </div>

          <div className="ms-3 d-flex flex-column align-items-end">
            {isMine && (
              <>
                <button className="btn btn-sm btn-outline-primary mb-2" onClick={() => openEdit(note)}>
                  Editar
                </button>
                <button className="btn btn-sm btn-outline-danger mb-2" onClick={() => deleteNote(note)}>
                  Borrar
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => toggleShare(note)}
                  title={note.is_shared ? "Hacer privada" : "Compartir"}
                >
                  {note.is_shared ? "Privar" : "Compartir"}
                </button>
              </>
            )}
            {!isMine && note.is_shared && (
              <small className="text-muted">Compartida por {note.user?.name || "otro"}</small>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <p className="text-center mt-5">Cargando notas...</p>;

  return (
    <div className="dashboard-container d-flex">
      <Menu active="notas" />
      <div className="content flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-0">Notas</h3>
            <small className="text-muted">Crea, edita, comparte y organiza tus notas</small>
          </div>

          <div className="d-flex align-items-center">
            <div className="btn-group me-3" role="group">
              <button className={`btn btn-sm ${tab === "mine" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setTab("mine")}>
                Mis notas
              </button>
              <button className={`btn btn-sm ${tab === "shared" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setTab("shared")}>
                Compartidas
              </button>
            </div>

            <button className="btn btn-purple" onClick={openNew}>
              + Nueva nota
            </button>
          </div>
        </div>

        {tab === "mine" ? (
          <>
            {notes.length === 0 ? (
              <div className="text-center text-secondary py-5">No tienes notas todavía. Crea la primera.</div>
            ) : (
              notes.map((n) => <NoteCard key={n.id} note={n} isMine={n.user_id === user.id} />)
            )}
          </>
        ) : (
          <>
            {sharedNotes.length === 0 ? (
              <div className="text-center text-secondary py-5">No hay notas compartidas.</div>
            ) : (
              sharedNotes.map((n) => <NoteCard key={n.id} note={n} isMine={n.user_id === user.id} />)
            )}
          </>
        )}

        {/* Modal simple */}
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

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="is_shared"
                      checked={!!form.is_shared}
                      onChange={(e) => setForm({ ...form, is_shared: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="is_shared">
                      Compartir nota (visible en la pestaña Compartidas)
                    </label>
                  </div>
                </div>

                <div className="modal-footer d-flex justify-content-end">
                  <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setModalOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-purple" disabled={saving}>
                    {saving ? "Guardando..." : editingNote ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Styles modal (inline here para que sea autoconclusivo) */}
        <style>{`
          .note-card .card-body { gap: 12px; display: flex; }
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
          .badge.bg-purple { background: #7a48e3; color: white; }
        `}</style>
      </div>
    </div>
  );
}
