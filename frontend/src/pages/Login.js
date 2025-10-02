import React, { useState } from 'react';
import { postJson } from '../api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState('login'); // "login" or "register"
  const [loading, setLoading] = useState(false);

  async function doLogin() {
    if (!email || !password) return alert("Please enter email and password");

    setLoading(true);
    const res = await postJson('/api/auth/login', { email, password });
    setLoading(false);

    if (res.token) {
      onLogin({ token: res.token, userId: res.userId, name: res.name });
    } else {
      alert(res.error || 'Login failed');
    }
  }

  async function doRegister() {
    if (!name || !email || !password) return alert("Please fill all fields");

    setLoading(true);
    const res = await postJson('/api/auth/register', { name, email, password });
    setLoading(false);

    if (res.token) {
      onLogin({ token: res.token, userId: res.userId, name: res.name });
    } else {
      alert(res.error || 'Registration failed');
    }
  }

  return (
    <div className="centered">
      <h2>{mode === 'login' ? 'Candidate Login' : 'Register New Account'}</h2>

      {mode === 'register' && (
        <input
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      )}

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      {mode === 'login' ? (
        <button onClick={doLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login & Start Test"}
        </button>
      ) : (
        <button onClick={doRegister} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      )}

      <p className="muted">
        {mode === 'login' ? (
          <>
            Don’t have an account?{' '}
            <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => setMode('register')}>
              Register here
            </span>
          </>
        ) : (
          <>
            Already registered?{' '}
            <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => setMode('login')}>
              Login here
            </span>
          </>
        )}
      </p>
    </div>
  );
}
