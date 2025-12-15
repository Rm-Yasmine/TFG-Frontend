import { useState, useEffect } from "react";
import API from "../../api/axios";

export default function ModalEditTask({ show, onHide, task, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending", 
    due_date: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title ?? "",
        description: task.description ?? "",
        status: task.status ?? "pending", 
        due_date: task.due_date ?? "",
      });
    }
  }, [task]);

  if (!show || !task) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submit = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        title: formData.title.trim(),
        description: formData.description || "",
        status: formData.status, 
        due_date: formData.due_date || null,
      };

      await API.put(`/tasks/${task.id}`, payload);

      onSuccess();
      onHide();
    } catch (err) {
      console.error("Error actualizando tarea:", err.response?.data || err);
      setError("No se pudo actualizar la tarea.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop-custom modal fade show custom-modal"
      style={{ display: "block" }}
    >
      <div className="modal-custom modal-dialog">
        <div className="modal-content animate-fade">
          <div className="modal-header">
            <h5 className="modal-title">Editar tarea</h5>
            <button className="btn-close" onClick={onHide}></button>
          </div>

          <div className="modal-body">
            {error && (
              <div className="alert alert-danger small mb-2">{error}</div>
            )}

            <input
              className="form-control mb-2"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Título"
            />

            <textarea
              className="form-control mb-2"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción"
            />

            <select
              className="form-control mb-2"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">Pendiente</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completada</option>
            </select>

            <input
              className="form-control mb-2"
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
            />
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onHide}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              className="btn btn-purple"
              onClick={submit}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
