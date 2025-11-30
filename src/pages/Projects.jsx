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

  function openModal() {
    setForm({
      title: "",
      description: "",
      start_date: "",
      end_date: "",
    });
    setModalOpen(true);
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

        {/* Estilos */}
        <style>{`
          .btn-purple { 
            background: #7a48e3; 
            color: #fff; 
            border: none; 
            padding: 8px 16px;
            border-radius: 6px;
          }
          .btn-purple:hover { background: #6233d4; }

          .text-purple { color: #7a48e3; }

          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1200;
          }
          .modal-card {
            background: #fff;
            border-radius: 12px;
            width: 90%;
            max-width: 650px;
            overflow: hidden;
            animation: fadeIn 0.25s ease-out;
          }
          .modal-header {
            padding: 16px;
            border-bottom: 1px solid #eee;
          }
          .modal-body {
            padding: 16px;
          }
          .modal-footer {
            border-top: 1px solid #eee;
            padding: 16px;
          }

          @keyframes fadeIn {
            from { transform: scale(0.92); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
