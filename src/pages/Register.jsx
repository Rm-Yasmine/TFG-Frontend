import React, { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1️⃣ Generar PIN antes de registrar
      const pin = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedCode(pin);

      // 2️⃣ Enviar PIN por correo con Web3Forms
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: "2385030c-4596-438b-a457-79b0627a5479",
          email: form.email,
          subject: "Tu código de verificación",
          message: `Tu código de verificación es: ${pin}`,
        }),
      });

      console.log("PIN enviado:", pin);

      // 3️⃣ Pasamos al paso de verificación
      setVerificationStep(true);

      alert(`Hemos enviado un PIN a ${form.email}`);
    } catch (err) {
      console.error(err);
      alert("Error enviando el correo.");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (verificationCode !== generatedCode) {
      alert("Código incorrecto.");
      return;
    }

    try {
      // 4️⃣ Ahora sí: registrar al usuario
      await API.post("/register", form);

      alert("Correo verificado y cuenta creada 🎉");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Error al crear tu cuenta.");
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
              <h2 className="fw-bold mb-4 text-center">Verifica tu correo</h2>
              <p className="text-muted text-center mb-3">
                Hemos enviado un PIN de 6 dígitos a <strong>{form.email}</strong>.
              </p>

              <form onSubmit={handleVerify}>
                <input
                  className="form-control mb-3 py-2 text-center"
                  type="text"
                  maxLength="6"
                  placeholder="Código de verificación"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
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
