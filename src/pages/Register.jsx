import React, { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [verificationStep, setVerificationStep] = useState(false);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ PASO 1: REGISTRAR + ENVIAR PIN DESDE LARAVEL
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/register", form);

      alert("Hemos enviado un código a tu correo ✅");
      setVerificationStep(true);
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
        "Error al enviar el código"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ PASO 2: VERIFICAR PIN Y CREAR CUENTA
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await API.post("/verify-pin", {
        email: form.email,
        pin: pin,
      });

      alert("Cuenta verificada y creada correctamente 🎉");

      // Guardar token si lo usas
      localStorage.setItem("token", data.data.token);

      navigate("/");
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
        "Código incorrecto"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page container-fluid d-flex align-items-center justify-content-center vh-100">
      <div className="login-card row shadow rounded-4 overflow-hidden">

        {/* IZQUIERDA */}
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

        {/* DERECHA */}
        <div className="col-md-6 p-5 bg-light d-flex flex-column justify-content-center">

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

                <button className="btn btn-primary w-100 py-2" disabled={loading}>
                  {loading ? "Enviando código..." : "REGISTRARSE"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="fw-bold mb-4 text-center">Verifica tu correo</h2>

              <p className="text-muted text-center mb-3">
                Hemos enviado un PIN a <strong>{form.email}</strong>
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

                <button className="btn btn-success w-100 py-2" disabled={loading}>
                  {loading ? "Verificando..." : "VERIFICAR Y CREAR CUENTA"}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
