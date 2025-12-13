import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function ModalCreateTask({
  show,
  onHide,
  projectId,
  onSuccess,
}) {
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    assignee_id: "",
  });

  useEffect(() => {
    if (show) {
      setFormData({
        title: "",
        description: "",
        due_date: "",
        assignee_id: "",
      });
    }
  }, [show]);


  useEffect(() => {
    const fetchMembers = async () => {
      if (!projectId) return;

      setLoadingMembers(true);
      try {
        const { data } = await API.get(`/projects/${projectId}`);
        setMembers(data?.data?.members || []);
      } catch (error) {
        console.error("Error cargando miembros", error);
      } finally {
        setLoadingMembers(false);
      }
    };

    if (show) fetchMembers();
  }, [show, projectId]);

 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submit = async () => {
    if (!formData.title.trim()) {
      alert("El título es obligatorio");
      return;
    }

    if (!projectId) {
      alert("Proyecto inválido");
      return;
    }

    try {
      await API.post("/tasks", {
        project_id: projectId,
        title: formData.title.trim(),
        description: formData.description || null,
        status: "pending",
        assignee_id: formData.assignee_id || null,
        due_date: formData.due_date || null,
      });

      onSuccess(); 
      onHide();    
    } catch (error) {
      console.error(
        "Error creando tarea:",
        error.response?.data || error
      );
      alert("No se pudo crear la tarea");
    }
  };

  if (!show) return null;

  
  return (
    <div
      className="modal-backdrop-custom modal fade show"
      style={{ display: "block" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow rounded-4">

          <div className="modal-header">
            <h5 className="modal-title fw-bold">Nueva tarea</h5>
            <button className="btn-close" onClick={onHide} />
          </div>

          <div className="modal-body">
            <input
              className="form-control mb-3"
              name="title"
              placeholder="Título de la tarea"
              value={formData.title}
              onChange={handleChange}
            />

            <textarea
              className="form-control mb-3"
              name="description"
              placeholder="Descripción (opcional)"
              value={formData.description}
              onChange={handleChange}
            />

            <input
              type="date"
              className="form-control mb-3"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
            />

            <label className="form-label fw-semibold">Asignar a</label>
            {loadingMembers ? (
              <div className="text-muted">Cargando miembros...</div>
            ) : (
              <select
                className="form-select"
                name="assignee_id"
                value={formData.assignee_id}
                onChange={handleChange}
              >
                <option value="">— Sin asignar —</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onHide}>
              Cancelar
            </button>
            <button className="btn btn-purple" onClick={submit}>
              Crear tarea
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
