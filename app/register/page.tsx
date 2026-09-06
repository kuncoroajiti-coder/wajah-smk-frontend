"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="px-6 py-16">
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              🔒
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Registrasi Tidak Tersedia
            </h1>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              Akses Wajah SMK diperuntukkan bagi pegawai yang telah terdaftar
              dalam daftar pegawai BBPPMPV BOE.
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Jika Anda merupakan pegawai yang berhak mengakses Wajah SMK tetapi
              belum dapat masuk, silakan hubungi Super Admin.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/login"
                className="rounded-xl bg-[#123b7a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0d2f63]"
              >
                Masuk ke Wajah SMK
              </Link>

              <Link
                href="/"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
