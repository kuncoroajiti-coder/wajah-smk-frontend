import Link from "next/link";

type School = {
  id: number;
  npsn: string;
  name: string;
  education_type: string;
  status: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  village: string | null;
  accreditation: string | null;
  accreditation_sk: string | null;
  accreditation_date: string | null;
  curriculum_code: string | null;
  curriculum_name: string | null;
};

type SchoolProgram = {
  id: number;
  semester_id: string | null;
  bidang_nama_jurusan: string | null;
  prog_nama_jurusan: string | null;
  komp_nama_jurusan: string | null;
  students_grade_10: number;
  students_grade_11: number;
  students_grade_12: number;
  students_grade_13: number;
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
  photos?: ReviewPhoto[];
};

type SchoolResponse = School & {
  programs: SchoolProgram[];
};

type ReviewsResponse = {
  data: Review[];
  total: number;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const STORAGE_URL = "http://127.0.0.1:8000/storage";

async function getSchool(id: string): Promise<SchoolResponse> {
  const response = await fetch(
    `http://127.0.0.1:8000/api/schools/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Sekolah tidak ditemukan.");
  }

  return response.json();
}

async function getReviews(id: string): Promise<ReviewsResponse> {
  const response = await fetch(
    `http://127.0.0.1:8000/api/schools/${id}/reviews`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return {
      data: [],
      total: 0,
    };
  }

  return response.json();
}

function getPhotoUrl(path: string) {
  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `${STORAGE_URL}/${path}`;
}

