import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function ModalCreateTask({
  show,
  onHide,
  projectId,
  onSuccess,
  userId,
}) {
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    assignee_id: "",
  });

  // Reset formulario al abrir
  useEffect(() => {
    if (show) {
      setFormData({ title: "", description: "", due_date: "", assignee_id: "" });
    }
  }, [show]);

  // Cargar miembros
  useEffect(() => {
    const fetchMembers = async () => {
      if (!projectId) return;
      setLoadingMembers(true);
      try {
        const { data } = await API.get(`/projects/${projectId}`);
        setMembers(data.data.members || []);
      } catch (err) {
        console.error("Error cargando miembros", err);
      } finally {
        setLoadingMembers(false);
      }
    };
    if (show) fetchMembers();
  }, [show, projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async () => {
    if (!formData.title) {
      alert("El título es obligatorio.");
      return;
    }
    if (!projectId || !userId) {
      console.log("Project ID or User ID missing:", { projectId, userId });
      alert("Datos del proyecto o usuario no disponibles.");
      return;
    }

    try {
      await API.post(`/tasks`, {
        project_id: projectId,
        title: formData.title,
        description: formData.description || "",
        status: "PENDING",
        assignee_id: formData.assignee_id || null,
        created_by: userId,
        due_date: formData.due_date || null,
      });

      onSuccess();
      onHide();
    } catch (err) {
      console.error("Error creando tarea", err);
      alert("No se pudo crear la tarea.");
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show custom-modal" style={{ display: "block" }}>
      <div className="modal-dialog">
        <div className="modal-content animate-fade">
          <div className="modal-header">
            <h5 className="modal-title">Nueva Tarea</h5>
            <button className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <input
              className="form-control mb-2"
              name="title"
              placeholder="Título de la tarea..."
              value={formData.title}
              onChange={handleChange}
            />
            <textarea
              className="form-control mb-2"
              name="description"
              placeholder="Descripción de la tarea..."
              value={formData.description}
              onChange={handleChange}
            />
            <input
              type="date"
              className="form-control mb-2"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
            />
            {/* <label className="mt-2 mb-1 fw-semibold">Asignar a:</label>
            {loadingMembers ? (
              <div className="text-muted">Cargando miembros...</div>
            ) : (
              <select
                className="form-select mb-2"
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
            )} */}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onHide}>
              Cancelar
            </button>
            <button className="btn btn-purple" onClick={submit}>
              Crear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
