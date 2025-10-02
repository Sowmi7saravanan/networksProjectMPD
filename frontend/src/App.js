import React, { useState } from 'react';
import Login from './pages/Login';
import QuizPage from './pages/QuizPage';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [name, setName] = useState(localStorage.getItem('name'));

  function onLogin({ token, userId, name }) {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('name', name);
    setToken(token);
    setUserId(userId);
    setName(name);
  }

  if (!token) {
    return <Login onLogin={onLogin} />;
  }

  return <QuizPage token={token} userId={userId} name={name} />;
}
