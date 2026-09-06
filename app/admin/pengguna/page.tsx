"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api";

type UserRole = "pegawai_boe" | "manajemen" | "super_admin";
type UserStatus = "aktif" | "nonaktif";

type LoggedInUser = {
  id: number;
  name: string;
  nip: string;
  role: UserRole;
  status: UserStatus;
  must_change_password: boolean;
};

type UserItem = {
  id: number;
  name: string;
  nip: string;
  role: UserRole;
  status: UserStatus;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
};

type UsersResponse = {
  data: UserItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

function roleLabel(role: UserRole) {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "manajemen":
      return "Manajemen";
    default:
      return "Pegawai BOE";
  }
}

function roleBadgeClass(role: UserRole) {
  switch (role) {
    case "super_admin":
      return "bg-purple-100 text-purple-700";
    case "manajemen":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function AdminUsersPage() {
  const [currentUser, setCurrentUser] =
    useState<LoggedInUser | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [processingId, setProcessingId] = useState<number | null>(
    null
  );

  const loadUsers = async (targetPage = page) => {
    const token = localStorage.getItem("wajah_smk_token");

    if (!token) {
      window.location.href = "/login?redirect=/admin/pengguna";
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        per_page: "20",
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (roleFilter) {
        params.set("role", roleFilter);
      }

      if (statusFilter) {
        params.set("status", statusFilter);
      }

      const response = await fetch(
        `${API_URL}/admin/users?${params.toString()}`,
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
        window.location.href = "/login?redirect=/admin/pengguna";
        return;
      }

      if (response.status === 403) {
        setError("Akses hanya untuk Super Admin.");
        return;
      }

      if (!response.ok) {
        throw new Error("Gagal mengambil data pengguna.");
      }

      const result: UsersResponse = await response.json();

      setUsers(result.data || []);
      setPage(result.current_page || targetPage);
      setLastPage(result.last_page || 1);
      setTotal(result.total || 0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data pengguna."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("wajah_smk_user");

      if (!rawUser) {
        window.location.href = "/login?redirect=/admin/pengguna";
        return;
      }

      const parsedUser: LoggedInUser = JSON.parse(rawUser);

      if (parsedUser.status !== "aktif") {
        localStorage.removeItem("wajah_smk_token");
        localStorage.removeItem("wajah_smk_user");
        window.location.href = "/login?redirect=/admin/pengguna";
        return;
      }

      if (parsedUser.must_change_password) {
        window.location.href =
          "/change-password?redirect=/admin/pengguna";
        return;
      }

      if (parsedUser.role !== "super_admin") {
        setCurrentUser(parsedUser);
        setError("Akses hanya untuk Super Admin.");
        setLoading(false);
        return;
      }

      setCurrentUser(parsedUser);
      loadUsers(1);
    } catch {
      localStorage.removeItem("wajah_smk_token");
      localStorage.removeItem("wajah_smk_user");
      window.location.href = "/login?redirect=/admin/pengguna";
    }
  }, []);

  const handleSearch = async () => {
    setPage(1);
    await loadUsers(1);
  };

  const handleToggleStatus = async (user: UserItem) => {
    if (user.id === currentUser?.id) {
      setError("Anda tidak dapat mengubah status akun sendiri.");
      return;
    }

    const confirmed = window.confirm(
      user.status === "aktif"
        ? `Nonaktifkan akun ${user.name}?`
        : `Aktifkan akun ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("wajah_smk_token");

    if (!token) {
      window.location.href = "/login?redirect=/admin/pengguna";
      return;
    }

    setProcessingId(user.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/admin/users/${user.id}/toggle-status`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengubah status akun."
        );
      }

      setMessage(result.message || "Status akun berhasil diperbarui.");
      await loadUsers(page);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengubah status akun."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleResetPassword = async (user: UserItem) => {
    const confirmed = window.confirm(
      `Reset password ${user.name} ke password awal 12345?`
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("wajah_smk_token");

    if (!token) {
      window.location.href = "/login?redirect=/admin/pengguna";
      return;
    }

    setProcessingId(user.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/admin/users/${user.id}/reset-password`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mereset password."
        );
      }

      setMessage(
        `${result.message || "Password berhasil direset."} Password awal: 12345.`
      );

      await loadUsers(page);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mereset password."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleChangeRole = async (
    user: UserItem,
    newRole: UserRole
  ) => {
    if (user.id === currentUser?.id) {
      setError("Anda tidak dapat mengubah role akun sendiri.");
      return;
    }

    if (user.role === newRole) {
      return;
    }

    const confirmed = window.confirm(
      `Ubah role ${user.name} menjadi ${roleLabel(newRole)}?`
    );

    if (!confirmed) {
      await loadUsers(page);
      return;
    }

    const token = localStorage.getItem("wajah_smk_token");

    if (!token) {
      window.location.href = "/login?redirect=/admin/pengguna";
      return;
    }

    setProcessingId(user.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/admin/users/${user.id}/role`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengubah role akun."
        );
      }

      setMessage(result.message || "Role akun berhasil diperbarui.");
      await loadUsers(page);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengubah role akun."
      );
      await loadUsers(page);
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = async () => {
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
    } catch {
      // Tetap hapus sesi lokal walaupun request logout gagal.
    }

    localStorage.removeItem("wajah_smk_token");
    localStorage.removeItem("wajah_smk_user");
    window.location.href = "/login";
  };

  if (!currentUser || currentUser.role !== "super_admin") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Akses Ditolak
          </h1>
          <p className="mt-3 text-slate-600">
            Halaman ini hanya dapat diakses oleh Super Admin.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <div className="text-sm font-semibold text-blue-700">
              WAJAH SMK
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Manajemen Pengguna
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Pengelolaan akun pegawai, role, status, dan password.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="hidden rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:inline-flex"
            >
              Dashboard Admin
            </Link>

            <Link
              href="/"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Beranda
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-4 md:grid-cols-[1fr_180px_160px_auto]">
            <div>
              <label
                htmlFor="search"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Cari
              </label>
              <input
                id="search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Nama atau NIP..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Role
              </label>
              <select
                id="role"
                value={roleFilter}
                onChange={(event) => {
                  setRoleFilter(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Semua Role</option>
                <option value="pegawai_boe">Pegawai BOE</option>
                <option value="manajemen">Manajemen</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSearch}
                className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Cari
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
            <div className="text-slate-600">
              Total pengguna:{" "}
              <span className="font-bold text-slate-900">
                {total}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setRoleFilter("");
                setStatusFilter("");
                setPage(1);
                setTimeout(() => loadUsers(1), 0);
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Reset filter
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Pegawai
                  </th>
                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Role
                  </th>
                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="px-5 py-4 font-semibold text-slate-600">
                    Password
                  </th>
                  <th className="px-5 py-4 text-right font-semibold text-slate-600">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Memuat data pengguna...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Tidak ada pengguna yang sesuai.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {user.name}
                        </div>
                        <div className="mt-1 font-mono text-xs text-slate-500">
                          {user.nip}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={user.role}
                          disabled={
                            processingId === user.id ||
                            user.id === currentUser.id
                          }
                          onChange={(event) =>
                            handleChangeRole(
                              user,
                              event.target.value as UserRole
                            )
                          }
                          className={`rounded-lg border-0 px-3 py-2 text-xs font-semibold ${roleBadgeClass(
                            user.role
                          )} disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          <option value="pegawai_boe">
                            Pegawai BOE
                          </option>
                          <option value="manajemen">
                            Manajemen
                          </option>
                          <option value="super_admin">
                            Super Admin
                          </option>
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            user.status === "aktif"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.status === "aktif"
                            ? "Aktif"
                            : "Nonaktif"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {user.must_change_password ? (
                          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            Wajib ganti
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">
                            Sudah diganti
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={
                              processingId === user.id
                            }
                            onClick={() =>
                              handleToggleStatus(user)
                            }
                            className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                              user.status === "aktif"
                                ? "border border-red-200 text-red-600 hover:bg-red-50"
                                : "border border-green-200 text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {user.status === "aktif"
                              ? "Nonaktifkan"
                              : "Aktifkan"}
                          </button>

                          <button
                            type="button"
                            disabled={
                              processingId === user.id
                            }
                            onClick={() =>
                              handleResetPassword(user)
                            }
                            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reset Password
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => loadUsers(page - 1)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Sebelumnya
            </button>

            <div className="text-sm text-slate-500">
              Halaman{" "}
              <span className="font-semibold text-slate-900">
                {page}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-slate-900">
                {lastPage}
              </span>
            </div>

            <button
              type="button"
              disabled={page >= lastPage || loading}
              onClick={() => loadUsers(page + 1)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya →
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
