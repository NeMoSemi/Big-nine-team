import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError('Введите email и пароль');
      return;
    }
    // Заглушка: принимаем любой логин
    localStorage.setItem('auth', 'true');
    navigate('/tickets');
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">ЭРИС</div>
        <h1 className="login-title">Техническая поддержка</h1>
        <p className="login-subtitle">Войдите в систему обработки заявок</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="operator@eris.ru"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div className="login-field">
            <label>Пароль</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn">Войти</button>
        </form>
      </div>
    </div>
  );
}
