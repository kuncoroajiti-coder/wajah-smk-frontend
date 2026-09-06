"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

type School = {
  id: number;
  npsn: string;
  name: string;
  education_type?: string | null;
  status?: string | null;
  province?: string | null;
  city?: string | null;
  district?: string | null;
  accreditation?: string | null;
  is_active: boolean;
  reviews_count?: number;
};

type Pagination = {
  current_page: number;
  last_page: number;
  total: number;
};

type FilterOptions = {
  provinces: string[];
  cities: string[];
  districts: string[];
  statuses: string[];
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [filters, setFilters] = useState<FilterOptions>({
    provinces: [],
    cities: [],
    districts: [],
    statuses: [],
  });

  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadSchools(1);
  }, [province, city, district, status]);

  async function loadFilterOptions(
    selectedProvince = "",
    selectedCity = ""
  ) {
    try {
      setFilterLoading(true);

      const params = new URLSearchParams({
        filter_options: "1",
      });

      if (selectedProvince) {
        params.set("province", selectedProvince);
      }

      if (selectedCity) {
        params.set("city", selectedCity);
      }

      const response = await fetch(
        `${API_URL}/schools?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Gagal memuat pilihan filter.");
      }

      const data = await response.json();

      setFilters({
        provinces: data.provinces || [],
        cities: data.cities || [],
        districts: data.districts || [],
        statuses: data.statuses || [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setFilterLoading(false);
    }
  }

  async function loadSchools(page = 1) {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        per_page: "12",
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (province) {
        params.set("province", province);
      }

      if (city) {
        params.set("city", city);
      }

      if (district) {
        params.set("district", district);
      }

      if (status) {
        params.set("status", status);
      }

      const response = await fetch(
        `${API_URL}/schools?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Gagal memuat data sekolah.");
      }

      const data = await response.json();

      setSchools(data.data || []);

      setPagination({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0,
      });
    } catch (err) {
      console.error(err);
      setError("Data sekolah tidak dapat dimuat. Silakan coba lagi.");
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    loadSchools(1);
  }

  function handleProvinceChange(value: string) {
    setProvince(value);
    setCity("");
    setDistrict("");

    loadFilterOptions(value, "");
  }

  function handleCityChange(value: string) {
    setCity(value);
    setDistrict("");

    loadFilterOptions(province, value);
  }

  function resetFilters() {
    setSearch("");
    setProvince("");
    setCity("");
    setDistrict("");
    setStatus("");

    loadFilterOptions("", "");
  }

  function goToPage(page: number) {
    if (page < 1 || page > pagination.last_page) {
      return;
    }

    loadSchools(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const hasFilters =
    search.trim() ||
    province ||
    city ||
    district ||
    status;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      {/* HEADER */}
      <Header />
      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100">
              Direktori Sekolah
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Temukan SMK yang Anda Cari
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
              Jelajahi profil sekolah, program keahlian, informasi peserta
              didik, serta ulasan dari pengguna Wajah SMK.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* FILTER PANEL */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form onSubmit={handleSearch}>
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Cari Sekolah
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Nama sekolah atau NPSN..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="submit"
                    aria-label="Cari sekolah"
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-blue-900 text-white transition hover:bg-blue-800"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-4-4" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Provinsi
                </label>

                <select
                  value={province}
                  onChange={(event) =>
                    handleProvinceChange(event.target.value)
                  }
                  disabled={filterLoading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="">Semua Provinsi</option>

                  {filters.provinces.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Kabupaten/Kota
                </label>

                <select
                  value={city}
                  onChange={(event) =>
                    handleCityChange(event.target.value)
                  }
                  disabled={!province || filterLoading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">Semua Kabupaten/Kota</option>

                  {filters.cities.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Kecamatan
                </label>

                <select
                  value={district}
                  onChange={(event) =>
                    setDistrict(event.target.value)
                  }
                  disabled={!city || filterLoading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">Semua Kecamatan</option>

                  {filters.districts.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  disabled={filterLoading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="">Semua Status</option>

                  {filters.statuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="text-sm text-slate-500">
                {loading
                  ? "Memuat data..."
                  : `${pagination.total.toLocaleString(
                      "id-ID"
                    )} sekolah ditemukan`}
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-blue-800"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SCHOOL LIST */}
        <div className="mt-8">
          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="h-2 bg-slate-200" />

                  <div className="animate-pulse p-5">
                    <div className="h-5 w-3/4 rounded bg-slate-200" />
                    <div className="mt-3 h-4 w-1/2 rounded bg-slate-200" />
                    <div className="mt-5 h-4 w-full rounded bg-slate-200" />
                    <div className="mt-2 h-4 w-4/5 rounded bg-slate-200" />
                    <div className="mt-6 h-9 w-28 rounded-lg bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : schools.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-7 w-7 text-slate-400"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-800">
                Sekolah tidak ditemukan
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Tidak ada sekolah yang sesuai dengan kata kunci atau
                filter yang dipilih.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {schools.map((school) => (
                  <article
                    key={school.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="h-2 bg-blue-900" />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="line-clamp-2 text-lg font-bold leading-6 text-slate-900">
                            {school.name}
                          </h2>

                          <p className="mt-1 text-xs font-medium text-slate-500">
                            NPSN {school.npsn}
                          </p>
                        </div>

                        {school.accreditation && (
                          <div className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 px-2 text-sm font-bold text-amber-700">
                            {school.accreditation}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 space-y-2.5">
                        {(school.city || school.province) && (
                          <div className="flex gap-2 text-sm text-slate-600">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              className="mt-0.5 h-4 w-4 shrink-0 text-blue-700"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
                              <circle cx="12" cy="9" r="2.2" />
                            </svg>

                            <span className="line-clamp-2">
                              {[
                                school.district,
                                school.city,
                                school.province,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </div>
                        )}

                        {school.education_type && (
                          <div className="flex gap-2 text-sm text-slate-600">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              className="mt-0.5 h-4 w-4 shrink-0 text-blue-700"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path d="M3 9.5 12 5l9 4.5L12 14 3 9.5Z" />
                              <path d="M6 11.5V16c3.5 2.5 8.5 2.5 12 0v-4.5" />
                              <path d="M21 10v5" />
                            </svg>

                            <span>
                              {school.education_type}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-4 w-4 shrink-0 text-blue-700"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path d="M4 19V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12" />
                            <path d="M3 19h18" />
                            <path d="M8 9h8M8 13h8M8 17h5" />
                          </svg>

                          <span>
                            {school.reviews_count || 0} ulasan
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            {school.status || "Sekolah"}
                          </span>
                        </div>

                        <Link
                          href={`/sekolah/${school.id}`}
                          className="rounded-lg bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-800 transition group-hover:bg-blue-900 group-hover:text-white"
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* PAGINATION */}
              {pagination.last_page > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      goToPage(pagination.current_page - 1)
                    }
                    disabled={pagination.current_page === 1}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>

                  {Array.from(
                    {
                      length: Math.min(
                        pagination.last_page,
                        7
                      ),
                    },
                    (_, index) => {
                      let page = index + 1;

                      if (pagination.last_page > 7) {
                        if (
                          pagination.current_page > 4 &&
                          pagination.current_page <
                            pagination.last_page - 3
                        ) {
                          page =
                            pagination.current_page - 3 + index;
                        } else if (
                          pagination.current_page >=
                          pagination.last_page - 3
                        ) {
                          page =
                            pagination.last_page - 6 + index;
                        }
                      }

                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => goToPage(page)}
                          className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition ${
                            pagination.current_page === page
                              ? "bg-blue-900 text-white"
                              : "border border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-800"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      goToPage(pagination.current_page + 1)
                    }
                    disabled={
                      pagination.current_page ===
                      pagination.last_page
                    }
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}