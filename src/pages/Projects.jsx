import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import "../App.css";

export default function Projects() {
  const [ownProjects, setOwnProjects] = useState([]);
  const [collabProjects, setCollabProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
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


const handleLogout = async () => {
  try {
    await API.post("/logout");              
    localStorage.removeItem("token");       
    navigate("/login");                     
  } catch (error) {
    console.error("Error cerrando sesión:", error);
  }
};

  const eliminarProyecto = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este proyecto?")) return;
    try {
      await API.delete(`/projects/${id}`);
      const { data } = await API.get("/projects");
      setOwnProjects(data.data.own || []);
      setCollabProjects(data.data.collaboration || []);
    } catch (err) {
      console.error("Error eliminando proyecto:", err);
      alert("No se pudo eliminar el proyecto");
    }
  };

  const renderProjectCard = (project) => (
    <div key={project.id} className="project-card position-relative">
      <div
        className="three-dots"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpenId(menuOpenId === project.id ? null : project.id);
        }}
      >
        ⋯
      </div>

      {menuOpenId === project.id && (
        <div className="project-menu">
          <button
            className="dropdown-item text-danger"
            onClick={(e) => {
              e.stopPropagation();
              eliminarProyecto(project.id);
              setMenuOpenId(null);
            }}
          >
            Eliminar proyecto
          </button>
        </div>
      )}

      <div
        onClick={() => navigate(`/projects/${project.id}`)}
        style={{ cursor: "pointer" }}
      >
        <h5 className="fw-bold">{project.title}</h5>
        <p className="text-muted small">{project.description}</p>
        <div className="mt-2 small d-flex justify-content-between">
          <span>{project.members?.length || 0} miembros</span>
        </div>
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
      <Menu active="proyectos" onLogout={handleLogout} />

      <div className="content flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">Proyectos</h3>
          <button className="btn btn-purple" onClick={openModal}>
            + Crear proyecto
          </button>
        </div>

        <h5 className="mb-3 text-purple">Mis proyectos</h5>
        <div className="projects-grid">{ownProjects.map(renderProjectCard)}</div>

        <h5 className="mt-5 mb-3 text-purple">Proyectos de colaboración</h5>
        <div className="projects-grid">{collabProjects.map(renderProjectCard)}</div>

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
      </div>
    </div>
  );
}
