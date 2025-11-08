import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const { data } = await API.get('/me');
      setUser(data.data);
    } catch {
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="container mt-5">
      {user ? (
        <>
          <h3>Welcome, {user.name}</h3>
          <p>Email: {user.email}</p>
          <button
            className="btn btn-danger"
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
