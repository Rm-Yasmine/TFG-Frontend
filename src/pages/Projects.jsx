import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Menu from "../components/Menu";

export default function Projects() {
  const [ownProjects, setOwnProjects] = useState([]);
  const [collabProjects, setCollabProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    tasks: [],
    members: [],
  });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const me = await API.get("/me");
        setUser(me.data.data);

        const { data } = await API.get("/projects");
        setOwnProjects(data.data.own || []);
        setCollabProjects(data.data.collaboration || []);
      } catch (error) {
        console.error("Error al cargar proyectos:", error);
      }
    };
    fetchProjects();
  }, []);

  const renderProjectCard = (project) => (
    <div
      key={project.id}
      className="card shadow-sm border-0 p-3 m-2 project-card"
      onClick={() => navigate(`/projects/${project.id}`)}
      style={{ cursor: "pointer", flex: "1 1 30%", minWidth: 300 }}
    >
      <h5 className="fw-bold">{project.title}</h5>
      <p className="text-muted small">{project.description}</p>
      <div className="mt-2 small d-flex justify-content-between">
        <span>{project.members?.length || 0} miembros</span>
      </div>
    </div>
  );

  // Abrir modal
  function openModal() {
    setForm({
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      tasks: [],
      members: [],
    });
    setModalOpen(true);
  }

  function addTask() {
    setForm((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { title: "", description: "", due_date: "" }],
    }));
  }

  function addMember() {
    setForm((prev) => ({
      ...prev,
      members: [...prev.members, ""],
    }));
  }

  async function saveProject(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        owner_id: user.id,
      };
      const res = await API.post("/projects", payload);
      if (res.data?.status === "success") {
        const { data } = await API.get("/projects");
        setOwnProjects(data.data.own || []);
        setCollabProjects(data.data.collaboration || []);
        setModalOpen(false);
      } else {
        alert("No se pudo crear el proyecto");
      }
    } catch (err) {
      console.error("Error creando proyecto:", err);
      alert("Error al crear");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-container d-flex">
      <Menu active="proyectos" />
      <div className="content flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">Proyectos</h3>
          <button className="btn btn-purple" onClick={openModal}>
            + Crear proyecto
          </button>
        </div>

        <h5 className="mb-3 text-purple">Mis proyectos</h5>
        <div className="d-flex flex-wrap">{ownProjects.map(renderProjectCard)}</div>

        <h5 className="mt-5 mb-3 text-purple">Proyectos de colaboración</h5>
        <div className="d-flex flex-wrap">{collabProjects.map(renderProjectCard)}</div>

        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Nuevo proyecto</h5>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cerrar
                </button>
              </div>

              <form onSubmit={saveProject}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Título</label>
                    <input
                      className="form-control"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Inicio</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.start_date}
                        onChange={(e) =>
                          setForm({ ...form, start_date: e.target.value })
                        }
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">Fin</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.end_date}
                        onChange={(e) =>
                          setForm({ ...form, end_date: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Tareas</label>
                    {form.tasks.map((task, i) => (
                      <div key={i} className="border rounded p-2 mb-2">
                        <input
                          className="form-control mb-1"
                          placeholder="Título"
                          value={task.title}
                          onChange={(e) => {
                            const updated = [...form.tasks];
                            updated[i].title = e.target.value;
                            setForm({ ...form, tasks: updated });
                          }}
                        />
                        <textarea
                          className="form-control mb-1"
                          placeholder="Descripción"
                          value={task.description}
                          onChange={(e) => {
                            const updated = [...form.tasks];
                            updated[i].description = e.target.value;
                            setForm({ ...form, tasks: updated });
                          }}
                        />
                        <input
                          type="date"
                          className="form-control"
                          value={task.due_date}
                          onChange={(e) => {
                            const updated = [...form.tasks];
                            updated[i].due_date = e.target.value;
                            setForm({ ...form, tasks: updated });
                          }}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={addTask}
                    >
                      + Añadir tarea
                    </button>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Miembros</label>
                    {form.members.map((m, i) => (
                      <input
                        key={i}
                        className="form-control mb-1"
                        placeholder="Email o nombre"
                        value={m}
                        onChange={(e) => {
                          const updated = [...form.members];
                          updated[i] = e.target.value;
                          setForm({ ...form, members: updated });
                        }}
                      />
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={addMember}
                    >
                      + Añadir miembro
                    </button>
                  </div>
                </div>

                <div className="modal-footer d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-purple"
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Crear proyecto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`
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
          }
          .modal-card {
            background: #fff; 
            border-radius: 8px; 
            width: 90%; 
            max-width: 700px; 
            max-height: 90vh; 
            overflow-y: auto;
            display: flex;    
            flex-direction: column;
          }
          .modal-header, .modal-footer {    
            padding: 16px;    
            border-bottom: 1px solid #eee;  
          }
          .modal-footer {    
            border-top: none;  
          }
          .modal-body {    
            padding: 16px;    
            flex-grow: 1; 
            overflow-y: auto;  
          }
        `}</style>
      </div>
    </div>
  );
}