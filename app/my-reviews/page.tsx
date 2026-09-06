"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "http://127.0.0.1:8000/storage";

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
  status: "pending" | "approved" | "rejected";
  published_at: string | null;
  created_at: string;
  photos?: ReviewPhoto[];
  school: {
    id: number;
    npsn: string;
    name: string;
    province: string | null;
    city: string | null;
  };
};

type Pagination = {
  current_page: number;
  last_page: number;
  total: number;
};

type ApiResponse = {
  data: Review[];
  current_page: number;
  last_page: number;
  total: number;
};

type LoggedInUser = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
};

function renderStars(rating: number) {
  const numericRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div
      className="stars"
      aria-label={`Rating ${numericRating} dari 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= numericRating;

        return (
          <span
            key={star}
            aria-hidden="true"
            style={{
              display: "inline-block",
              color: isActive ? "#f5b800" : "#cbd5e1",
              fontSize: "19px",
              lineHeight: 1,
              fontWeight: 700,
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

function getStatusLabel(status: Review["status"]) {
  switch (status) {
    case "approved":
      return "Disetujui";
    case "rejected":
      return "Ditolak";
    default:
      return "Menunggu Moderasi";
  }
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

function getInitial(user: LoggedInUser | null) {
  if (user?.name?.trim()) {
    return user.name.trim().charAt(0).toUpperCase();
  }

  if (user?.email?.trim()) {
    return user.email.trim().charAt(0).toUpperCase();
  }

  return "P";
}

function getPhotoUrl(path: string) {
  if (!path) {
    return "";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${STORAGE_URL}/${path.replace(/^\/+/, "")}`;
}

export default function MyReviewsPage() {
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("wajah_smk_token");
    const storedUser = localStorage.getItem("wajah_smk_user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("wajah_smk_user");
      }
    }

    if (!token) {
      setNotLoggedIn(true);
      setLoading(false);
      return;
    }

    async function loadReviews() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/my-reviews`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("wajah_smk_token");
          localStorage.removeItem("wajah_smk_user");
          setNotLoggedIn(true);
          return;
        }

        if (!response.ok) {
          throw new Error("Gagal mengambil riwayat ulasan.");
        }

        const result: ApiResponse = await response.json();

        setReviews(result.data || []);

        setPagination({
          current_page: result.current_page || 1,
          last_page: result.last_page || 1,
          total: result.total || 0,
        });
      } catch (err) {
        console.error(err);
        setError("Riwayat ulasan tidak dapat dimuat. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

  async function handleLogout() {
    const token = localStorage.getItem("wajah_smk_token");

    try {
      setLoggingOut(true);

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
      console.error(err);
    } finally {
      localStorage.removeItem("wajah_smk_token");
      localStorage.removeItem("wajah_smk_user");
      router.replace("/");
    }
  }

  return (
    <main className="page">
      <Header />

      <section className="content">
        <div className="title-area">
          <div>
            <p className="eyebrow">AKUN PENGGUNA</p>

            <h1>Riwayat Ulasan</h1>

            <p className="subtitle">
              Daftar ulasan yang pernah Anda kirimkan pada sekolah.
            </p>
          </div>

          {!loading && !notLoggedIn && (
            <div className="total-box">
              <span>{pagination.total}</span>
              <small>Total Ulasan</small>
            </div>
          )}
        </div>

        {loading && (
          <div className="state-card">
            <div className="loading-spinner"></div>

            <p>Memuat riwayat ulasan...</p>
          </div>
        )}

        {notLoggedIn && !loading && (
          <div className="state-card">
            <div className="state-icon">!</div>

            <h2>Anda belum masuk</h2>

            <p>
              Silakan masuk terlebih dahulu untuk melihat riwayat ulasan Anda.
            </p>

            <Link
              href="/login?redirect=/my-reviews"
              className="primary-button"
            >
              Masuk
            </Link>
          </div>
        )}

        {error && !loading && !notLoggedIn && (
          <div className="state-card error-card">
            <div className="state-icon">!</div>

            <h2>Terjadi Kesalahan</h2>

            <p>{error}</p>

            <button
              type="button"
              className="primary-button"
              onClick={() => window.location.reload()}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading &&
          !notLoggedIn &&
          !error &&
          reviews.length === 0 && (
            <div className="state-card">
              <div className="state-icon">✎</div>

              <h2>Belum Ada Ulasan</h2>

              <p>
                Anda belum pernah mengirimkan ulasan sekolah.
              </p>

              <Link
                href="/sekolah"
                className="primary-button"
              >
                Cari Sekolah
              </Link>
            </div>
          )}

        {!loading &&
          !notLoggedIn &&
          !error &&
          reviews.length > 0 && (
            <div className="review-list">
              {reviews.map((review) => {
                const photos = Array.isArray(review.photos)
                  ? [...review.photos].sort(
                      (a, b) => a.sort_order - b.sort_order
                    )
                  : [];

                return (
                  <article
                    className="review-card"
                    key={review.id}
                  >
                    <div className="review-top">
                      <div className="school-info">
                        <div className="school-icon">
                          SMK
                        </div>

                        <div>
                          <Link
                            href={`/sekolah/${review.school.id}`}
                            className="school-name"
                          >
                            {review.school.name}
                          </Link>

                          <div className="school-meta">
                            <span>
                              NPSN {review.school.npsn}
                            </span>

                            <span>•</span>

                            <span>
                              {review.school.city || "-"}
                            </span>

                            <span>•</span>

                            <span>
                              {review.school.province || "-"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`status status-${review.status}`}
                      >
                        {getStatusLabel(review.status)}
                      </span>
                    </div>

                    <div className="review-divider"></div>

                    <div className="review-rating">
                      {renderStars(review.rating)}

                      <span className="rating-number">
                        {review.rating}/5
                      </span>
                    </div>

                    {review.title && (
                      <h2 className="review-title">
                        {review.title}
                      </h2>
                    )}

                    <p className="review-content">
                      {review.content}
                    </p>

                    {photos.length > 0 && (
                      <div className="review-photos">
                        <div className="photos-heading">
                          FOTO PENDUKUNG ({photos.length})
                        </div>

                        <div className="photos-grid">
                          {photos.map((photo, index) => {
                            const photoUrl = getPhotoUrl(photo.path);

                            return (
                              <a
                                key={photo.id}
                                href={photoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="photo-item"
                                title="Klik untuk melihat foto ukuran penuh"
                              >
                                <img
                                  src={photoUrl}
                                  alt={
                                    photo.caption ||
                                    `Foto pendukung ${index + 1}`
                                  }
                                />

                                <span>
                                  Foto {index + 1}
                                </span>
                              </a>
                            );
                          })}
                        </div>

                        <div className="photos-hint">
                          Klik foto untuk melihat ukuran penuh.
                        </div>
                      </div>
                    )}

                    <div className="review-bottom">
                      <span>
                        Dikirim {formatDate(review.created_at)}
                      </span>

                      <Link
                        href={`/sekolah/${review.school.id}`}
                        className="detail-link"
                      >
                        Lihat Sekolah →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </section>

      <Footer />

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f5f7fb;
          color: #172033;
        }

        .header {
          background: #092c5c;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-inner {
          width: min(1240px, calc(100% - 40px));
          min-height: 80px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 36px;
        }

        .brand {
          flex: 0 0 auto;
          color: #ffffff !important;
          text-decoration: none !important;
          line-height: 1;
        }

        .brand-name {
          font-size: 23px;
          font-weight: 800;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }

        .brand-subtitle {
          margin-top: 6px;
          color: #b9cee8 !important;
          font-size: 10px;
          font-weight: 500;
          white-space: nowrap;
        }

        .nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          margin-left: auto;
        }

        .nav-link {
          font-size: 14px;
          font-weight: 600;
          padding: 29px 0 25px;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
        }

        .nav-link:hover {
          color: #ffffff !important;
          border-bottom-color: #75b6ff;
        }

        .nav-link.active {
          color: #ffffff !important;
          border-bottom-color: #75b6ff;
        }

        .account {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: 4px;
        }

        .account-text {
          text-align: right;
          line-height: 1.2;
        }

        .account-email {
          max-width: 190px;
          overflow: hidden;
          color: #ffffff !important;
          font-size: 13px;
          font-weight: 700;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .account-role {
          margin-top: 3px;
          color: #b9cee8 !important;
          font-size: 11px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #dbeafe;
          color: #123e72 !important;
          font-size: 15px;
          font-weight: 800;
        }

        .logout-button,
        .login-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 80px;
          min-height: 40px;
          padding: 0 15px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 8px;
          background: transparent;
          color: #ffffff !important;
          text-decoration: none !important;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .logout-button:hover,
        .login-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #ffffff;
        }

        .logout-button:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        .content {
          width: min(1000px, calc(100% - 40px));
          margin: 0 auto;
          padding: 54px 0 80px;
          flex: 1;
        }

        .title-area {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 32px;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #1d63b6 !important;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        h1 {
          margin: 0;
          color: #092c5c !important;
          font-size: 38px;
          line-height: 1.15;
          font-weight: 800;
        }

        .subtitle {
          margin: 10px 0 0;
          color: #64748b !important;
          font-size: 15px;
        }

        .total-box {
          min-width: 125px;
          padding: 14px 18px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
        }

        .total-box span {
          display: block;
          color: #092c5c !important;
          font-size: 26px;
          line-height: 1;
          font-weight: 800;
        }

        .total-box small {
          display: block;
          margin-top: 5px;
          color: #64748b !important;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .review-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .review-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 5px 18px rgba(15, 23, 42, 0.04);
        }

        .review-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .school-info {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .school-icon {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eaf2fb;
          color: #155da8 !important;
          border: 1px solid #cbdff3;
          border-radius: 9px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .school-name {
          display: block;
          color: #092c5c !important;
          text-decoration: none !important;
          font-size: 17px;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .school-name:hover {
          color: #155da8 !important;
        }

        .school-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          color: #718096 !important;
          font-size: 12px;
        }

        .school-meta span {
          color: #718096 !important;
        }

        .status {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          min-height: 30px;
          padding: 6px 11px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .status-approved {
          color: #166534 !important;
          background: #dcfce7;
          border: 1px solid #bbf7d0;
        }

        .status-rejected {
          color: #b91c1c !important;
          background: #fee2e2;
          border: 1px solid #fecaca;
        }

        .status-pending {
          color: #92400e !important;
          background: #fef3c7;
          border: 1px solid #fde68a;
        }

        .review-divider {
          height: 1px;
          background: #edf1f5;
          margin: 19px 0 16px;
        }

        .review-rating {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .stars {
          display: flex;
          gap: 2px;
          line-height: 1;
        }

        .rating-number {
          color: #475569 !important;
          font-size: 13px;
          font-weight: 700;
        }

        .review-title {
          margin: 13px 0 7px;
          color: #172033 !important;
          font-size: 18px;
          line-height: 1.35;
          font-weight: 800;
        }

        .review-content {
          margin: 0;
          color: #4b5563 !important;
          font-size: 14px;
          line-height: 1.7;
        }

        .review-photos {
          margin-top: 20px;
          padding-top: 17px;
          border-top: 1px solid #edf1f5;
        }

        .photos-heading {
          margin-bottom: 12px;
          color: #52647b !important;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .photos-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
        }

        .photo-item {
          display: block;
          overflow: hidden;
          background: #f8fafc;
          border: 1px solid #dbe3ec;
          border-radius: 9px;
          color: #64748b !important;
          text-decoration: none !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .photo-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 14px rgba(15, 23, 42, 0.12);
        }

        .photo-item img {
          display: block;
          width: 100%;
          height: 125px;
          object-fit: cover;
          background: #eef2f7;
        }

        .photo-item span {
          display: block;
          padding: 7px 5px 8px;
          color: #64748b !important;
          font-size: 11px;
          font-weight: 700;
          text-align: center;
        }

        .photos-hint {
          margin-top: 9px;
          color: #94a3b8 !important;
          font-size: 11px;
        }

        .review-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-top: 20px;
          padding-top: 14px;
          border-top: 1px solid #edf1f5;
          color: #94a3b8 !important;
          font-size: 12px;
        }

        .review-bottom span {
          color: #94a3b8 !important;
        }

        .detail-link {
          color: #155da8 !important;
          text-decoration: none !important;
          font-weight: 700;
        }

        .detail-link:hover {
          color: #092c5c !important;
        }

        .state-card {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 5px 18px rgba(15, 23, 42, 0.04);
        }

        .state-card h2 {
          margin: 14px 0 6px;
          color: #092c5c !important;
          font-size: 21px;
        }

        .state-card p {
          max-width: 480px;
          margin: 0 0 20px;
          color: #64748b !important;
          font-size: 14px;
          line-height: 1.6;
        }

        .state-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #eaf2fb;
          color: #155da8 !important;
          font-size: 20px;
          font-weight: 800;
        }

        .primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 20px;
          border: 0;
          border-radius: 8px;
          background: #155da8;
          color: #ffffff !important;
          text-decoration: none !important;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .primary-button:hover {
          background: #092c5c;
        }

        .error-card .state-icon {
          background: #fee2e2;
          color: #b91c1c !important;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #dbe7f5;
          border-top-color: #155da8;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .footer {
          background: #092c5c;
          color: #ffffff;
        }

        .footer-inner {
          width: min(1180px, calc(100% - 40px));
          min-height: 82px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
          gap: 30px;
        }

        .footer-brand {
          color: #ffffff !important;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .footer-brand strong {
          color: #ffffff !important;
        }

        .footer-developer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          color: #dbe7f5 !important;
          font-size: 12px;
        }

        .footer-developer span {
          color: #dbe7f5 !important;
        }

        .tech-icon {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.65);
          border-radius: 5px;
          font-size: 13px;
        }

        .footer-copyright {
          color: #dbe7f5 !important;
          font-size: 11px;
          text-align: right;
        }

        @media (max-width: 1000px) {
          .header-inner {
            gap: 20px;
          }

          .nav {
            gap: 20px;
          }

          .account-email {
            max-width: 150px;
          }

          .photos-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 800px) {
          .header-inner {
            min-height: auto;
            padding: 17px 0;
            flex-wrap: wrap;
            gap: 16px;
          }

          .brand {
            flex: 1 1 auto;
          }

          .account {
            margin-left: auto;
          }

          .nav {
            order: 3;
            width: 100%;
            margin-left: 0;
            justify-content: center;
            gap: 22px;
          }

          .nav-link {
            padding: 8px 0;
          }

          .content {
            padding-top: 38px;
          }

          .title-area {
            align-items: flex-start;
          }

          h1 {
            font-size: 31px;
          }

          .review-top {
            flex-direction: column;
          }

          .status {
            align-self: flex-start;
          }

          .photos-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .footer-inner {
            grid-template-columns: 1fr;
            justify-items: center;
            padding: 22px 0;
            gap: 14px;
          }

          .footer-copyright {
            text-align: center;
          }
        }

        @media (max-width: 600px) {
          .account-text {
            display: none;
          }

          .logout-button,
          .login-button {
            min-width: 70px;
            padding: 0 12px;
          }

          .photos-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .photo-item img {
            height: 135px;
          }
        }

        @media (max-width: 520px) {
          .header-inner,
          .content,
          .footer-inner {
            width: min(100% - 28px, 1180px);
          }

          .brand-name {
            font-size: 21px;
          }

          .brand-subtitle {
            font-size: 9px;
          }

          .title-area {
            flex-direction: column;
          }

          .total-box {
            width: 100%;
          }

          .review-card {
            padding: 18px;
          }

          .school-meta {
            gap: 4px;
          }

          .review-bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}
      </style>
    </main>
  );
}