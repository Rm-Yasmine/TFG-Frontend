import React, { useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { data } = await API.post('/login', form);
      localStorage.setItem('token', data.data.token);
      navigate('/');
    } catch (err) {
      alert('Credenciales inválidas');
    }
  };

  return (
    <div className="login-page container-fluid d-flex align-items-center justify-content-center vh-100">
      <div className="login-card row shadow rounded-4 overflow-hidden">
        
        <div className="col-md-6 p-5 bg-light d-flex flex-column justify-content-center">
          <h2 className="fw-bold mb-4 text-center">Iniciar sesión</h2>
          <form onSubmit={handleSubmit}>
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
            <button className="btn btn-primary w-100 py-2">ENTRAR</button>
          </form>
          
          <p className="mt-3 text-center">
            ¿Olvidaste tu contraseña?{' '}
            <span
              className="text-decoration-none text-primary fw-semibold"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/resetpass')}
            >
              Restablecer contraseña
            </span>
          </p>
        </div>

        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center gradient-bg text-white text-center p-5">
          <h3 className="fw-bold mb-3">¡Hola, bienvenida!</h3>
          <p className="mb-4 small">
           ¿Aún no tienes cuenta? <br />
            Regístrate para comenzar tu proyecto.
          </p>
          <button
            className="btn btn-light px-4 fw-semibold"
            onClick={() => navigate('/register')}
          >
            REGISTRARSE
          </button>
        </div>
      </div>
    </div>
  );
}
