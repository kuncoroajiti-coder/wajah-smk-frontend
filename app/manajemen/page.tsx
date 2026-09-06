"use client";
import Header from "@/components/Header";

import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  nip: string;
  role: "pegawai_boe" | "manajemen" | "super_admin";
  status: "aktif" | "nonaktif";
  must_change_password: boolean;
};

type Summary = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  average_rating: number;
  schools_with_reviews: number;
};

type TopSchool = {
  id: number;
  npsn: string;
  name: string;
  province: string | null;
  review_count: number;
  average_rating: number;
};

type ProvinceSummary = {
  province: string | null;
  review_count: number;
  average_rating: number;
};

type DashboardResponse = {
  summary: Summary;
  rating_distribution: Record<string, number>;
  top_schools: TopSchool[];
  reviews_by_province: ProvinceSummary[];
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api";

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("id-ID");
}

function formatRating(value: number) {
  return Number(value || 0).toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getRatingPercentage(
  value: number,
  distribution: Record<string, number>
) {
  const total = Object.values(distribution).reduce(
    (sum, item) => sum + Number(item || 0),
    0
  );

  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

export default function ManagementDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("wajah_smk_token");
    const userRaw = localStorage.getItem("wajah_smk_user");

    if (!token || !userRaw) {
      window.location.href = "/login?redirect=/manajemen";
      return;
    }

    try {
      const parsedUser: User = JSON.parse(userRaw);

      if (
        parsedUser.role !== "manajemen" &&
        parsedUser.role !== "super_admin"
      ) {
        window.location.href = "/";
        return;
      }

      if (parsedUser.status !== "aktif") {
        localStorage.removeItem("wajah_smk_token");
        localStorage.removeItem("wajah_smk_user");
        window.location.href = "/login";
        return;
      }

      if (parsedUser.must_change_password) {
        window.location.href =
          "/change-password?redirect=/manajemen";
        return;
      }

      setUser(parsedUser);
      loadDashboard(token);
    } catch {
      localStorage.removeItem("wajah_smk_token");
      localStorage.removeItem("wajah_smk_user");
      window.location.href = "/login?redirect=/manajemen";
    }
  }, []);

  async function loadDashboard(token: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/management/dashboard`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("wajah_smk_token");
        localStorage.removeItem("wajah_smk_user");
        window.location.href = "/login?redirect=/manajemen";
        return;
      }

      if (response.status === 403) {
        setError(
          "Akun Anda tidak memiliki akses ke dashboard manajemen."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Gagal mengambil data dashboard manajemen."
        );
      }

      const data: DashboardResponse =
        await response.json();

      setDashboard(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Dashboard manajemen tidak dapat dimuat."
      );
    } finally {
      setLoading(false);
    }
  }

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
    } catch (err) {
      console.error("Gagal logout:", err);
    } finally {
      localStorage.removeItem("wajah_smk_token");
      localStorage.removeItem("wajah_smk_user");
      window.location.href = "/login";
    }
  }

  const summary = dashboard?.summary;

  return (
    <main className="page">
      <Header />

      <section className="content">
        <div className="breadcrumb">
          <a href="/">Beranda</a>
          <span>›</span>
          <span>Dashboard Manajemen</span>
        </div>

        <div className="heading">
          <div>
            <div className="eyebrow">
              PANEL MANAJEMEN
            </div>

            <h1>Ringkasan Wajah SMK</h1>

            <p>
              Pantau perkembangan ulasan sekolah dan
              gambaran umum persepsi pengguna.
            </p>
          </div>
        </div>

        {loading && (
          <div className="state-card">
            <h2>Memuat dashboard...</h2>
            <p>
              Sedang mengambil data ulasan Wajah SMK.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="error-card">
            <strong>Dashboard tidak dapat dimuat</strong>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && dashboard && (
          <>
            <section className="summary-grid">
              <div className="summary-card">
                <span>Total Ulasan</span>
                <strong>
                  {formatNumber(summary?.total ?? 0)}
                </strong>
              </div>

              <div className="summary-card pending">
                <span>Menunggu Moderasi</span>
                <strong>
                  {formatNumber(summary?.pending ?? 0)}
                </strong>
              </div>

              <div className="summary-card approved">
                <span>Disetujui</span>
                <strong>
                  {formatNumber(summary?.approved ?? 0)}
                </strong>
              </div>

              <div className="summary-card rejected">
                <span>Ditolak</span>
                <strong>
                  {formatNumber(summary?.rejected ?? 0)}
                </strong>
              </div>

              <div className="summary-card rating">
                <span>Rating Rata-rata</span>
                <strong>
                  {formatRating(summary?.average_rating ?? 0)}
                  <small>/ 5</small>
                </strong>
              </div>

              <div className="summary-card schools">
                <span>Sekolah Dengan Ulasan</span>
                <strong>
                  {formatNumber(
                    summary?.schools_with_reviews ?? 0
                  )}
                </strong>
              </div>
            </section>

            <section className="dashboard-grid">
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-eyebrow">
                      DISTRIBUSI
                    </div>
                    <h2>Rating Pengguna</h2>
                  </div>
                </div>

                <div className="rating-list">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = Number(
                      dashboard.rating_distribution[
                        String(rating)
                      ] ?? 0
                    );

                    const percentage =
                      getRatingPercentage(
                        count,
                        dashboard.rating_distribution
                      );

                    return (
                      <div
                        className="rating-row"
                        key={rating}
                      >
                        <div className="rating-label">
                          <strong>{rating}</strong>
                          <span>★</span>
                        </div>

                        <div className="rating-bar">
                          <div
                            className="rating-fill"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <div className="rating-count">
                          {formatNumber(count)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-eyebrow">
                      PERINGKAT
                    </div>
                    <h2>
                      Sekolah Dengan Ulasan Terbanyak
                    </h2>
                  </div>
                </div>

                {dashboard.top_schools.length === 0 ? (
                  <div className="empty">
                    Belum ada ulasan yang disetujui.
                  </div>
                ) : (
                  <div className="school-list">
                    {dashboard.top_schools.map(
                      (school, index) => (
                        <a
                          href={`/sekolah/${school.id}`}
                          className="school-item"
                          key={school.id}
                        >
                          <div className="rank">
                            {index + 1}
                          </div>

                          <div className="school-info">
                            <strong>
                              {school.name}
                            </strong>
                            <span>
                              NPSN {school.npsn}
                              {school.province
                                ? ` · ${school.province}`
                                : ""}
                            </span>
                          </div>

                          <div className="school-stat">
                            <strong>
                              {formatNumber(
                                school.review_count
                              )}
                            </strong>
                            <span>
                              {formatRating(
                                school.average_rating
                              )}{" "}
                              ★
                            </span>
                          </div>
                        </a>
                      )
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="panel province-panel">
              <div className="panel-header">
                <div>
                  <div className="panel-eyebrow">
                    WILAYAH
                  </div>
                  <h2>Rekap Ulasan Per Provinsi</h2>
                </div>
              </div>

              {dashboard.reviews_by_province.length ===
              0 ? (
                <div className="empty">
                  Belum ada data ulasan yang disetujui.
                </div>
              ) : (
                <div className="province-table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Provinsi</th>
                        <th>Jumlah Ulasan</th>
                        <th>Rating Rata-rata</th>
                      </tr>
                    </thead>

                    <tbody>
                      {dashboard.reviews_by_province.map(
                        (item) => (
                          <tr
                            key={
                              item.province ??
                              "tanpa-provinsi"
                            }
                          >
                            <td>
                              {item.province ||
                                "Tidak diketahui"}
                            </td>

                            <td>
                              {formatNumber(
                                item.review_count
                              )}
                            </td>

                            <td>
                              {formatRating(
                                item.average_rating
                              )}{" "}
                              ★
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <strong>WAJAH SMK</strong>
          <span>
            Dashboard Manajemen · BBPPMPV BOE
          </span>
          <span>© 2026 Wajah SMK</span>
        </div>
      </footer>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: #f1f5f9;
          color: #0f2747;
          display: flex;
          flex-direction: column;
        }

        .header {
          background: #082b5c;
          color: white;
        }

        .header-inner {
          max-width: 1280px;
          width: 100%;
          min-height: 80px;
          margin: 0 auto;
          padding: 16px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .brand {
          color: white;
          text-decoration: none;
          font-size: 25px;
          font-weight: 800;
        }

        .brand span {
          color: #93c5fd;
        }

        .subtitle {
          margin-top: 5px;
          color: #bfdbfe;
          font-size: 12px;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .nav > a {
          color: white;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
        }

        .account {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .account-text {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: 12px;
        }

        .account-text span {
          color: #bfdbfe;
          margin-top: 2px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #dbeafe;
          color: #123b73;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .logout-button {
          min-height: 38px;
          padding: 0 14px;
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 8px;
          background: transparent;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .content {
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 32px;
          flex: 1;
        }

        .breadcrumb {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          color: #64748b;
          font-size: 13px;
        }

        .breadcrumb a {
          color: #2563eb;
          text-decoration: none;
          font-weight: 700;
        }

        .heading {
          margin-bottom: 28px;
        }

        .eyebrow,
        .panel-eyebrow {
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .heading h1 {
          margin: 7px 0 0;
          font-size: 36px;
          line-height: 1.15;
        }

        .heading p {
          margin: 9px 0 0;
          color: #475569;
          font-size: 16px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .summary-card {
          min-height: 125px;
          padding: 20px;
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 15px;
          box-shadow: 0 2px 8px rgba(15, 39, 71, 0.05);
        }

        .summary-card span {
          display: block;
          color: #64748b;
          font-size: 12px;
          font-weight: 800;
        }

        .summary-card strong {
          display: block;
          margin-top: 12px;
          font-size: 28px;
          line-height: 1.1;
        }

        .summary-card small {
          font-size: 14px;
          color: #64748b;
        }

        .summary-card.pending strong {
          color: #b45309;
        }

        .summary-card.approved strong {
          color: #047857;
        }

        .summary-card.rejected strong {
          color: #b91c1c;
        }

        .summary-card.rating strong {
          color: #b77900;
        }

        .summary-card.schools strong {
          color: #2563eb;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1.35fr;
          gap: 22px;
          margin-bottom: 22px;
        }

        .panel {
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(15, 39, 71, 0.05);
          overflow: hidden;
        }

        .panel-header {
          padding: 22px;
          border-bottom: 1px solid #e2e8f0;
        }

        .panel h2 {
          margin: 5px 0 0;
          color: #0f2747;
          font-size: 19px;
        }

        .rating-list {
          padding: 22px;
        }

        .rating-row {
          display: grid;
          grid-template-columns: 48px 1fr 58px;
          align-items: center;
          gap: 12px;
          margin-bottom: 17px;
        }

        .rating-row:last-child {
          margin-bottom: 0;
        }

        .rating-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: 800;
        }

        .rating-label span {
          color: #f5b800;
        }

        .rating-bar {
          height: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: #e2e8f0;
        }

        .rating-fill {
          height: 100%;
          border-radius: inherit;
          background: #2563eb;
        }

        .rating-count {
          color: #475569;
          font-size: 13px;
          font-weight: 700;
          text-align: right;
        }

        .school-list {
          padding: 8px 22px;
        }

        .school-item {
          display: grid;
          grid-template-columns: 38px 1fr auto;
          gap: 12px;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #e2e8f0;
          text-decoration: none;
        }

        .school-item:last-child {
          border-bottom: none;
        }

        .rank {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #eff6ff;
          color: #1d4ed8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .school-info {
          min-width: 0;
        }

        .school-info strong {
          display: block;
          color: #0f2747;
          font-size: 14px;
        }

        .school-info span {
          display: block;
          margin-top: 4px;
          color: #64748b;
          font-size: 11px;
        }

        .school-stat {
          text-align: right;
        }

        .school-stat strong,
        .school-stat span {
          display: block;
        }

        .school-stat strong {
          color: #0f2747;
          font-size: 14px;
        }

        .school-stat span {
          margin-top: 3px;
          color: #b77900;
          font-size: 12px;
          font-weight: 700;
        }

        .province-panel {
          margin-bottom: 30px;
        }

        .province-table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          padding: 13px 22px;
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-align: left;
          text-transform: uppercase;
        }

        td {
          padding: 15px 22px;
          border-top: 1px solid #e2e8f0;
          color: #334155;
          font-size: 13px;
          font-weight: 600;
        }

        .state-card,
        .error-card {
          padding: 70px 24px;
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          text-align: center;
        }

        .state-card h2,
        .error-card strong {
          color: #0f2747;
        }

        .state-card p,
        .error-card p {
          margin: 8px 0 0;
          color: #64748b;
        }

        .error-card {
          color: #991b1b;
        }

        .empty {
          padding: 40px 22px;
          color: #64748b;
          text-align: center;
          font-size: 14px;
        }

        .footer {
          background: #082b5c;
          color: #cbd5e1;
        }

        .footer-inner {
          max-width: 1280px;
          min-height: 58px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          font-size: 12px;
        }

        .footer strong {
          color: white;
        }

        @media (max-width: 1100px) {
          .summary-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .header-inner {
            align-items: flex-start;
            flex-direction: column;
            padding: 18px 20px;
          }

          .nav {
            width: 100%;
            flex-wrap: wrap;
          }

          .account-text {
            display: none;
          }

          .content {
            padding: 28px 20px 40px;
          }

          .heading h1 {
            font-size: 30px;
          }

          .summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .footer-inner {
            min-height: auto;
            padding: 16px 20px;
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }

          .school-item {
            grid-template-columns: 32px 1fr;
          }

          .school-stat {
            grid-column: 2;
            text-align: left;
          }
        }
      `}</style>
    </main>
  );
}
