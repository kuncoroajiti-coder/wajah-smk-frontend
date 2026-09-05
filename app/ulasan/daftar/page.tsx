"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "http://127.0.0.1:8000/storage";

import Link from "next/link";
import { useEffect, useState } from "react";

type School = {
  id: number;
  npsn: string;
  name: string;
  province: string;
  city: string;
  district: string;
};

type ReviewPhoto = {
  id: number;
  path: string;
  caption: string | null;
  sort_order: number;
};

type Review = {
  id: number;
  rating: number;
  title: string | null;
  content: string;
  published_at: string | null;
  created_at: string;
  school: School;
  photos: ReviewPhoto[];
};

type Pagination = {
  current_page: number;
  last_page: number;
  total: number;
};

export default function DaftarUlasanPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const fetchReviews = async (selectedPage = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        per_page: "12",
        page: String(selectedPage),
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (rating) {
        params.set("rating", rating);
      }

      const response = await fetch(
        `${API_URL}/reviews?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data ulasan.");
      }

      const data = await response.json();

      setReviews(data.data ?? []);
      setPagination({
        current_page: data.current_page ?? 1,
        last_page: data.last_page ?? 1,
        total: data.total ?? 0,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data ulasan."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchReviews(1);
  };

  const handleReset = () => {
    setSearch("");
    setRating("");
    setPage(1);

    setTimeout(() => {
      fetchReviews(1);
    }, 0);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900 text-lg font-black text-white">
              W
            </div>

            <div>
              <div className="text-xl font-black tracking-tight text-blue-900">
                WAJAH SMK
              </div>
              <div className="text-[10px] font-semibold tracking-wide text-slate-500">
                Wadah Aspirasi & Jaringan SMK
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <Link href="/" className="transition hover:text-blue-700">
              Beranda
            </Link>

            <Link href="/sekolah" className="transition hover:text-blue-700">
              Sekolah
            </Link>

            <Link href="/ulasan/daftar" className="font-bold text-blue-700">
              Ulasan
            </Link>

            <Link href="/tentang" className="transition hover:text-blue-700">
              Tentang
            </Link>

            <Link
              href="/ulasan"
              className="rounded-lg bg-blue-700 px-4 py-2 text-white transition hover:bg-blue-800"
            >
              Beri Ulasan
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-blue-900">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-200">
              Wajah SMK
            </p>

            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Ulasan Sekolah
            </h1>

            <p className="mt-4 text-base leading-7 text-blue-100">
              Temukan pengalaman dan penilaian masyarakat terhadap sekolah
              menengah kejuruan di Indonesia.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* FILTER */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_180px_auto_auto]">
            <div>
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Cari ulasan
              </label>

              <input
                id="search"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Cari sekolah, NPSN, judul, atau isi ulasan..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="rating"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Rating
              </label>

              <select
                id="rating"
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Semua rating</option>
                <option value="5">★★★★★ 5</option>
                <option value="4">★★★★☆ 4</option>
                <option value="3">★★★☆☆ 3</option>
                <option value="2">★★☆☆☆ 2</option>
                <option value="1">★☆☆☆☆ 1</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="self-end rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              Cari
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="self-end rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Ulasan Terbaru
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {pagination
                ? `${pagination.total} ulasan tersedia`
                : "Memuat data..."}
            </p>
          </div>

          <Link
            href="/ulasan"
            className="hidden rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100 sm:block"
          >
            + Beri Ulasan
          </Link>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />
            <p className="text-sm font-semibold text-slate-500">
              Memuat ulasan...
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && reviews.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
              🔎
            </div>

            <h3 className="text-lg font-black text-slate-900">
              Ulasan tidak ditemukan
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Coba gunakan kata kunci atau filter rating yang berbeda.
            </p>
          </div>
        )}

        {/* REVIEW GRID */}
        {!loading && !error && reviews.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="p-5">
                  <div className="mb-4">
                    <Link
                      href={`/sekolah/${review.school.id}`}
                      className="text-base font-black leading-6 text-blue-900 transition hover:text-blue-700"
                    >
                      {review.school.name}
                    </Link>

                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      NPSN {review.school.npsn}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {review.school.city} • {review.school.province}
                    </p>
                  </div>

                  <div className="mb-3 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className="text-xl leading-none"
                        style={{
                          color:
                            star <= review.rating ? "#f5b800" : "#cbd5e1",
                        }}
                      >
                        ★
                      </span>
                    ))}

                    <span className="ml-2 text-sm font-bold text-slate-700">
                      {review.rating}/5
                    </span>
                  </div>

                  {review.title && (
                    <h3 className="mb-2 line-clamp-2 text-base font-black text-slate-900">
                      {review.title}
                    </h3>
                  )}

                  <p className="line-clamp-4 text-sm leading-6 text-slate-600">
                    {review.content}
                  </p>

                  {review.photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {review.photos
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .slice(0, 4)
                        .map((photo) => (
                          <img
                            key={photo.id}
                            src={`${STORAGE_URL}/${photo.path}`}
                            alt={photo.caption || "Foto ulasan"}
                            className="h-16 w-full rounded-lg object-cover"
                          />
                        ))}
                    </div>
                  )}

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">
                        {formatDate(review.published_at || review.created_at)}
                      </span>

                      <Link
                        href={`/ulasan/${review.id}`}
                        className="text-sm font-bold text-blue-600 transition hover:text-blue-800"
                      >
                        Lihat Detail →
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {!loading &&
          !error &&
          pagination &&
          pagination.last_page > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={pagination.current_page <= 1}
                onClick={() => setPage(pagination.current_page - 1)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Sebelumnya
              </button>

              <div className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white">
                {pagination.current_page} / {pagination.last_page}
              </div>

              <button
                type="button"
                disabled={
                  pagination.current_page >= pagination.last_page
                }
                onClick={() => setPage(pagination.current_page + 1)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Berikutnya →
              </button>
            </div>
          )}
      </section>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-blue-800 bg-blue-950">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-3 md:items-center">
          <div>
            <div className="text-xl font-black tracking-tight text-white">
              WAJAH SMK
            </div>
            <div className="mt-1 text-xs font-semibold text-blue-200">
              Wadah Aspirasi & Jaringan SMK
            </div>
          </div>

          <div className="flex items-center gap-3 md:justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-700 text-blue-100">
              ⚙
            </div>

            <span className="text-sm font-semibold text-blue-100">
              kuncoroaji, BBPPMPV BOE
            </span>
          </div>

          <div className="text-sm text-blue-200 md:text-right">
            © 2026 Wajah SMK. Semua hak dilindungi.
          </div>
        </div>
      </footer>
    </main>
  );
}