"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("wajah_smk_token");

    if (!token) {
      router.replace("/login?redirect=/change-password");
      return;
    }

    setReady(true);
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (password.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Konfirmasi password baru tidak sama.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("wajah_smk_token");

      if (!token) {
        router.replace("/login?redirect=/change-password");
        return;
      }

      const response = await fetch(`${API_URL}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const validationMessage =
          data?.errors?.current_password?.[0] ||
          data?.errors?.password?.[0] ||
          data?.message ||
          "Password gagal diubah.";

        setError(validationMessage);
        return;
      }

      if (data?.user) {
        localStorage.setItem(
          "wajah_smk_user",
          JSON.stringify(data.user)
        );
      }

      setMessage("Password berhasil diubah. Mengarahkan ke Beranda...");

      const params = new URLSearchParams(window.location.search);
      const requestedRedirect = params.get("redirect");

      const redirect =
        requestedRedirect &&
        requestedRedirect.startsWith("/") &&
        !requestedRedirect.startsWith("//") &&
        requestedRedirect !== "/change-password"
          ? requestedRedirect
          : "/";

      setTimeout(() => {
        router.replace(redirect);
      }, 700);
    } catch (error) {
      console.error(error);
      setError("Tidak dapat terhubung ke server Wajah SMK.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />

        <main className="flex min-h-[60vh] items-center justify-center px-6">
          <p className="text-sm text-slate-600">
            Memeriksa sesi...
          </p>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="px-6 py-12">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Ganti Password
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Untuk keamanan akun, Anda wajib mengganti password awal
              sebelum menggunakan Wajah SMK.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="current-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password Saat Ini
                </label>

                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(event.target.value)
                  }
                  placeholder="Masukkan password saat ini"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-[#123b7a] focus:ring-2 focus:ring-[#123b7a]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password Baru
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-[#123b7a] focus:ring-2 focus:ring-[#123b7a]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="password-confirmation"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Konfirmasi Password Baru
                </label>

                <input
                  id="password-confirmation"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(event) =>
                    setPasswordConfirmation(event.target.value)
                  }
                  placeholder="Ulangi password baru"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-[#123b7a] focus:ring-2 focus:ring-[#123b7a]/20"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "block",
                  width: "100%",
                  minHeight: "50px",
                  backgroundColor: "#123b7a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 20px",
                  fontWeight: 700,
                  fontSize: "16px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Menyimpan..." : "Simpan Password Baru"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
