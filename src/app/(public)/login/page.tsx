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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
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
          background: #181818;
        }
        .login-box {
          background: #23232b;
          border-radius: 18px;
          box-shadow: 0 8px 40px 0 rgba(0,0,0,0.55), 0 1.5px 8px 0 rgba(0,0,0,0.22);
          padding: 2.2rem 2.2rem 1.7rem 2.2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 370px;
          aspect-ratio: 370/420;
          justify-content: center;
        }
        .login-box h1 {
          margin-bottom: 2rem;
          font-size: 2rem;
          font-weight: 700;
          color: #f4f4f4;
        }
        .login-input {
          width: 100%;
          padding: 0.75em 1em;
          margin-bottom: 1.2em;
          border-radius: 8px;
          border: 1px solid #39394a;
          font-size: 1.1em;
          background: #23232b;
          color: #f4f4f4;
        }
        .login-actions {
          display: flex;
          gap: 1em;
          width: 100%;
          margin-bottom: 1em;
        }
        .login-btn, .create-btn {
          flex: 1;
          padding: 0.7em 0;
          border: none;
          border-radius: 8px;
          font-size: 1.1em;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .login-btn {
          background: #e60023;
          color: #fff;
          box-shadow: 0 2px 8px rgba(230,0,35,0.10);
        }
        .login-btn:disabled, .create-btn:disabled {
          background: #39394a;
          color: #888;
          cursor: not-allowed;
        }
        .create-btn {
          background: #23232b;
          color: #f4f4f4;
          border: 1.5px solid #39394a;
        }
        .login-error {
          color: #e60023;
          margin-top: 0.5em;
          font-size: 1em;
          text-align: center;
        }
        @media (max-width: 600px) {
          .login-box {
            width: 92vw;
            max-width: 340px;
            padding: 1.2rem 1rem 1rem 1rem;
          }
        }
        @media (max-width: 400px) {
          .login-box {
            width: 90vw;
            max-width: 90vw;
            padding: 0.7rem 0.3rem 0.7rem 0.3rem;
            border-radius: 10px;
          }
        }
        @media (min-width: 800px) 
          .login-box {
            width: 60vw;
            max-width: 62vw;
          }
        }
        
      `}</style>
    </main>
  );
}
