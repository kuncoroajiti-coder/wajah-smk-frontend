"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(API_URL + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Email atau password tidak benar."
        );
        return;
      }

      localStorage.setItem("wajah_smk_token", data.token);
      localStorage.setItem(
        "wajah_smk_user",
        JSON.stringify(data.user)
      );

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");

      if (redirect) {
        router.replace(redirect);
      } else {
        router.replace("/");
      }
    } catch (error) {
      console.error(error);
      setMessage(
        "Tidak dapat terhubung ke server Laravel."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-md">

        <div className="mb-8 text-center">
          <a
            href="/"
            className="text-3xl font-extrabold text-[#123b7a]"
          >
            Wajah SMK
          </a>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Masuk ke Wajah SMK
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Masuk untuk memberikan ulasan sekolah.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@email.com"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-[#123b7a] focus:ring-2 focus:ring-[#123b7a]/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-[#123b7a] focus:ring-2 focus:ring-[#123b7a]/20"
              />
            </div>

            {message && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
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
              {loading ? "Memproses..." : "Masuk"}
            </button>

          </form>

          <div className="mt-6 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
            Belum memiliki akun?{" "}
            <a
              href="/register"
              className="font-bold text-[#123b7a] hover:underline"
            >
              Daftar sekarang
            </a>
          </div>

        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm font-semibold text-slate-600 hover:text-[#123b7a]"
          >
            ← Kembali ke Beranda
          </a>
        </div>

      </div>
    </main>
  );
}
