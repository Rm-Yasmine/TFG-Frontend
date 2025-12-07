import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  const navigate = useNavigate();

  const api = "https://tfg-backend-production-bc6a.up.railway.app/api";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "email") validateEmail(value);
    if (name === "password") validatePassword(value);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setErrors((prev) => ({
      ...prev,
      email: regex.test(email) ? "" : "Formato de correo inválido",
    }));
  };

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    setErrors((prev) => ({
      ...prev,
      password: regex.test(password)
        ? ""
        : "Debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (errors.email || errors.password) {
      setMessage({
        type: "error",
        text: "Corrige los errores antes de continuar",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { data } = await axios.post(`${api}/register`, form);

      setMessage({
        type: "success",
        text: "Cuenta creada. Revisa tu correo para el PIN de verificación.",
      });

      // Redirección a la página de verificación
      setTimeout(() => {
        navigate(`/verify?email=${form.email}`);
      }, 1500);

    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Error al registrarte. Verifica tus datos.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page container-fluid d-flex align-items-center justify-content-center vh-100">
      <div className="login-card row shadow rounded-4 overflow-hidden">

        {/* PANEL IZQUIERDO */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center gradient-bg text-white text-center p-5">
          <h3 className="fw-bold mb-3">¡Bienvenida de nuevo!</h3>
          <p className="mb-4 small">Tu espacio creativo te espera.</p>
          <button
            className="btn btn-light px-4 fw-semibold"
            onClick={() => navigate("/login")}
          >
            ENTRAR
          </button>
        </div>

        {/* PANEL DERECHO */}
        <div className="col-md-6 p-5 bg-light d-flex flex-column justify-content-center">
          <h2 className="fw-bold mb-4 text-center">Crea tu cuenta</h2>

          {/* MENSAJES */}
          {message.text && (
            <div
              className={`alert ${
                message.type === "success" ? "alert-success" : "alert-danger"
              } text-center fw-semibold`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              className="form-control mb-3 py-2"
              name="name"
              placeholder="Nombre"
              onChange={handleChange}
              required
            />

            <input
              className="form-control mb-1 py-2"
              name="email"
              type="email"
              placeholder="Correo electrónico"
              onChange={handleChange}
              required
            />
            {errors.email && (
              <small className="text-danger">{errors.email}</small>
            )}

            <input
              className="form-control mb-1 py-2"
              name="password"
              type="password"
              placeholder="Contraseña"
              onChange={handleChange}
              required
            />
            {errors.password && (
              <small className="text-danger">{errors.password}</small>
            )}

            <button
              className="btn btn-primary w-100 py-2 mt-3"
              disabled={loading}
            >
              {loading ? "Registrando..." : "REGISTRARSE"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
