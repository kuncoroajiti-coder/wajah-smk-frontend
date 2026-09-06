"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

type User = {
  id: number;
  name: string;
  nip: string;
  role: "super_admin";
  status: "aktif" | "nonaktif";
  must_change_password: boolean;
};

type School = {
  id: number;
  npsn: string;
  name: string;
  education_type?: string | null;
  status?: string | null;
  province?: string | null;
  city?: string | null;
  district?: string | null;
  village?: string | null;
  accreditation?: string | null;
  is_active: boolean;
  reviews_count?: number;
};

type PaginationLink = {
  url: string | null;
  label: string;
  active: boolean;
};

type SchoolsResponse = {
  current_page: number;
  data: School[];
  last_page: number;
  total: number;
  per_page: number;
  links: PaginationLink[];
};

type FilterOptionsResponse = {
  provinces: string[];
  cities: string[];
  districts: string[];
  statuses: string[];
};

export default function AdminSchoolsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [schools, setSchools] = useState<School[]>([]);

  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [status, setStatus] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [processingId, setProcessingId] =
    useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("wajah_smk_token");
    const userRaw = localStorage.getItem("wajah_smk_user");

    if (!token || !userRaw) {
      window.location.href =
        "/login?redirect=/admin/sekolah";
      return;
    }

    try {
      const parsedUser: User = JSON.parse(userRaw);

      if (parsedUser.role !== "super_admin") {
        window.location.href = "/";
        return;
      }

      setUser(parsedUser);
    } catch {
      localStorage.removeItem("wajah_smk_token");
      localStorage.removeItem("wajah_smk_user");

      window.location.href =
        "/login?redirect=/admin/sekolah";
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("wajah_smk_token");

    if (!token) {
      return;
    }

    loadFilterOptions(token);
  }, [province, city]);

  useEffect(() => {
    const token = localStorage.getItem("wajah_smk_token");

    if (!token) {
      return;
    }

    loadSchools(token);
  }, [
    currentPage,
    search,
    province,
    city,
    district,
    status,
    activeFilter,
  ]);

  async function loadFilterOptions(token: string) {
    setLoadingFilters(true);

    try {
      const params = new URLSearchParams();

      params.set("filter_options", "1");

      if (province) {
        params.set("province", province);
      }

      if (city) {
        params.set("city", city);
      }

      const response = await fetch(
        `${API_URL}/admin/schools?${params.toString()}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("wajah_smk_token");
        localStorage.removeItem("wajah_smk_user");

        window.location.href =
          "/login?redirect=/admin/sekolah";
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Gagal mengambil pilihan filter wilayah."
        );
      }

      const data: FilterOptionsResponse =
        await response.json();

      setProvinces(
        Array.isArray(data.provinces)
          ? data.provinces
          : []
      );

      setStatuses(
        Array.isArray(data.statuses)
          ? data.statuses
          : []
      );

      if (province) {
        setCities(
          Array.isArray(data.cities)
            ? data.cities
            : []
        );
      } else {
        setCities([]);
      }

      if (province && city) {
        setDistricts(
          Array.isArray(data.districts)
            ? data.districts
            : []
        );
      } else {
        setDistricts([]);
      }
    } catch (err) {
      console.error(
        "Gagal mengambil pilihan filter:",
        err
      );
    } finally {
      setLoadingFilters(false);
    }
  }

  async function loadSchools(token: string) {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      params.set("page", String(currentPage));
      params.set("per_page", "20");

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

      if (activeFilter) {
        params.set("is_active", activeFilter);
      }

      const response = await fetch(
        `${API_URL}/admin/schools?${params.toString()}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("wajah_smk_token");
        localStorage.removeItem("wajah_smk_user");

        window.location.href =
          "/login?redirect=/admin/sekolah";
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Gagal mengambil data sekolah."
        );
      }

      const data: SchoolsResponse =
        await response.json();

      setSchools(
        Array.isArray(data.data)
          ? data.data
          : []
      );

      setLastPage(data.last_page ?? 1);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data sekolah."
      );

      setSchools([]);
      setLastPage(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  function handleProvinceChange(
    value: string
  ) {
    setProvince(value);
    setCity("");
    setDistrict("");
    setCurrentPage(1);
  }

  function handleCityChange(value: string) {
    setCity(value);
    setDistrict("");
    setCurrentPage(1);
  }

  function handleDistrictChange(
    value: string
  ) {
    setDistrict(value);
    setCurrentPage(1);
  }

  function resetFilters() {
    setSearch("");
    setProvince("");
    setCity("");
    setDistrict("");
    setStatus("");
    setActiveFilter("");
    setCurrentPage(1);
  }

  async function toggleActive(school: School) {
    const token = localStorage.getItem(
      "wajah_smk_token"
    );

    if (!token) {
      window.location.href =
        "/login?redirect=/admin/sekolah";
      return;
    }

    setProcessingId(school.id);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/admin/schools/${school.id}/toggle-active`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("wajah_smk_token");
        localStorage.removeItem("wajah_smk_user");

        window.location.href =
          "/login?redirect=/admin/sekolah";
        return;
      }

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null);

        throw new Error(
          data?.message ||
            "Status sekolah gagal diubah."
        );
      }

      const data = await response.json();

      const updatedSchool: School =
        data.data;

      setSchools((current) =>
        current.map((item) =>
          item.id === updatedSchool.id
            ? {
                ...item,
                ...updatedSchool,
              }
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengubah status sekolah."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleLogout() {
    const token = localStorage.getItem(
      "wajah_smk_token"
    );

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

  const avatarLetter =
    user?.name?.trim()?.charAt(0)?.toUpperCase() ||
    user?.nip?.charAt(0)?.toUpperCase() ||
    "A";

  return (
    <>
      <main className="admin-page">
        <Header />

        <section className="admin-content">
          <div className="breadcrumb">
            <a href="/admin">
              Dashboard
            </a>

            <span>›</span>

            <span>Manajemen Sekolah</span>
          </div>

          <div className="page-heading">
            <div className="heading-text">
              <div className="eyebrow">
                PANEL ADMINISTRASI
              </div>

              <h1>Manajemen Sekolah</h1>

              <p>
                Kelola data dan status sekolah yang
                tersedia di Wajah SMK.
              </p>
            </div>

            <div className="total-card">
              <div className="total-label">
                TOTAL SEKOLAH
              </div>

              <div className="total-number">
                {total.toLocaleString("id-ID")}
              </div>
            </div>
          </div>

          <section className="filter-card">
            <div className="filter-header">
              <div>
                <div className="filter-title">
                  Pencarian dan Filter
                </div>

                <div className="filter-description">
                  Temukan sekolah berdasarkan identitas
                  dan wilayah.
                </div>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="reset-button"
              >
                Reset Filter
              </button>
            </div>

            <div className="filter-grid">
              <div className="field field-search">
                <label htmlFor="search">
                  Nama Sekolah / NPSN
                </label>

                <input
                  id="search"
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari nama sekolah atau NPSN..."
                />
              </div>

              <div className="field">
                <label htmlFor="province">
                  Provinsi
                </label>

                <select
                  id="province"
                  value={province}
                  onChange={(event) =>
                    handleProvinceChange(
                      event.target.value
                    )
                  }
                  disabled={loadingFilters}
                >
                  <option value="">
                    Semua provinsi
                  </option>

                  {provinces.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="city">
                  Kabupaten / Kota
                </label>

                <select
                  id="city"
                  value={city}
                  onChange={(event) =>
                    handleCityChange(
                      event.target.value
                    )
                  }
                  disabled={
                    !province ||
                    loadingFilters
                  }
                >
                  <option value="">
                    Semua kabupaten / kota
                  </option>

                  {cities.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="district">
                  Kecamatan
                </label>

                <select
                  id="district"
                  value={district}
                  onChange={(event) =>
                    handleDistrictChange(
                      event.target.value
                    )
                  }
                  disabled={
                    !province ||
                    !city ||
                    loadingFilters
                  }
                >
                  <option value="">
                    Semua kecamatan
                  </option>

                  {districts.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="status">
                  Status Sekolah
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">
                    Semua status
                  </option>

                  {statuses.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="active">
                  Status Wajah SMK
                </label>

                <select
                  id="active"
                  value={activeFilter}
                  onChange={(event) => {
                    setActiveFilter(
                      event.target.value
                    );
                    setCurrentPage(1);
                  }}
                >
                  <option value="">
                    Semua
                  </option>

                  <option value="true">
                    Aktif
                  </option>

                  <option value="false">
                    Nonaktif
                  </option>
                </select>
              </div>
            </div>
          </section>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <div className="list-heading">
            <div>
              <div className="list-title">
                Daftar Sekolah
              </div>

              <div className="list-description">
                Menampilkan {schools.length} dari{" "}
                {total.toLocaleString("id-ID")} sekolah.
              </div>
            </div>

            <div className="page-info">
              Halaman {currentPage} dari {lastPage}
            </div>
          </div>

          {loading ? (
            <div className="state-card">
              <div className="state-title">
                Memuat data sekolah...
              </div>
            </div>
          ) : schools.length === 0 ? (
            <div className="state-card">
              <div className="empty-icon">
                —
              </div>

              <h2>
                Sekolah tidak ditemukan
              </h2>

              <p>
                Tidak ada sekolah yang sesuai dengan
                pencarian atau filter yang dipilih.
              </p>
            </div>
          ) : (
            <div className="table-card">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Sekolah</th>
                      <th>Wilayah</th>
                      <th>Status</th>
                      <th>Ulasan</th>
                      <th>Status Wajah SMK</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {schools.map((school) => {
                      const isProcessing =
                        processingId === school.id;

                      return (
                        <tr key={school.id}>
                          <td>
                            <div className="school-name">
                              {school.name ||
                                "Nama sekolah tidak tersedia"}
                            </div>

                            <div className="school-npsn">
                              NPSN:{" "}
                              {school.npsn || "-"}
                            </div>
                          </td>

                          <td>
                            <div className="location-main">
                              {school.city || "-"}
                            </div>

                            <div className="location-sub">
                              {school.province || "-"}
                            </div>

                            {school.district && (
                              <div className="location-district">
                                {school.district}
                              </div>
                            )}
                          </td>

                          <td>
                            <span className="school-status">
                              {school.status || "-"}
                            </span>
                          </td>

                          <td>
                            <span className="review-count">
                              {(
                                school.reviews_count ??
                                0
                              ).toLocaleString("id-ID")}
                            </span>
                          </td>

                          <td>
                            <span
                              className={
                                school.is_active
                                  ? "active-badge"
                                  : "inactive-badge"
                              }
                            >
                              {school.is_active
                                ? "Aktif"
                                : "Nonaktif"}
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() =>
                                toggleActive(school)
                              }
                              className={
                                school.is_active
                                  ? "deactivate-button"
                                  : "activate-button"
                              }
                            >
                              {isProcessing
                                ? "Memproses..."
                                : school.is_active
                                  ? "Nonaktifkan"
                                  : "Aktifkan"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {lastPage > 1 && (
                <div className="pagination">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() =>
                      setCurrentPage(
                        (page) => page - 1
                      )
                    }
                    className="pagination-button"
                  >
                    ← Sebelumnya
                  </button>

                  <div className="pagination-pages">
                    {Array.from(
                      {
                        length: Math.min(
                          lastPage,
                          7
                        ),
                      },
                      (_, index) => {
                        let pageNumber =
                          index + 1;

                        if (
                          lastPage > 7 &&
                          currentPage > 4
                        ) {
                          pageNumber =
                            currentPage -
                            3 +
                            index;

                          if (
                            pageNumber >
                            lastPage
                          ) {
                            pageNumber =
                              lastPage -
                              6 +
                              index;
                          }
                        }

                        return (
                          <button
                            key={pageNumber}
                            type="button"
                            onClick={() =>
                              setCurrentPage(
                                pageNumber
                              )
                            }
                            className={
                              pageNumber ===
                              currentPage
                                ? "pagination-number active"
                                : "pagination-number"
                            }
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={
                      currentPage >= lastPage
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) => page + 1
                      )
                    }
                    className="pagination-button"
                  >
                    Berikutnya →
                  </button>
                </div>
              )}
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

        .brand-link {
          color: inherit;
          text-decoration: none;
          display: block;
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
          padding: 32px 32px 48px;
          flex: 1;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
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

        .breadcrumb a:hover {
          text-decoration: underline;
        }

        .page-heading {
          width: 100%;
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 240px;
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

        .total-card {
          width: 240px;
          min-height: 98px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 15px;
          padding: 18px 22px;
          box-shadow:
            0 2px 8px rgba(15, 39, 71, 0.06);
        }

        .total-label {
          color: #64748b;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .total-number {
          margin-top: 5px;
          color: #0f2747;
          font-size: 30px;
          line-height: 1.1;
          font-weight: 800;
        }

        .filter-card {
          width: 100%;
          margin-bottom: 30px;
          padding: 22px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          box-shadow:
            0 2px 8px rgba(15, 39, 71, 0.05);
        }

        .filter-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .filter-title {
          color: #0f2747;
          font-size: 17px;
          font-weight: 800;
        }

        .filter-description {
          margin-top: 4px;
          color: #64748b;
          font-size: 13px;
        }

        .reset-button {
          min-height: 38px;
          padding: 0 16px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          color: #334155;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
        }

        .reset-button:hover {
          background: #f8fafc;
        }

        .filter-grid {
          display: grid;
          grid-template-columns:
            2fr
            1.4fr
            1.4fr
            1.2fr
            1.1fr
            1.1fr;
          gap: 14px;
        }

        .field {
          min-width: 0;
        }

        .field label {
          display: block;
          margin-bottom: 7px;
          color: #334155;
          font-size: 12px;
          font-weight: 800;
        }

        .field input,
        .field select {
          width: 100%;
          min-height: 42px;
          padding: 0 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          color: #334155;
          font-size: 13px;
          font-family: inherit;
          outline: none;
        }

        .field input:focus,
        .field select:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .field select:disabled {
          background: #f8fafc;
          color: #94a3b8;
          cursor: not-allowed;
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

        .list-heading {
          width: 100%;
          margin-bottom: 16px;
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
        }

        .list-title {
          color: #0f2747;
          font-size: 20px;
          font-weight: 800;
        }

        .list-description {
          margin-top: 4px;
          color: #64748b;
          font-size: 13px;
        }

        .page-info {
          color: #64748b;
          font-size: 13px;
          font-weight: 700;
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

        .empty-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
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

        .table-card {
          width: 100%;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          overflow: hidden;
          box-shadow:
            0 2px 8px rgba(15, 39, 71, 0.06);
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 980px;
          border-collapse: collapse;
        }

        th {
          padding: 14px 18px;
          background: #f8fafc;
          border-bottom: 1px solid #cbd5e1;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.4px;
          text-align: left;
          text-transform: uppercase;
          white-space: nowrap;
        }

        td {
          padding: 17px 18px;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: middle;
        }

        tbody tr:last-child td {
          border-bottom: none;
        }

        tbody tr:hover {
          background: #f8fafc;
        }

        .school-name {
          max-width: 310px;
          color: #0f2747;
          font-size: 14px;
          line-height: 1.4;
          font-weight: 800;
        }

        .school-npsn {
          margin-top: 4px;
          color: #64748b;
          font-size: 12px;
        }

        .location-main {
          color: #334155;
          font-size: 13px;
          font-weight: 700;
        }

        .location-sub {
          margin-top: 3px;
          color: #64748b;
          font-size: 12px;
        }

        .location-district {
          margin-top: 2px;
          color: #94a3b8;
          font-size: 11px;
        }

        .school-status {
          color: #475569;
          font-size: 13px;
          font-weight: 700;
        }

        .review-count {
          color: #0f2747;
          font-size: 14px;
          font-weight: 800;
        }

        .active-badge,
        .inactive-badge {
          display: inline-flex;
          align-items: center;
          min-height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .active-badge {
          background: #ecfdf5;
          color: #047857;
        }

        .inactive-badge {
          background: #f1f5f9;
          color: #64748b;
        }

        .deactivate-button,
        .activate-button {
          min-height: 36px;
          padding: 0 13px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
        }

        .deactivate-button {
          border: 1px solid #fecaca;
          background: #ffffff;
          color: #b91c1c;
        }

        .deactivate-button:hover:not(:disabled) {
          background: #fef2f2;
        }

        .activate-button {
          border: 1px solid #93c5fd;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .activate-button:hover:not(:disabled) {
          background: #dbeafe;
        }

        .deactivate-button:disabled,
        .activate-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .pagination {
          min-height: 72px;
          padding: 14px 18px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .pagination-button {
          min-height: 38px;
          padding: 0 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          color: #334155;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
        }

        .pagination-button:hover:not(:disabled) {
          background: #f8fafc;
        }

        .pagination-button:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        .pagination-pages {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .pagination-number {
          width: 36px;
          height: 36px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          color: #475569;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          font-family: inherit;
        }

        .pagination-number:hover {
          background: #f8fafc;
        }

        .pagination-number.active {
          border-color: #155eab;
          background: #155eab;
          color: #ffffff;
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

        @media (max-width: 1180px) {
          .filter-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .field-search {
            grid-column: span 3;
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
            padding: 28px 20px 40px;
          }

          .page-heading {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .total-card {
            width: 100%;
          }

          .filter-card {
            padding: 18px;
          }

          .filter-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .filter-grid {
            grid-template-columns: 1fr;
          }

          .field-search {
            grid-column: auto;
          }

          .list-heading {
            align-items: flex-start;
            flex-direction: column;
            gap: 6px;
          }

          .pagination {
            flex-wrap: wrap;
            justify-content: center;
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
      `}</style>
    </>
  );
}