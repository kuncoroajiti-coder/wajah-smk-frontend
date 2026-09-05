"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Nama wajib diisi.");
      return;
    }

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (data?.errors) {
          const firstError = Object.values(data.errors)
            .flat()
            .find(
              (message) =>
                typeof message === "string"
            );

          setError(
            typeof firstError === "string"
              ? firstError
              : data?.message || "Registrasi gagal."
          );
        } else {
          setError(
            data?.message || "Registrasi gagal."
          );
        }

        return;
      }

      setSuccess(
        "Registrasi berhasil. Anda akan diarahkan ke halaman login."
      );

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch {
      setError(
        "Tidak dapat terhubung ke server. Pastikan backend Laravel sedang berjalan."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      {/* HEADER */}
      <header className="register-header">
        <div className="register-header-inner">
          <a href="/" className="brand">
            WAJAH SMK
          </a>

          <a href="/login" className="login-button">
            Masuk
          </a>
        </div>
      </header>

      {/* CONTENT */}
      <section className="register-content">
        <div className="register-wrapper">
          <div className="register-heading">
            <div className="eyebrow">
              AKUN PENGGUNA
            </div>

            <h1>Buat Akun</h1>

            <p>
              Daftarkan diri untuk memberikan ulasan sekolah.
            </p>
          </div>

          <div className="register-card">
            {error && (
              <div className="message error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="message success-message">
                {success}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="register-form"
            >
              {/* NAMA */}
              <div className="field">
                <label htmlFor="name">
                  Nama
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                  autoComplete="name"
                  placeholder="Masukkan nama"
                />
              </div>

              {/* EMAIL */}
              <div className="field">
                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                  autoComplete="email"
                  placeholder="nama@email.com"
                />
              </div>

              {/* PASSWORD */}
              <div className="field">
                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Minimal 8 karakter"
                />
              </div>

              {/* KONFIRMASI PASSWORD */}
              <div className="field">
                <label htmlFor="password_confirmation">
                  Konfirmasi Password
                </label>

                <input
                  id="password_confirmation"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(event) =>
                    setPasswordConfirmation(
                      event.target.value
                    )
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Ulangi password"
                />
              </div>

              {/* DAFTAR */}
              <button
                type="submit"
                disabled={loading}
                className="register-button"
              >
                {loading
                  ? "Mendaftarkan..."
                  : "Daftar"}
              </button>
            </form>

            <div className="login-link">
              Sudah memiliki akun?{" "}
              <a href="/login">
                Masuk di sini
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CSS */}
      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .register-page {
          min-height: 100vh;
          background: #f1f5f9;
          color: #102a43;
        }

        /* HEADER */

        .register-header {
          width: 100%;
          background: #082b5c;
          color: #ffffff;
        }

        .register-header-inner {
          width: 100%;
          max-width: 1280px;
          min-height: 80px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand {
          color: #ffffff;
          font-size: 25px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.5px;
          text-decoration: none;
        }

        .login-button {
          min-height: 40px;
          padding: 0 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #ffffff;
          border-radius: 9px;
          background: transparent;
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
        }

        .login-button:hover {
          background: #ffffff;
          color: #082b5c;
        }

        /* CONTENT */

        .register-content {
          min-height: calc(100vh - 80px);
          padding: 48px 24px 64px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }

        .register-wrapper {
          width: 100%;
          max-width: 454px;
        }

        .register-heading {
          margin-bottom: 30px;
          text-align: center;
        }

        .eyebrow {
          margin-bottom: 9px;
          color: #2563eb;
          font-size: 14px;
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .register-heading h1 {
          margin: 0;
          color: #102a43;
          font-size: 32px;
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .register-heading p {
          margin: 9px 0 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
        }

        /* CARD */

        .register-card {
          width: 100%;
          padding: 30px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          box-shadow:
            0 4px 12px rgba(15, 39, 71, 0.08);
        }

        /* MESSAGES */

        .message {
          margin-bottom: 20px;
          padding: 12px 14px;
          border-radius: 9px;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 600;
        }

        .error-message {
          border: 1px solid #fca5a5;
          background: #fef2f2;
          color: #991b1b;
        }

        .success-message {
          border: 1px solid #86efac;
          background: #f0fdf4;
          color: #166534;
        }

        /* FORM */

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field label {
          color: #334155;
          font-size: 14px;
          font-weight: 700;
        }

        .field input {
          width: 100%;
          min-height: 46px;
          padding: 0 15px;
          border: 1px solid #cbd5e1;
          border-radius: 9px;
          background: #ffffff;
          color: #1e293b;
          font-family: inherit;
          font-size: 14px;
          outline: none;
        }

        .field input::placeholder {
          color: #94a3b8;
        }

        .field input:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        /* REGISTER BUTTON */

        .register-button {
          width: 100%;
          min-height: 46px;
          margin-top: 2px;
          padding: 0 20px;
          border: 2px solid #155eab;
          border-radius: 9px;
          background: #155eab;
          color: #ffffff;
          font-family: inherit;
          font-size: 14px;
          font-weight: 800;
          line-height: 1;
          cursor: pointer;
          box-shadow:
            0 2px 4px rgba(21, 94, 171, 0.2);
          appearance: none;
          -webkit-appearance: none;
        }

        .register-button:hover:not(:disabled) {
          background: #104b8a;
          border-color: #104b8a;
        }

        .register-button:disabled {
          background: #64748b;
          border-color: #64748b;
          color: #ffffff;
          cursor: not-allowed;
        }

        /* LOGIN LINK */

        .login-link {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          text-align: center;
          font-size: 14px;
        }

        .login-link a {
          color: #2563eb;
          font-weight: 800;
          text-decoration: none;
        }

        .login-link a:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        /* MOBILE */

        @media (max-width: 600px) {
          .register-header-inner {
            padding: 0 20px;
          }

          .register-content {
            padding: 36px 20px 48px;
          }

          .register-card {
            padding: 24px;
          }

          .register-heading h1 {
            font-size: 29px;
          }
        }
      `}</style>
    </main>
  );
}