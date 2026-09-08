"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

type School = {
  id: number;
  npsn: string;
  name: string;
  province: string | null;
  city: string | null;
  accreditation: string | null;
};

type NearbySchool = School & {
  district: string | null;
  village: string | null;
  latitude: string | number;
  longitude: string | number;
  distance_km: number;
};

type SchoolResponse = {
  data: School[];
};

type NearbySchoolResponse = {
  user_location: {
    latitude: number;
    longitude: number;
  };
  radius_km: number;
  data: NearbySchool[];
  total: number;
};

type User = {
  id: number;
  name: string;
  nip: string;
  role: "pegawai_boe" | "manajemen" | "super_admin";
  status: "aktif" | "nonaktif";
  must_change_password: boolean;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const NearbySchoolMap = dynamic(
  () => import("@/components/NearbySchoolMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-sm text-slate-500">
        Memuat peta...
      </div>
    ),
  }
);

export default function Home() {
  const [search, setSearch] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [nearbySchools, setNearbySchools] = useState<NearbySchool[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbySearched, setNearbySearched] = useState(false);
  const [nearbyError, setNearbyError] = useState("");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("wajah_smk_user");

      if (savedUser) {
        const parsedUser: User = JSON.parse(savedUser);

        if (parsedUser && parsedUser.nip && parsedUser.status === "aktif") {
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.error("Gagal membaca data pengguna:", error);
      setUser(null);
    }
  }, []);

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

  function formatDistance(distance: number) {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }

    return `${distance.toFixed(1).replace(".", ",")} km`;
  }

  function handleNearbySearch() {
    if (!navigator.geolocation) {
      setNearbyError(
        "Browser Anda tidak mendukung layanan lokasi. Silakan gunakan pencarian nama sekolah atau NPSN."
      );
      setNearbySearched(true);
      return;
    }

    setNearbyLoading(true);
    setNearbySearched(true);
    setNearbyError("");
    setNearbySchools([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setUserLocation({
          latitude,
          longitude,
        });

        try {
          const response = await fetch(
            `${API_URL}/schools/nearby?latitude=${latitude}&longitude=${longitude}&radius=25&limit=6`
          );

          if (!response.ok) {
            throw new Error("Gagal mengambil sekolah terdekat.");
          }

          const result: NearbySchoolResponse = await response.json();

          setNearbySchools(result.data);

          if (result.data.length === 0) {
            setNearbyError(
              "Belum ditemukan SMK dalam radius 25 km dari lokasi Anda."
            );
          }
        } catch (error) {
          console.error(error);
          setNearbySchools([]);
          setNearbyError(
            "Pencarian SMK terdekat gagal. Silakan coba lagi beberapa saat."
          );
        } finally {
          setNearbyLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);

        let message =
          "Lokasi Anda tidak dapat diperoleh. Silakan coba lagi.";

        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Akses lokasi ditolak. Izinkan akses lokasi pada browser untuk mencari SMK di sekitar Anda.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message =
            "Lokasi Anda sedang tidak tersedia. Pastikan layanan lokasi perangkat aktif.";
        } else if (error.code === error.TIMEOUT) {
          message =
            "Permintaan lokasi terlalu lama. Silakan coba lagi.";
        }

        setNearbyError(message);
        setNearbySchools([]);
        setNearbyLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0b3773] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(96,165,250,0.25),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex max-w-full rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-sm font-medium text-blue-100">
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
              <div className="mt-6 inline-flex max-w-full items-center gap-3 rounded-xl border border-blue-300/40 bg-blue-400/10 px-4 py-3 text-sm text-blue-50">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-200 font-bold text-[#082b5c]">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <span className="min-w-0 break-words">
                  Anda masuk sebagai{" "}
                  <strong className="break-words text-white">
                    {user.name}
                  </strong>
                </span>
              </div>
            )}

            {/* SEARCH BY SCHOOL */}
            <div className="mt-10 max-w-2xl">
              <label
                htmlFor="school-search"
                className="mb-3 block text-sm font-semibold text-blue-100"
              >
                Cari sekolah berdasarkan nama atau NPSN
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
                  className="shrink-0 rounded-xl bg-[#f59e0b] px-7 py-3 font-bold text-white transition hover:bg-[#d97706] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Mencari..." : "Cari Sekolah"}
                </button>
              </div>
            </div>

            {/* SEARCH NEARBY */}
            <div className="mt-5 max-w-2xl rounded-2xl border border-blue-300/30 bg-white/10 p-4 backdrop-blur-sm sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-base font-bold text-white">
                    Cari SMK di sekitar saya
                  </p>

                  <p className="mt-1 text-sm leading-6 text-blue-100">
                    Temukan SMK terdekat berdasarkan lokasi perangkat Anda,
                    dalam radius hingga 25 km.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNearbySearch}
                  disabled={nearbyLoading}
                  className="shrink-0 rounded-xl border border-white/30 bg-white px-5 py-3 text-sm font-bold text-[#0b3773] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {nearbyLoading ? "Mencari lokasi..." : "Gunakan lokasi saya"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEARBY RESULTS */}
      {nearbySearched && (
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Pencarian berdasarkan lokasi
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-[#082b5c] sm:text-3xl">
                SMK di sekitar Anda
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Menampilkan sekolah terdekat dalam radius 25 km.
              </p>
            </div>

            {nearbyLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                Mencari lokasi Anda dan sekolah terdekat...
              </div>
            ) : nearbyError ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800">
                <p>{nearbyError}</p>

                <button
                  type="button"
                  onClick={handleNearbySearch}
                  className="mt-4 rounded-xl bg-[#0b3773] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#082b5c]"
                >
                  Coba lagi
                </button>
              </div>
            ) : nearbySchools.length > 0 ? (
              <>
                <div className="mb-8">
                  {userLocation && (
                    <NearbySchoolMap
                      latitude={userLocation.latitude}
                      longitude={userLocation.longitude}
                      schools={nearbySchools}
                      radiusKm={25}
                    />
                  )}
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {nearbySchools.map((school) => (
                  <article
                    key={school.id}
                    className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="break-words font-bold text-[#082b5c]">
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

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <span className="text-sm font-bold text-slate-700">
                        {formatDistance(Number(school.distance_km))}
                      </span>

                      <Link
                        href={`/sekolah/${school.id}`}
                        className="text-sm font-bold text-blue-700 hover:text-blue-900"
                      >
                        Lihat profil →
                      </Link>
                    </div>
                  </article>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </section>
      )}

      {/* SEARCH RESULTS */}
      {searched && (
        <section id="sekolah" className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Hasil pencarian
              </p>

              <h2 className="mt-2 break-words text-2xl font-extrabold text-[#082b5c]">
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
                    className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="break-words font-bold text-[#082b5c]">
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

                    <Link
                      href={`/sekolah/${school.id}`}
                      className="mt-6 inline-block text-sm font-bold text-blue-700 hover:text-blue-900"
                    >
                      Lihat profil →
                    </Link>
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

      <Footer />
    </main>
  );
}
