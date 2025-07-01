"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (action: 'login' | 'create') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        router.push(`/albums/${encodeURIComponent(name)}`);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-main">
      <div className="login-box">
        <h1>Photo Album Login</h1>
        <input
          type="text"
          placeholder="Album Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="login-input"
          autoFocus
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="login-input"
        />
        <div className="login-actions">
          <button
            className="login-btn"
            onClick={() => handleAuth('login')}
            disabled={loading}
          >
            Login
          </button>
          <button
            className="create-btn"
            onClick={() => handleAuth('create')}
            disabled={loading}
          >
            Create Album
          </button>
        </div>
        {error && <div className="login-error">{error}</div>}
      </div>
      <style jsx>{`
        .login-main {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7f7fa;
        }
        .login-box {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.10);
          padding: 2.5rem 2.5rem 2rem 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 320px;
        }
        .login-box h1 {
          margin-bottom: 2rem;
          font-size: 2rem;
          font-weight: 700;
          color: #222;
        }
        .login-input {
          width: 100%;
          padding: 0.75rem 1rem;
          margin-bottom: 1.2rem;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-size: 1.1rem;
          background: #fafbfc;
        }
        .login-actions {
          display: flex;
          gap: 1rem;
          width: 100%;
          margin-bottom: 1rem;
        }
        .login-btn, .create-btn {
          flex: 1;
          padding: 0.7rem 0;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .login-btn {
          background: #222;
          color: #fff;
        }
        .login-btn:disabled, .create-btn:disabled {
          background: #aaa;
          cursor: not-allowed;
        }
        .create-btn {
          background: #f3f3f3;
          color: #222;
        }
        .login-error {
          color: #c00;
          margin-top: 0.5rem;
          font-size: 1rem;
          text-align: center;
        }
      `}</style>
    </main>
  );
}