export default async function SchoolDetail({
  params,
}: PageProps) {
  const { id } = await params;

  const [school, reviewsResponse] = await Promise.all([
    getSchool(id),
    getReviews(id),
  ]);

  const programs = school.programs ?? [];
  const reviews = reviewsResponse.data ?? [];

  const totalStudents = programs.reduce(
    (total, program) =>
      total +
      program.students_grade_10 +
      program.students_grade_11 +
      program.students_grade_12 +
      program.students_grade_13,
    0
  );

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total + Number(review.rating || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  const averageRatingNumber = Number(averageRating);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-[#082b5c] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <a
            href="/"
            className="text-2xl font-extrabold tracking-tight"
          >
            WAJAH{" "}
            <span className="text-blue-300">
              SMK
            </span>
          </a>

          <a
            href="/"
            className="text-sm font-semibold text-blue-100 hover:text-white"
          >
            ← Kembali ke Beranda
          </a>
        </div>
      </header>

      {/* School Hero */}
      <section className="bg-[#0b3773] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-4xl">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-300">
                Profil Sekolah
              </p>

              <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
                {school.name.trim()}
              </h1>

              <p className="mt-4 text-lg text-blue-100">
                {school.city ?? "-"},{" "}
                {school.province ?? "-"}
              </p>

              <p className="mt-2 text-sm text-blue-200">
                NPSN: {school.npsn}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 text-center shadow-xl">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Akreditasi
              </div>

              <div className="mt-1 text-4xl font-extrabold text-[#082b5c]">
                {school.accreditation ?? "-"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Column */}
          <div className="lg:col-span-2">
            {/* Informasi */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-extrabold text-[#082b5c]">
                Informasi Sekolah
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <InfoItem
                  label="Nama Sekolah"
                  value={school.name.trim()}
                />

                <InfoItem
                  label="NPSN"
                  value={school.npsn}
                />

                <InfoItem
                  label="Bentuk Pendidikan"
                  value={school.education_type}
                />

                <InfoItem
                  label="Status"
                  value={school.status ?? "-"}
                />

                <InfoItem
                  label="Provinsi"
                  value={school.province ?? "-"}
                />

                <InfoItem
                  label="Kabupaten/Kota"
                  value={school.city ?? "-"}
                />

                <InfoItem
                  label="Kecamatan"
                  value={school.district ?? "-"}
                />

                <InfoItem
                  label="Kelurahan/Desa"
                  value={school.village ?? "-"}
                />

                <InfoItem
                  label="Nomor SK Akreditasi"
                  value={school.accreditation_sk ?? "-"}
                />

                <InfoItem
                  label="Kurikulum"
                  value={school.curriculum_code ?? "-"}
                />
              </div>
            </div>

            {/* Kompetensi */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#082b5c]">
                    Kompetensi Keahlian
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Data kompetensi yang tersedia pada basis data sekolah.
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold text-blue-700">
                    {programs.length}
                  </div>

                  <div className="text-xs text-slate-500">
                    Program terdata
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {programs.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                    Data kompetensi belum tersedia.
                  </div>
                ) : (
                  programs.slice(0, 20).map((program) => (
                    <div
                      key={program.id}
                      className="rounded-xl border border-slate-200 p-5"
                    >
                      <div className="font-bold text-[#082b5c]">
                        {program.komp_nama_jurusan ??
                          program.prog_nama_jurusan ??
                          program.bidang_nama_jurusan ??
                          "Kompetensi belum diberi nama"}
                      </div>

                      <div className="mt-2 text-sm text-slate-500">
                        {program.bidang_nama_jurusan ?? "-"}
                        {" · "}
                        {program.prog_nama_jurusan ?? "-"}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <StudentStat
                          label="Kelas 10"
                          value={program.students_grade_10}
                        />

                        <StudentStat
                          label="Kelas 11"
                          value={program.students_grade_11}
                        />

                        <StudentStat
                          label="Kelas 12"
                          value={program.students_grade_12}
                        />

                        <StudentStat
                          label="Kelas 13"
                          value={program.students_grade_13}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Ulasan */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                    Pengalaman
                  </p>

                  <h2 className="mt-2 text-2xl font-extrabold text-[#082b5c]">
                    Ulasan Sekolah
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-3xl font-extrabold text-[#082b5c]">
                    {averageRating}
                  </div>

                  <div>
                    <div
                      className="text-lg tracking-wide"
                      aria-label={`Rating rata-rata ${averageRating} dari 5`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          style={{
                            color:
                              star <=
                              Math.round(
                                averageRatingNumber
                              )
                                ? "#f59e0b"
                                : "#cbd5e1",
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-slate-500">
                      {reviews.length} ulasan
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {reviews.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                    Belum ada ulasan untuk sekolah ini.
                  </div>
                ) : (
                  reviews.map((review) => {
                    const numericRating = Math.max(
                      0,
                      Math.min(
                        5,
                        Number(review.rating) || 0
                      )
                    );

                    const sortedPhotos = (
                      review.photos ?? []
                    )
                      .slice()
                      .sort(
                        (a, b) =>
                          (a.sort_order ?? 0) -
                          (b.sort_order ?? 0)
                      );

                    return (
                      <article
                        key={review.id}
                        className="rounded-xl border border-slate-200 p-6"
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <div
                              className="text-lg tracking-wide"
                              aria-label={`Rating ${numericRating} dari 5`}
                            >
                              {[1, 2, 3, 4, 5].map(
                                (star) => (
                                  <span
                                    key={star}
                                    style={{
                                      color:
                                        star <=
                                        numericRating
                                          ? "#f59e0b"
                                          : "#cbd5e1",
                                    }}
                                  >
                                    ★
                                  </span>
                                )
                              )}
                            </div>

                            <h3 className="mt-2 font-bold text-[#082b5c]">
                              {review.title ??
                                "Ulasan pengguna"}
                            </h3>
                          </div>

                          <div className="text-xs text-slate-400">
                            {review.published_at
                              ? new Date(
                                  review.published_at
                                ).toLocaleDateString(
                                  "id-ID"
                                )
                              : ""}
                          </div>
                        </div>

                        <p className="mt-4 leading-7 text-slate-600">
                          {review.content}
                        </p>

                        {/* Detail Ulasan */}
                        <div className="mt-4">
                          <Link
                            href={`/ulasan/${review.id}`}
                            className="inline-flex items-center text-sm font-bold text-blue-600 transition hover:text-blue-800"
                          >
                            Lihat Detail Ulasan →
                          </Link>
                        </div>

                        {sortedPhotos.length > 0 && (
                          <div className="mt-5">
                            <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                              Foto Pendukung (
                              {sortedPhotos.length})
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                              {sortedPhotos.map(
                                (photo, index) => (
                                  <a
                                    key={photo.id}
                                    href={getPhotoUrl(
                                      photo.path
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                                    title="Klik untuk melihat foto ukuran penuh"
                                  >
                                    <img
                                      src={getPhotoUrl(
                                        photo.path
                                      )}
                                      alt={
                                        photo.caption ||
                                        `Foto pendukung ${
                                          index + 1
                                        }`
                                      }
                                      className="aspect-square w-full object-cover transition duration-200 group-hover:scale-105"
                                    />

                                    <div className="px-2 py-2 text-center text-xs font-semibold text-slate-500">
                                      Foto {index + 1}
                                    </div>
                                  </a>
                                )
                              )}
                            </div>

                            <div className="mt-2 text-xs text-slate-400">
                              Klik foto untuk melihat ukuran penuh.
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })
                )}
              </div>

              <a
                href={`/ulasan?school=${id}`}
                className="mt-6 block w-full rounded-xl bg-[#f59e0b] px-5 py-3 text-center font-bold text-white transition hover:bg-[#d97706]"
              >
                Beri Ulasan untuk Sekolah Ini
              </a>
            </div>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="rounded-2xl bg-[#082b5c] p-7 text-white shadow-lg">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-300">
                Data Sekolah
              </p>

              <div className="mt-6 space-y-6">
                <Metric
                  value={school.accreditation ?? "-"}
                  label="Akreditasi"
                />

                <Metric
                  value={programs.length}
                  label="Program terdata"
                />

                <Metric
                  value={totalStudents}
                  label="Peserta didik terdata"
                />

                <Metric
                  value={reviews.length}
                  label="Ulasan publik"
                />
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h3 className="text-xl font-extrabold text-[#082b5c]">
                Bagikan Pengalaman
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Pernah berinteraksi dengan sekolah ini? Bagikan pengalaman
                Anda melalui ulasan yang bermanfaat.
              </p>

              <a
                href={`/ulasan?school=${id}`}
                className="mt-6 block w-full rounded-xl bg-[#f59e0b] px-5 py-3 text-center font-bold text-white transition hover:bg-[#d97706]"
              >
                Beri Ulasan
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm lg:px-8">
          <div className="font-bold text-white">
            WAJAH SMK
          </div>

          <div className="mt-1">
            Platform informasi dan ulasan SMK Indonesia.
          </div>
        </div>
      </footer>
    </main>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>

      <div className="mt-1 font-semibold text-slate-800">
        {value}
      </div>
    </div>
  );
}

function StudentStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-center">
      <div className="font-bold text-[#082b5c]">
        {value}
      </div>

      <div className="mt-1 text-xs text-slate-500">
        {label}
      </div>
    </div>
  );
}

function Metric({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div>
      <div className="text-3xl font-extrabold">
        {value}
      </div>

      <div className="mt-1 text-sm text-blue-200">
        {label}
      </div>
    </div>
  );
}