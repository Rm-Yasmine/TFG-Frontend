import React, { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [verificationStep, setVerificationStep] = useState(false);
  const [pin, setPin] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ PASO 1 → REGISTRO + ENVÍO DEL PIN (Laravel)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/register", form);

      setVerificationStep(true);

      alert(`Hemos enviado un código a ${form.email}`);
    } catch (err) {
      console.error(err);
      alert("Error al enviar el código");
    }
  };

  // ✅ PASO 2 → VERIFICAR PIN + CREAR USUARIO DEFINITIVO
  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/verify-pin", {
        email: form.email,
        pin: pin,
      });

      alert("Cuenta creada correctamente 🎉");

      // ✅ Guardar token si quieres
      localStorage.setItem("token", data.data.token);

      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Código incorrecto o expirado");
    }
  };

  return (
    <div className="login-page container-fluid d-flex align-items-center justify-content-center vh-100">
      <div className="login-card row shadow rounded-4 overflow-hidden">

        {/* Panel Izquierdo */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center gradient-bg text-white text-center p-5">
          <h3 className="fw-bold mb-3">¡Bienvenida de nuevo!</h3>
          <p className="mb-4 small">Tu espacio creativo te espera.</p>
          <button
            className="btn btn-light px-4 fw-semibold"
            onClick={() => navigate("/")}
          >
            ENTRAR
          </button>
        </div>

        {/* Panel Derecho */}
        <div className="col-md-6 p-5 bg-light d-flex flex-column justify-content-center">

          {/* ✅ FORMULARIO DE REGISTRO */}
          {!verificationStep ? (
            <>
              <h2 className="fw-bold mb-4 text-center">Crea tu cuenta</h2>
              <form onSubmit={handleSubmit}>
                <input
                  className="form-control mb-3 py-2"
                  name="name"
                  placeholder="Nombre"
                  onChange={handleChange}
                  required
                />
                <input
                  className="form-control mb-3 py-2"
                  name="email"
                  type="email"
                  placeholder="Correo electrónico"
                  onChange={handleChange}
                  required
                />
                <input
                  className="form-control mb-3 py-2"
                  name="password"
                  type="password"
                  placeholder="Contraseña"
                  onChange={handleChange}
                  required
                />
                <button className="btn btn-primary w-100 py-2">
                  REGISTRARSE
                </button>
              </form>
            </>
          ) : (
            <>
              {/* ✅ FORMULARIO DE VERIFICACIÓN */}
              <h2 className="fw-bold mb-4 text-center">Verifica tu correo</h2>
              <p className="text-muted text-center mb-3">
                Introduce el código enviado a <strong>{form.email}</strong>
              </p>

              <form onSubmit={handleVerify}>
                <input
                  className="form-control mb-3 py-2 text-center"
                  type="text"
                  maxLength="6"
                  placeholder="Código de verificación"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                />
                <button className="btn btn-success w-100 py-2">
                  VERIFICAR Y CREAR CUENTA
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
