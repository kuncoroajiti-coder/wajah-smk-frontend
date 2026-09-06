"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "http://127.0.0.1:8000/storage";

type School = {
  id: number;
  npsn: string;
  name: string;
  province?: string;
  city?: string;
  district?: string;
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
  title?: string | null;
  content: string;
  status: string;
  published_at?: string | null;
  created_at: string;
  school: School;
  photos?: ReviewPhoto[];
};

type User = {
  name: string;
  email: string;
  role?: string;
};

function getPhotoUrl(path: string) {
  if (!path) return "";
  return `${STORAGE_URL}/${path}`;
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function renderStars(rating: number) {
  const numericRating = Math.max(
    0,
    Math.min(5, Number(rating) || 0)
  );

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
            className="star"
            style={{
              color: isActive ? "#f5b800" : "#cbd5e1",
            }}
            aria-hidden="true"
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export default function ReviewDetailPage() {
  const [review, setReview] = useState<Review | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReview = async () => {
      const pathParts = window.location.pathname
        .split("/")
        .filter(Boolean);

      const reviewId = pathParts[pathParts.length - 1];

      if (!reviewId || !/^\d+$/.test(reviewId)) {
        setError("ID ulasan tidak valid.");
        setLoading(false);
        return;
      }

      try {
        const savedUser = localStorage.getItem("wajah_smk_user");

        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            setUser(null);
          }
        }

        const response = await fetch(
          `${API_URL}/reviews/${reviewId}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message || "Ulasan tidak ditemukan."
          );
          return;
        }

        setReview(data.data || data);
      } catch {
        setError(
          "Tidak dapat terhubung ke server. Pastikan backend Wajah SMK sedang berjalan."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReview();
  }, []);

  const photos = [...(review?.photos || [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  return (
    <main className="page">
      <Header />
      <section className="hero">
        <div className="container">
          <Link href="/" className="back-link">
            ← Kembali ke Beranda
          </Link>

          <p className="eyebrow">DETAIL ULASAN</p>

          <h1>Ulasan Sekolah</h1>

          <p>
            Baca pengalaman dan penilaian pengguna terhadap
            satuan pendidikan SMK.
          </p>
        </div>
      </section>

      <section className="content">
        <div className="container">
          {loading && (
            <div className="state-card">
              <div className="loading-icon">⟳</div>

              <h2>Memuat ulasan...</h2>

              <p>
                Mohon tunggu sebentar.
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="state-card">
              <div className="error-icon">!</div>

              <h2>Ulasan Tidak Ditemukan</h2>

              <p>{error}</p>

              <Link
                href="/"
                className="primary-button"
              >
                Kembali ke Beranda
              </Link>
            </div>
          )}

          {!loading && !error && review && (
            <article className="review-card">
              <div className="school-header">
                <div>
                  <span className="section-label">
                    SEKOLAH
                  </span>

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

                    {review.school.city && (
                      <span>
                        {review.school.city}
                      </span>
                    )}

                    {review.school.province && (
                      <span>
                        {review.school.province}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/sekolah/${review.school.id}`}
                  className="school-link"
                >
                  Lihat Sekolah →
                </Link>
              </div>

              <div className="divider" />

              <div className="review-heading">
                <div>
                  {renderStars(review.rating)}

                  <div className="rating-text">
                    <strong>
                      {review.rating}/5
                    </strong>

                    <span>
                      Penilaian pengguna
                    </span>
                  </div>
                </div>

                <div className="review-date">
                  {formatDate(
                    review.published_at ||
                      review.created_at
                  )}
                </div>
              </div>

              <div className="review-body">
                {review.title && (
                  <h2>{review.title}</h2>
                )}

                <p>{review.content}</p>
              </div>

              {photos.length > 0 && (
                <div className="photos-section">
                  <div className="photos-heading">
                    <div>
                      <span className="section-label">
                        FOTO PENDUKUNG
                      </span>

                      <h3>
                        Dokumentasi Ulasan (
                        {photos.length})
                      </h3>
                    </div>
                  </div>

                  <div className="photos-grid">
                    {photos.map(
                      (photo, index) => (
                        <a
                          key={photo.id}
                          href={getPhotoUrl(
                            photo.path
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="photo-card"
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
                          />

                          <span>
                            {photo.caption ||
                              `Foto ${
                                index + 1
                              }`}
                          </span>
                        </a>
                      )
                    )}
                  </div>

                  <p className="photo-hint">
                    Klik foto untuk melihat ukuran
                    penuh.
                  </p>
                </div>
              )}

              <div className="review-actions">
                <Link
                  href={`/sekolah/${review.school.id}`}
                  className="secondary-button"
                >
                  ← Kembali ke Sekolah
                </Link>

                <Link
                  href={`/ulasan?school=${review.school.id}`}
                  className="primary-button"
                >
                  Beri Ulasan
                </Link>
              </div>
            </article>
          )}
        </div>
      </section>

      <Footer />
      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f8fafc;
          color: #0f172a;
        }

        .header {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .header-inner {
          max-width: 1180px;
          margin: 0 auto;
          min-height: 76px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .brand {
          color: #0f2f68;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
          text-decoration: none;
          white-space: nowrap;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 24px;
          flex: 1;
        }

        .nav a {
          color: #475569;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }

        .nav a:hover {
          color: #0f2f68;
        }

        .account {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #0f2f68;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .account-info {
          display: flex;
          flex-direction: column;
          min-width: 130px;
        }

        .account-info strong {
          font-size: 12px;
          color: #0f172a;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 170px;
        }

        .account-info span {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }

        .logout {
          border: 0;
          background: transparent;
          color: #dc2626;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .login-button {
          text-decoration: none;
          background: #0f2f68;
          color: #ffffff;
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
        }

        .hero {
          background: linear-gradient(
            135deg,
            #0f2f68 0%,
            #16478f 100%
          );
          color: #ffffff;
          padding: 44px 24px 52px;
        }

        .container {
          max-width: 980px;
          margin: 0 auto;
        }

        .back-link {
          color: #dbeafe;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
        }

        .eyebrow {
          margin: 28px 0 8px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #fbbf24;
        }

        .hero h1 {
          margin: 0;
          font-size: 38px;
          line-height: 1.15;
          letter-spacing: -1px;
        }

        .hero p:last-child {
          margin: 12px 0 0;
          color: #dbeafe;
          font-size: 15px;
          line-height: 1.6;
          max-width: 680px;
        }

        .content {
          padding: 42px 24px 72px;
        }

        .state-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 64px 24px;
          text-align: center;
          box-shadow: 0 8px 30px rgba(
            15,
            23,
            42,
            0.06
          );
        }

        .state-card h2 {
          margin: 16px 0 8px;
          font-size: 22px;
        }

        .state-card p {
          margin: 0 auto 24px;
          color: #64748b;
          line-height: 1.6;
          max-width: 600px;
        }

        .loading-icon,
        .error-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 800;
        }

        .loading-icon {
          background: #eff6ff;
          color: #2563eb;
        }

        .error-icon {
          background: #fef2f2;
          color: #dc2626;
        }

        .review-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 34px;
          box-shadow: 0 8px 30px rgba(
            15,
            23,
            42,
            0.06
          );
        }

        .school-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }

        .section-label {
          display: block;
          color: #2563eb;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.2px;
          margin-bottom: 8px;
        }

        .school-name {
          display: block;
          color: #0f2f68;
          text-decoration: none;
          font-size: 25px;
          font-weight: 800;
          line-height: 1.25;
        }

        .school-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 16px;
          margin-top: 10px;
          color: #64748b;
          font-size: 13px;
        }

        .school-link {
          color: #2563eb;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .divider {
          height: 1px;
          background: #e2e8f0;
          margin: 28px 0;
        }

        .review-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .stars {
          display: flex;
          gap: 2px;
        }

        .star {
          display: inline-block;
          font-size: 25px;
          line-height: 1;
        }

        .rating-text {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 7px;
        }

        .rating-text strong {
          color: #0f172a;
          font-size: 14px;
        }

        .rating-text span {
          color: #64748b;
          font-size: 12px;
        }

        .review-date {
          color: #64748b;
          font-size: 13px;
          white-space: nowrap;
        }

        .review-body {
          margin-top: 32px;
        }

        .review-body h2 {
          margin: 0 0 14px;
          color: #0f172a;
          font-size: 24px;
          line-height: 1.3;
        }

        .review-body p {
          margin: 0;
          color: #334155;
          font-size: 16px;
          line-height: 1.8;
          white-space: pre-wrap;
        }

        .photos-section {
          margin-top: 36px;
          padding-top: 28px;
          border-top: 1px solid #e2e8f0;
        }

        .photos-heading h3 {
          margin: 0;
          color: #0f172a;
          font-size: 19px;
        }

        .photos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-top: 18px;
        }

        .photo-card {
          display: block;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          text-decoration: none;
        }

        .photo-card img {
          display: block;
          width: 100%;
          height: 190px;
          object-fit: cover;
        }

        .photo-card span {
          display: block;
          padding: 9px 11px;
          color: #475569;
          font-size: 12px;
          font-weight: 600;
        }

        .photo-hint {
          margin: 12px 0 0;
          color: #94a3b8;
          font-size: 12px;
        }

        .review-actions {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          margin-top: 36px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .primary-button,
        .secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 20px;
          border-radius: 9px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
        }

        .primary-button {
          background: #0f2f68;
          color: #ffffff;
        }

        .secondary-button {
          background: #ffffff;
          color: #0f2f68;
          border: 1px solid #cbd5e1;
        }

        .footer {
          background: #020617;
          color: #ffffff;
          padding: 24px;
        }

        .footer-inner {
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
          gap: 20px;
        }

        .footer-brand {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.3px;
        }

        .footer-developer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #cbd5e1;
          font-size: 11px;
        }

        .developer-icon {
          width: 22px;
          height: 22px;
          border: 1px solid #94a3b8;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }

        .footer-copy {
          text-align: right;
          color: #94a3b8;
          font-size: 11px;
        }

        @media (max-width: 800px) {
          .header-inner {
            gap: 14px;
          }

          .nav {
            display: none;
          }

          .account-info {
            display: none;
          }

          .hero h1 {
            font-size: 31px;
          }

          .review-card {
            padding: 24px;
          }

          .school-header,
          .review-heading {
            flex-direction: column;
            align-items: flex-start;
          }

          .photos-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .footer-inner {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .footer-copy {
            text-align: center;
          }
        }

        @media (max-width: 520px) {
          .content,
          .hero {
            padding-left: 16px;
            padding-right: 16px;
          }

          .photos-grid {
            grid-template-columns: 1fr;
          }

          .review-actions {
            flex-direction: column;
          }

          .primary-button,
          .secondary-button {
            width: 100%;
          }
        }
      `}
      </style>
    </main>
  );
}