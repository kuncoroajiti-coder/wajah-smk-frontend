import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-lg font-bold text-white">
              W
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight text-blue-950">
                WAJAH SMK
              </div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Platform Ulasan Sekolah
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            <Link
              href="/"
              className="text-slate-600 transition hover:text-blue-800"
            >
              Beranda
            </Link>

            <Link
              href="/sekolah"
              className="text-slate-600 transition hover:text-blue-800"
            >
              Sekolah
            </Link>

            <Link
              href="/ulasan/daftar"
              className="text-slate-600 transition hover:text-blue-800"
            >
              Ulasan
            </Link>

            <Link
              href="/tentang"
              className="font-semibold text-blue-800"
            >
              Tentang
            </Link>
          </nav>

          <Link
            href="/login"
            className="rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Login
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100">
              Tentang Wajah SMK
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Mengenal Sekolah.
              <br />
              Memahami Wajahnya.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
              Wajah SMK merupakan platform informasi dan ulasan sekolah
              menengah kejuruan di Indonesia yang membantu pengguna mengenal
              profil sekolah, kompetensi keahlian, serta berbagi pengalaman
              melalui ulasan yang bermanfaat.
            </p>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-blue-800">
              Apa itu Wajah SMK?
            </div>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Satu tempat untuk mengenal SMK dengan lebih mudah.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              Wajah SMK menyajikan informasi sekolah secara terstruktur agar
              masyarakat dapat menemukan dan mengenal sekolah menengah
              kejuruan sesuai kebutuhan. Pengguna dapat mencari sekolah,
              melihat profil dan kompetensi keahlian, serta membaca ulasan
              yang telah melalui proses moderasi.
            </p>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Platform ini juga membuka ruang bagi pengguna untuk berbagi
              pengalaman secara bertanggung jawab melalui ulasan yang dapat
              memberikan informasi tambahan bagi pengguna lainnya.
            </p>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="rounded-2xl bg-blue-50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-xl font-bold text-white">
                W
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Kenali Sekolahnya. Bagikan Wajahnya.
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Informasi sekolah dan pengalaman pengguna dipertemukan dalam
                satu platform agar informasi tentang SMK lebih mudah
                ditemukan dan dipahami.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold uppercase tracking-wider text-blue-800">
              Yang dapat Anda lakukan
            </div>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Informasi yang terhubung dengan pengalaman pengguna.
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-900 text-white">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Cari Sekolah
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Temukan sekolah berdasarkan nama, NPSN, wilayah, dan informasi
                lainnya melalui direktori sekolah.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-900 text-white">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 19V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12" />
                  <path d="M3 19h18" />
                  <path d="M8 9h8M8 13h8M8 17h5" />
                </svg>
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Kenali Profil Sekolah
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Lihat informasi sekolah, kompetensi keahlian, peserta didik,
                akreditasi, dan informasi terkait lainnya.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-900 text-white">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 3v18M3 12h18" />
                  <path d="M7 7h10M7 17h10" />
                </svg>
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Bagikan Pengalaman
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Berikan penilaian dan ulasan berdasarkan pengalaman Anda untuk
                membantu pengguna lain memperoleh perspektif tambahan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEW FLOW */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="rounded-3xl bg-blue-950 p-8 sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider text-blue-300">
                Berbagi secara bertanggung jawab
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Setiap ulasan melewati proses moderasi.
              </h2>

              <p className="mt-5 text-sm leading-6 text-blue-100">
                Wajah SMK menerapkan proses moderasi sebelum ulasan ditampilkan
                secara publik. Tujuannya adalah menjaga kualitas informasi
                yang tersedia bagi pengguna.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <div className="text-sm font-bold text-blue-300">01</div>
                <h3 className="mt-3 font-bold text-white">Tulis</h3>
                <p className="mt-2 text-xs leading-5 text-blue-100">
                  Bagikan pengalaman dan penilaian Anda.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <div className="text-sm font-bold text-blue-300">02</div>
                <h3 className="mt-3 font-bold text-white">Moderasi</h3>
                <p className="mt-2 text-xs leading-5 text-blue-100">
                  Ulasan diperiksa sebelum dipublikasikan.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <div className="text-sm font-bold text-blue-300">03</div>
                <h3 className="mt-3 font-bold text-white">Bagikan</h3>
                <p className="mt-2 text-xs leading-5 text-blue-100">
                  Ulasan yang disetujui dapat dibaca pengguna lain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 text-center lg:px-8 lg:py-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Mulai mengenal SMK lebih dekat.
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Jelajahi direktori sekolah atau bagikan pengalaman Anda melalui
            ulasan yang bermanfaat.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/sekolah"
              className="rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Jelajahi Sekolah
            </Link>

            <Link
              href="/ulasan/daftar"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-800"
            >
              Lihat Ulasan
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="font-semibold tracking-wide text-blue-950">
            WAJAH SMK
          </div>

          <div>© 2026 Wajah SMK. Semua hak dilindungi.</div>
        </div>
      </footer>
    </main>
  );
}
