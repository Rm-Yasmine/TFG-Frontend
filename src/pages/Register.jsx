import React, { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  const navigate = useNavigate();

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
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    setErrors((prev) => ({
      ...prev,
      password: regex.test(password)
        ? ""
        : "Debe tener 8 caracteres, mayúscula, número y símbolo",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const response = await API.post("/register", form);

      setMessage({
        type: "success",
        text: "Cuenta creada. Revisa tu correo para el PIN de verificación.",
      });

      // Guardar email temporal para Verify.jsx
      setTimeout(() => {
        navigate(`/verify?email=${form.email}`);
      }, 1500);

    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Error al registrarte.",
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

            <input
              className="form-control mb-1 py-2"
              name="password_confirmation"
              type="password"
              placeholder="Confirmar contraseña"
              onChange={handleChange}
              required
            />

            <button className="btn btn-primary w-100 py-2 mt-3" disabled={loading}>
              {loading ? "Registrando..." : "REGISTRARSE"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
