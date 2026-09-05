import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-base font-bold tracking-tight text-blue-950"
            >
              WAJAH SMK
            </Link>

            <p className="mt-1 text-xs text-slate-500">
              Platform Informasi &amp; Ulasan SMK Indonesia
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <Link
              href="/"
              className="transition hover:text-blue-800"
            >
              Beranda
            </Link>

            <Link
              href="/sekolah"
              className="transition hover:text-blue-800"
            >
              Sekolah
            </Link>

            <Link
              href="/ulasan/daftar"
              className="transition hover:text-blue-800"
            >
              Ulasan
            </Link>

            <Link
              href="/tentang"
              className="transition hover:text-blue-800"
            >
              Tentang
            </Link>
          </nav>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5 text-xs text-slate-400">
          © 2026 Wajah SMK. Semua hak dilindungi.
        </div>
      </div>
    </footer>
  );
}
