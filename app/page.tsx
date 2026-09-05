"use client";

import { useEffect, useState } from "react";

type School = {
  id: number;
  npsn: string;
  name: string;
  province: string | null;
  city: string | null;
  accreditation: string | null;
};

type SchoolResponse = {
  data: School[];
};

type User = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const STORAGE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL || "http://127.0.0.1:8000/storage";

export default function Home() {
  const [search, setSearch] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("wajah_smk_user");

      if (savedUser) {
        const parsedUser: User = JSON.parse(savedUser);

        if (parsedUser && parsedUser.email) {
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.error("Gagal membaca data pengguna:", error);
      setUser(null);
    } finally {
      setUserLoaded(true);
    }
  }, []);

  async function handleLogout() {
    const token = localStorage.getItem("wajah_smk_token");

    try {
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout API gagal:", error);
    } finally {
      localStorage.removeItem("wajah_smk_token");
      localStorage.removeItem("wajah_smk_user");
      setUser(null);
    }
  }

  async function handleSearch() {
    const keyword = search.trim();

    if (!keyword) {
      setSchools([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(
        `${API_URL}/schools?search=${encodeURIComponent(keyword)}`
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data sekolah.");
      }

      const result: SchoolResponse = await response.json();
      setSchools(result.data);
    } catch (error) {
      console.error(error);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="bg-[#082b5c] text-white">
        <div className="mx-auto flex min-h-[80px] max-w-7xl items-center justify-between gap-8 px-6 lg:px-8">
          {/* BRANDING */}
          <div className="shrink-0">
            <div className="text-2xl font-extrabold tracking-tight">
              WAJAH <span className="text-blue-300">SMK</span>
            </div>
            <div className="mt-0.5 whitespace-nowrap text-xs text-blue-200">
              Platform Informasi & Ulasan SMK Indonesia
            </div>
          </div>

          {/* NAVIGATION */}
          <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium xl:flex">
            <a
              href="#"
              className="shrink-0 border-b-2 border-blue-300 pb-1 text-white"
            >
              Beranda
            </a>

            <a
              href="/sekolah"
              className="shrink-0 text-blue-100 transition hover:text-white"
            >
              Sekolah
            </a>

            <a
              href="/ulasan/daftar"
              className="shrink-0 text-blue-100 transition hover:text-white"
            >
              Ulasan
            </a>

            <a
              href="#tentang"
              className="shrink-0 text-blue-100 transition hover:text-white"
            >
              Tentang
            </a>
          </nav>

          {/* ACCOUNT */}
          <div
            className="shrink-0 items-center justify-end gap-3"
            style={{
              display: userLoaded ? "flex" : "flex",
              visibility: "visible",
              opacity: 1,
            }}
          >
            {!userLoaded ? (
              <div className="h-10 w-10 shrink-0" />
            ) : user ? (
              <>
                {/* EMAIL AKUN */}
                <div
                  className="text-right"
                  style={{
                    display: "block",
                    visibility: "visible",
                  }}
                >
                  <div className="whitespace-nowrap text-sm font-bold leading-tight text-white">
                    {user.email}
                  </div>

                  <div className="mt-0.5 text-xs text-blue-200">
                    {user.role === "admin" ? "Administrator" : "Pengguna"}
                  </div>
                </div>

                {/* AVATAR */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-200 text-sm font-extrabold text-[#082b5c]"
                  style={{
                    display: "flex",
                    visibility: "visible",
                  }}
                  title={user.email}
                >
                  {user.email.charAt(0).toUpperCase()}
                </div>

                {/* KELUAR */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="shrink-0 rounded-lg border border-white/60 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="shrink-0 rounded-lg border border-white/60 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Masuk
                </a>

                <a
                  href="/register"
                  className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#082b5c] transition hover:bg-blue-50"
                >
                  Daftar
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0b3773] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(96,165,250,0.25),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-sm font-medium text-blue-100">
              Informasi SMK Indonesia
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Kenali Sekolahnya.
              <br />
              <span className="text-blue-300">Bagikan Wajahnya.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100">
              Temukan informasi sekolah menengah kejuruan di Indonesia,
              lihat profil dan kompetensinya, serta bagikan pengalaman Anda
              melalui ulasan yang bermanfaat.
            </p>

            {user && (
              <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-blue-300/40 bg-blue-400/10 px-4 py-3 text-sm text-blue-50">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-200 font-bold text-[#082b5c]">
                  {user.email.charAt(0).toUpperCase()}
                </div>

                <span>
                  Anda masuk sebagai{" "}
                  <strong className="text-white">{user.email}</strong>
                </span>
              </div>
            )}

            <div className="mt-10 max-w-2xl">
              <label
                htmlFor="school-search"
                className="mb-3 block text-sm font-semibold text-blue-100"
              >
                Cari sekolah
              </label>

              <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-2xl sm:flex-row">
                <input
                  id="school-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="Nama sekolah atau NPSN..."
                  className="min-w-0 flex-1 rounded-xl px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={loading}
                  className="rounded-xl bg-[#f59e0b] px-7 py-3 font-bold text-white transition hover:bg-[#d97706] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Mencari..." : "Cari Sekolah"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH RESULTS */}
      {searched && (
        <section id="sekolah" className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Hasil pencarian
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-[#082b5c]">
                Sekolah untuk &ldquo;{search}&rdquo;
              </h2>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                Mengambil data sekolah...
              </div>
            ) : schools.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                Sekolah tidak ditemukan.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {schools.map((school) => (
                  <article
                    key={school.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#082b5c]">
                          {school.name.trim()}
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                          {school.city ?? "-"}, {school.province ?? "-"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          NPSN: {school.npsn}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-lg bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                        {school.accreditation ?? "-"}
                      </span>
                    </div>

                    <a
                      href={`/sekolah/${school.id}`}
                      className="mt-6 inline-block text-sm font-bold text-blue-700 hover:text-blue-900"
                    >
                      Lihat profil →
                    </a>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* STATISTICS */}
      <section
        id="ulasan"
        className="border-b border-slate-200 bg-white"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-6 py-8 text-center">
            <div className="text-3xl font-extrabold text-[#082b5c]">
              14.128
            </div>

            <div className="mt-1 text-sm text-slate-500">
              Sekolah terdata
            </div>
          </div>

          <div className="px-6 py-8 text-center">
            <div className="text-3xl font-extrabold text-[#082b5c]">
              85.732
            </div>

            <div className="mt-1 text-sm text-slate-500">
              Data kompetensi
            </div>
          </div>

          <div className="px-6 py-8 text-center">
            <div className="text-3xl font-extrabold text-[#082b5c]">
              Indonesia
            </div>

            <div className="mt-1 text-sm text-slate-500">
              Cakupan nasional
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="tentang" className="bg-[#082b5c] text-slate-300">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="flex min-w-0 flex-col gap-6 md:flex-row md:items-center">
            {/* FOOTER BRAND */}
            <div className="min-w-0 flex-1 md:pr-8">
              <div className="text-2xl font-extrabold tracking-tight text-white">
                WAJAH <span className="text-blue-300">SMK</span>
              </div>

              <div className="mt-0.5 whitespace-nowrap text-xs text-blue-200">
                Platform Informasi & Ulasan SMK Indonesia
              </div>
            </div>

            {/* DEVELOPER */}
            <div className="flex shrink-0 items-center justify-center border-y border-white/15 py-5 md:border-y-0 md:border-x md:px-10">
              <div className="flex items-center gap-3 whitespace-nowrap">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="13"
                    rx="2"
                    stroke="white"
                    strokeWidth="1.5"
                  />

                  <path
                    d="M8 21H16"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />

                  <path
                    d="M12 17V21"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />

                  <path
                    d="M8 9L10.5 11L8 13"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M13 13H16"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>

                <span className="text-sm font-semibold text-white">
                  kuncoroaji, BBPPMPV BOE
                </span>
              </div>
            </div>

            {/* COPYRIGHT */}
            <div className="min-w-0 flex-1 md:pl-8 md:text-right">
              <div className="whitespace-nowrap text-sm text-slate-400">
                © 2026 Wajah SMK. Semua hak dilindungi.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
