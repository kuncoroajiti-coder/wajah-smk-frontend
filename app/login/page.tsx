"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function LoginPage() {
  const router = useRouter();

  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nip: nip.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const validationMessage =
          data?.errors?.nip?.[0] ||
          data?.errors?.password?.[0] ||
          data?.message ||
          "NIP atau password tidak benar.";

        setMessage(validationMessage);
        return;
      }

      localStorage.setItem("wajah_smk_token", data.token);
      localStorage.setItem(
        "wajah_smk_user",
        JSON.stringify(data.user)
      );

      if (data.user?.must_change_password) {
        router.replace("/change-password");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const requestedRedirect = params.get("redirect");

      const redirect =
        requestedRedirect &&
        requestedRedirect.startsWith("/") &&
        !requestedRedirect.startsWith("//")
          ? requestedRedirect
          : "/";

      router.replace(redirect);
    } catch (error) {
      console.error(error);

      setMessage(
        "Tidak dapat terhubung ke server Wajah SMK."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="px-6 py-12">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Masuk ke Wajah SMK
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Gunakan NIP dan password akun pegawai Anda.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="nip"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  NIP
                </label>

                <input
                  id="nip"
                  type="text"
                  inputMode="numeric"
                  value={nip}
                  onChange={(event) => setNip(event.target.value)}
                  placeholder="Masukkan NIP"
                  autoComplete="username"
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
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-600 hover:text-blue-950"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
