"use client";

import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api";
const STORAGE_URL = "http://127.0.0.1:8000/storage";

type User = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

type ReviewPhoto = {
  id: number;
  path: string;
  caption?: string | null;
  sort_order?: number;
};

type Review = {
  id: number;
  rating: number;
  title: string | null;
  content: string;
  status: string;
  created_at: string;

  school?: {
    id: number;
    npsn: string;
    name: string;
    province: string;
    city: string;
  };

  user?: {
    id: number;
    name: string;
    email: string;
  };

  photos?: ReviewPhoto[];
};

type Statistics = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  average_rating: number;
  rating_distribution: {
    [key: number]: number;
  };
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] =
    useState<Statistics | null>(null);

  const [loading, setLoading] = useState(true);
  const [statisticsLoading, setStatisticsLoading] =
    useState(true);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("wajah_smk_token");
    const userRaw = localStorage.getItem("wajah_smk_user");

    if (!token || !userRaw) {
      window.location.href = "/login?redirect=/admin";
      return;
    }

    try {
      const parsedUser: User = JSON.parse(userRaw);

      if (parsedUser.role !== "admin") {
        window.location.href = "/";
        return;
      }

      setUser(parsedUser);
    } catch {
      localStorage.removeItem("wajah_smk_token");
      localStorage.removeItem("wajah_smk_user");

      window.location.href = "/login?redirect=/admin";
      return;
    }

    loadReviews(token);
    loadStatistics(token);
  }, []);

  async function loadReviews(token: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/admin/reviews/pending`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("wajah_smk_token");
        localStorage.removeItem("wajah_smk_user");

        window.location.href = "/login?redirect=/admin";
        return;
      }

      if (!response.ok) {
        throw new Error("Gagal mengambil data ulasan.");
      }

      const data = await response.json();

      setReviews(
        Array.isArray(data)
          ? data
          : data.data ?? []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadStatistics(token: string) {
    setStatisticsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/admin/statistics`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("wajah_smk_token");
        localStorage.removeItem("wajah_smk_user");

        window.location.href = "/login?redirect=/admin";
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Gagal mengambil statistik ulasan."
        );
      }

      const data: Statistics = await response.json();

      setStatistics(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil statistik."
      );
    } finally {
      setStatisticsLoading(false);
    }
  }

  async function moderateReview(
    reviewId: number,
    action: "approve" | "reject"
  ) {
    const token = localStorage.getItem("wajah_smk_token");

    if (!token) {
      window.location.href = "/login?redirect=/admin";
      return;
    }

    setProcessingId(reviewId);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/admin/reviews/${reviewId}/${action}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("wajah_smk_token");
        localStorage.removeItem("wajah_smk_user");

        window.location.href = "/login?redirect=/admin";
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message ||
            `Ulasan gagal ${
              action === "approve"
                ? "disetujui"
                : "ditolak"
            }.`
        );
      }

      setReviews((current) =>
        current.filter(
          (review) => review.id !== reviewId
        )
      );

      loadStatistics(token);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memproses ulasan."
      );
    } finally {
      setProcessingId(null);
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

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }

  function renderStars(rating: number) {
    const numericRating = Math.max(
      0,
      Math.min(5, Number(rating) || 0)
    );

    return (
      <div
        className="rating-row"
        aria-label={`Rating ${numericRating} dari 5`}
      >
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => {
            const isActive = star <= numericRating;

            return (
              <span
                key={star}
                className="star"
                style={{
                  color: isActive
                    ? "#f5b800"
                    : "#cbd5e1",
                }}
                aria-hidden="true"
              >
                ★
              </span>
            );
          })}
        </div>

        <span className="rating-number">
          {numericRating}/5
        </span>
      </div>
    );
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

  const avatarLetter =
    user?.name?.trim()?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "A";

  return (
    <>
      <main className="admin-page">
        <header className="admin-header">
          <div className="admin-header-inner">
            <div className="brand-area">
              <div className="brand">
                WAJAH{" "}
                <span>SMK</span>
              </div>

              <div className="brand-subtitle">
                Dashboard Administrator
              </div>
            </div>

            <div className="header-right">
              <a
                href="/admin"
                className="nav-link"
              >
                Dashboard
              </a>

              <a
                href="/admin/sekolah"
                className="nav-link"
              >
                Manajemen Sekolah
              </a>

              <a
                href="/"
                className="nav-link"
              >
                Beranda
              </a>

              <div className="account-info">
                <div className="account-text">
                  <div className="account-email">
                    {user?.email ?? "-"}
                  </div>

                  <div className="account-role">
                    Pengguna
                  </div>
                </div>

                <div
                  className="avatar"
                  aria-label="Avatar pengguna"
                >
                  {avatarLetter}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="logout-button"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="admin-content">
          <div className="page-heading">
            <div className="heading-text">
              <div className="eyebrow">
                PANEL ADMINISTRASI
              </div>

              <h1>Moderasi Ulasan</h1>

              <p>
                Periksa dan kelola ulasan sekolah yang
                menunggu persetujuan.
              </p>
            </div>

            <div className="counter-card">
              <div className="counter-label">
                MENUNGGU MODERASI
              </div>

              <div className="counter-number">
                {statisticsLoading
                  ? "—"
                  : statistics?.pending ??
                    reviews.length}
              </div>
            </div>
          </div>

          <section className="statistics-section">
            <div className="statistics-title">
              Statistik Ulasan
            </div>

            {statisticsLoading ? (
              <div className="statistics-loading">
                Memuat statistik...
              </div>
            ) : statistics ? (
              <>
                <div className="statistics-grid">
                  <div className="stat-card">
                    <div className="stat-label">
                      TOTAL ULASAN
                    </div>

                    <div className="stat-number">
                      {statistics.total}
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-label">
                      MENUNGGU
                    </div>

                    <div className="stat-number">
                      {statistics.pending}
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-label">
                      DISETUJUI
                    </div>

                    <div className="stat-number">
                      {statistics.approved}
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-label">
                      DITOLAK
                    </div>

                    <div className="stat-number">
                      {statistics.rejected}
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-label">
                      RATA-RATA RATING
                    </div>

                    <div className="stat-rating">
                      <span className="stat-rating-number">
                        {statistics.average_rating.toFixed(
                          2
                        )}
                      </span>

                      <span className="stat-rating-max">
                        / 5
                      </span>
                    </div>
                  </div>
                </div>

                <div className="distribution-card">
                  <div className="distribution-header">
                    <div>
                      <div className="distribution-title">
                        Distribusi Rating
                      </div>

                      <div className="distribution-subtitle">
                        Ulasan yang sudah disetujui
                      </div>
                    </div>

                    <div className="distribution-average">
                      {statistics.average_rating.toFixed(
                        2
                      )}
                      /5
                    </div>
                  </div>

                  <div className="distribution-list">
                    {[5, 4, 3, 2, 1].map(
                      (rating) => {
                        const count =
                          statistics
                            .rating_distribution[
                            rating
                          ] ?? 0;

                        const approvedTotal =
                          statistics.approved;

                        const percentage =
                          approvedTotal > 0
                            ? Math.round(
                                (count /
                                  approvedTotal) *
                                  100
                              )
                            : 0;

                        return (
                          <div
                            key={rating}
                            className="distribution-row"
                          >
                            <div className="distribution-rating">
                              <span>
                                {rating}
                              </span>

                              <span className="distribution-star">
                                ★
                              </span>
                            </div>

                            <div className="distribution-track">
                              <div
                                className="distribution-fill"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>

                            <div className="distribution-count">
                              {count}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </section>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <div className="moderation-heading">
            <div>
              <div className="section-heading">
                Ulasan Menunggu Moderasi
              </div>

              <div className="section-description">
                Ulasan baru akan tampil di sini sebelum
                dipublikasikan.
              </div>
            </div>

            <div className="moderation-count">
              {reviews.length} ulasan
            </div>
          </div>

          {loading ? (
            <div className="state-card">
              <div className="state-title">
                Memuat ulasan...
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="state-card">
              <div className="success-icon">
                ✓
              </div>

              <h2>
                Tidak ada ulasan yang menunggu moderasi
              </h2>

              <p>
                Semua ulasan yang masuk sudah diproses.
              </p>
            </div>
          ) : (
            <div className="review-list">
              {reviews.map((review) => {
                const isProcessing =
                  processingId === review.id;

                return (
                  <article
                    key={review.id}
                    className="review-card"
                  >
                    <div className="review-header">
                      <div className="school-info">
                        <div className="section-label">
                          SEKOLAH
                        </div>

                        <h2>
                          {review.school?.name ??
                            "Nama sekolah tidak tersedia"}
                        </h2>

                        <p>
                          NPSN:{" "}
                          {review.school?.npsn ?? "-"}{" "}
                          ·{" "}
                          {review.school?.city ?? "-"},{" "}
                          {review.school?.province ?? "-"}
                        </p>
                      </div>

                      <div className="rating-card">
                        <div className="rating-label">
                          Rating
                        </div>

                        {renderStars(
                          review.rating
                        )}
                      </div>
                    </div>

                    <div className="review-body">
                      <h3>
                        {review.title ||
                          "Tanpa judul"}
                      </h3>

                      <p className="review-content">
                        {review.content}
                      </p>

                      {review.photos &&
                        review.photos.length > 0 && (
                          <div className="photo-section">
                            <div className="photo-section-title">
                              FOTO PENDUKUNG (
                              {review.photos.length}
                              )
                            </div>

                            <div className="photo-grid">
                              {review.photos
                                .slice()
                                .sort(
                                  (a, b) =>
                                    (a.sort_order ?? 0) -
                                    (b.sort_order ?? 0)
                                )
                                .map((photo, index) => (
                                  <a
                                    key={photo.id}
                                    href={getPhotoUrl(
                                      photo.path
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="photo-card"
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
                                      className="review-photo"
                                    />

                                    <div className="photo-number">
                                      Foto {index + 1}
                                    </div>
                                  </a>
                                ))}
                            </div>

                            <div className="photo-help">
                              Klik foto untuk melihat ukuran
                              penuh.
                            </div>
                          </div>
                        )}

                      <div className="sender-info">
                        <div>
                          Pengirim:{" "}
                          <strong>
                            {review.user?.name ??
                              "Pengguna"}
                          </strong>
                        </div>

                        <div>
                          Email:{" "}
                          {review.user?.email ?? "-"}
                        </div>

                        <div>
                          Dikirim:{" "}
                          {formatDate(
                            review.created_at
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="action-bar">
                      <div className="action-buttons">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            moderateReview(
                              review.id,
                              "reject"
                            )
                          }
                          className="reject-button"
                        >
                          {isProcessing
                            ? "Memproses..."
                            : "Tolak"}
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            moderateReview(
                              review.id,
                              "approve"
                            )
                          }
                          className="approve-button"
                        >
                          {isProcessing
                            ? "Memproses..."
                            : "Setujui"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="admin-footer">
          <div className="admin-footer-inner">
            <div className="footer-brand">
              WAJAH SMK
            </div>

            <div className="footer-developer">
              <span className="footer-icon">
                ⚙
              </span>

              <span>
                kuncoroaji, BBPPMPV BOE
              </span>
            </div>

            <div className="footer-copy">
              © 2026 Wajah SMK. Semua hak dilindungi.
            </div>
          </div>
        </footer>
      </main>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .admin-page {
          min-height: 100vh;
          background: #f1f5f9;
          color: #0f2747;
          display: flex;
          flex-direction: column;
        }

        .admin-header {
          width: 100%;
          background: #082b5c;
          color: #ffffff;
        }

        .admin-header-inner {
          width: 100%;
          max-width: 1280px;
          min-height: 80px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .brand-area {
          min-width: 0;
        }

        .brand {
          color: #ffffff;
          font-size: 25px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .brand span {
          color: #93c5fd;
        }

        .brand-subtitle {
          color: #bfdbfe;
          font-size: 12px;
          font-weight: 500;
          margin-top: 5px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .nav-link {
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
        }

        .nav-link:hover {
          color: #bfdbfe;
        }

        .account-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .account-text {
          text-align: right;
          min-width: 0;
        }

        .account-email {
          color: #ffffff;
          font-size: 13px;
          line-height: 1.2;
          font-weight: 700;
          white-space: nowrap;
        }

        .account-role {
          color: #bfdbfe;
          font-size: 11px;
          line-height: 1.2;
          margin-top: 3px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          border-radius: 50%;
          background: #dbeafe;
          color: #123b73;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 800;
        }

        .logout-button {
          min-height: 40px;
          padding: 0 17px;
          border: 1.5px solid rgba(255, 255, 255, 0.8);
          border-radius: 9px;
          background: transparent;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
        }

        .logout-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .admin-content {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 42px 32px 48px;
          flex: 1;
        }

        .page-heading {
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 260px;
          gap: 32px;
          align-items: end;
          margin-bottom: 28px;
        }

        .heading-text {
          min-width: 0;
        }

        .eyebrow {
          color: #2563eb;
          font-size: 14px;
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin-bottom: 9px;
        }

        .heading-text h1 {
          margin: 0;
          color: #0f2747;
          font-size: 36px;
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -0.7px;
        }

        .heading-text p {
          margin: 9px 0 0;
          color: #475569;
          font-size: 16px;
          line-height: 1.6;
        }

        .counter-card {
          width: 260px;
          min-height: 98px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 15px;
          padding: 18px 22px;
          box-shadow:
            0 2px 8px rgba(15, 39, 71, 0.06);
        }

        .counter-label {
          color: #64748b;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .counter-number {
          margin-top: 5px;
          color: #0f2747;
          font-size: 32px;
          line-height: 1.1;
          font-weight: 800;
        }

        .statistics-section {
          width: 100%;
          margin-bottom: 38px;
        }

        .statistics-title {
          color: #0f2747;
          font-size: 20px;
          line-height: 1.3;
          font-weight: 800;
          margin-bottom: 14px;
        }

        .statistics-loading {
          width: 100%;
          min-height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 15px;
          color: #64748b;
          font-size: 14px;
        }

        .statistics-grid {
          width: 100%;
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 14px;
        }

        .stat-card {
          min-height: 112px;
          padding: 18px 18px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 14px;
          box-shadow:
            0 2px 8px rgba(15, 39, 71, 0.05);
        }

        .stat-label {
          color: #64748b;
          font-size: 11px;
          line-height: 1.3;
          font-weight: 800;
          letter-spacing: 0.4px;
        }

        .stat-number {
          margin-top: 10px;
          color: #0f2747;
          font-size: 30px;
          line-height: 1;
          font-weight: 800;
        }

        .stat-rating {
          margin-top: 8px;
          display: flex;
          align-items: baseline;
        }

        .stat-rating-number {
          color: #0f2747;
          font-size: 30px;
          line-height: 1;
          font-weight: 800;
        }

        .stat-rating-max {
          margin-left: 4px;
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
        }

        .distribution-card {
          margin-top: 14px;
          padding: 20px 22px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 14px;
          box-shadow:
            0 2px 8px rgba(15, 39, 71, 0.05);
        }

        .distribution-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .distribution-title {
          color: #0f2747;
          font-size: 16px;
          font-weight: 800;
        }

        .distribution-subtitle {
          margin-top: 3px;
          color: #64748b;
          font-size: 12px;
        }

        .distribution-average {
          color: #0f2747;
          font-size: 18px;
          font-weight: 800;
          white-space: nowrap;
        }

        .distribution-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .distribution-row {
          display: grid;
          grid-template-columns: 46px minmax(0, 1fr) 36px;
          align-items: center;
          gap: 10px;
        }

        .distribution-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #334155;
          font-size: 13px;
          font-weight: 800;
        }

        .distribution-star {
          color: #f5b800;
          font-size: 14px;
        }

        .distribution-track {
          height: 9px;
          overflow: hidden;
          border-radius: 999px;
          background: #e2e8f0;
        }

        .distribution-fill {
          height: 100%;
          border-radius: 999px;
          background: #155eab;
          transition: width 0.25s ease;
        }

        .distribution-count {
          color: #475569;
          font-size: 13px;
          font-weight: 800;
          text-align: right;
        }

        .error-box {
          width: 100%;
          margin-bottom: 24px;
          padding: 14px 18px;
          border: 1px solid #fca5a5;
          border-radius: 12px;
          background: #fef2f2;
          color: #991b1b;
          font-size: 14px;
          font-weight: 600;
        }

        .moderation-heading {
          width: 100%;
          margin-bottom: 18px;
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
        }

        .section-heading {
          color: #0f2747;
          font-size: 20px;
          line-height: 1.3;
          font-weight: 800;
        }

        .section-description {
          margin-top: 4px;
          color: #64748b;
          font-size: 13px;
        }

        .moderation-count {
          color: #155eab;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }

        .state-card {
          width: 100%;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          padding: 70px 24px;
          text-align: center;
          box-shadow:
            0 2px 8px rgba(15, 39, 71, 0.06);
        }

        .state-title {
          color: #475569;
          font-size: 16px;
          font-weight: 600;
        }

        .success-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: #ecfdf5;
          color: #059669;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 800;
        }

        .state-card h2 {
          margin: 0;
          color: #0f2747;
          font-size: 20px;
          font-weight: 800;
        }

        .state-card p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .review-list {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .review-card {
          width: 100%;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          overflow: hidden;
          box-shadow:
            0 2px 8px rgba(15, 39, 71, 0.06);
        }

        .review-header {
          width: 100%;
          min-height: 116px;
          padding: 22px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .school-info {
          min-width: 0;
        }

        .section-label {
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }

        .school-info h2 {
          margin: 0;
          color: #0f2747;
          font-size: 21px;
          line-height: 1.25;
          font-weight: 800;
        }

        .school-info p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .rating-card {
          flex: 0 0 auto;
          min-width: 165px;
          padding: 11px 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .rating-label {
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .rating-row {
          display: flex;
          align-items: center;
        }

        .stars {
          display: flex;
          align-items: center;
          white-space: nowrap;
        }

        .star {
          display: inline-block;
          font-size: 19px;
          line-height: 1;
        }

        .rating-number {
          color: #334155;
          font-size: 14px;
          font-weight: 700;
          margin-left: 8px;
          white-space: nowrap;
        }

        .review-body {
          width: 100%;
          padding: 22px 24px 24px;
        }

        .review-body h3 {
          margin: 0;
          color: #0f2747;
          font-size: 18px;
          line-height: 1.4;
          font-weight: 800;
        }

        .review-content {
          margin: 14px 0 0;
          color: #334155;
          font-size: 15px;
          line-height: 1.75;
          white-space: pre-line;
        }

        .photo-section {
          margin-top: 22px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .photo-section-title {
          color: #0f2747;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.4px;
          margin-bottom: 12px;
        }

        .photo-grid {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 12px;
        }

        .photo-card {
          display: block;
          overflow: hidden;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          text-decoration: none;
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease;
        }

        .photo-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 5px 14px rgba(15, 39, 71, 0.12);
        }

        .review-photo {
          display: block;
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          background: #e2e8f0;
        }

        .photo-number {
          padding: 8px 9px;
          color: #475569;
          background: #ffffff;
          font-size: 12px;
          font-weight: 700;
          text-align: center;
        }

        .photo-help {
          margin-top: 9px;
          color: #64748b;
          font-size: 12px;
        }

        .sender-info {
          margin-top: 20px;
          padding-top: 14px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
        }

        .sender-info strong {
          color: #334155;
        }

        .action-bar {
          width: 100%;
          min-height: 74px;
          padding: 14px 24px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .action-buttons {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
        }

        .reject-button,
        .approve-button {
          min-height: 42px;
          padding: 0 26px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          font-family: inherit;
        }

        .reject-button {
          border: 2px solid #dc2626;
          background: #ffffff;
          color: #b91c1c;
        }

        .approve-button {
          border: 2px solid #155eab;
          background: #155eab;
          color: #ffffff;
          box-shadow:
            0 2px 4px rgba(21, 94, 171, 0.2);
        }

        .reject-button:hover:not(:disabled) {
          background: #fef2f2;
        }

        .approve-button:hover:not(:disabled) {
          background: #104b8a;
          border-color: #104b8a;
        }

        .reject-button:disabled,
        .approve-button:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .admin-footer {
          width: 100%;
          background: #082b5c;
          color: #cbd5e1;
        }

        .admin-footer-inner {
          width: 100%;
          max-width: 1280px;
          min-height: 56px;
          margin: 0 auto;
          padding: 0 32px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 24px;
          font-size: 14px;
        }

        .footer-brand {
          color: #ffffff;
          font-weight: 800;
        }

        .footer-developer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          white-space: nowrap;
        }

        .footer-icon {
          color: #ffffff;
          font-size: 16px;
        }

        .footer-copy {
          text-align: right;
          white-space: nowrap;
        }

        @media (max-width: 1100px) {
          .statistics-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 1050px) {
          .admin-header-inner {
            align-items: flex-start;
            padding-top: 16px;
            padding-bottom: 16px;
          }

          .header-right {
            flex-wrap: wrap;
            justify-content: flex-end;
          }

          .photo-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .admin-header-inner {
            padding: 16px 20px;
            flex-direction: column;
          }

          .header-right {
            width: 100%;
            justify-content: space-between;
          }

          .account-text {
            display: none;
          }

          .admin-content {
            padding: 30px 20px 40px;
          }

          .page-heading {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .counter-card {
            width: 100%;
          }

          .statistics-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .moderation-heading {
            align-items: flex-start;
            flex-direction: column;
            gap: 6px;
          }

          .review-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .rating-card {
            width: 100%;
          }

          .photo-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .action-bar {
            justify-content: stretch;
          }

          .action-buttons {
            width: 100%;
          }

          .reject-button,
          .approve-button {
            flex: 1;
          }

          .distribution-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 8px;
          }

          .admin-footer-inner {
            grid-template-columns: 1fr;
            gap: 8px;
            padding: 14px 20px;
            text-align: center;
          }

          .footer-copy {
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .statistics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}