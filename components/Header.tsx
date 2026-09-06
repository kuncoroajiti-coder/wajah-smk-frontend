"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type UserRole = "pegawai_boe" | "manajemen" | "super_admin";

type User = {
  id: number;
  name: string;
  nip: string;
  role: UserRole;
  status: "aktif" | "nonaktif";
  must_change_password: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const menuItems = [
  { label: "Beranda", href: "/" },
  { label: "Sekolah", href: "/sekolah" },
  { label: "Ulasan", href: "/ulasan/daftar" },
  { label: "Tentang", href: "/tentang" },
];

function roleLabel(role?: UserRole) {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "manajemen":
      return "Manajemen";
    case "pegawai_boe":
      return "Pegawai BOE";
    default:
      return "Pegawai";
  }
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("wajah_smk_user");

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser) as User;

        setUser(parsedUser);

        if (
          parsedUser.must_change_password &&
          pathname !== "/change-password"
        ) {
          router.replace("/change-password");
        }
      } else {
        setUser(null);
      }
    } catch {
      localStorage.removeItem("wajah_smk_user");
      setUser(null);
    } finally {
      setUserLoaded(true);
    }
  }, [pathname, router]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const token = localStorage.getItem("wajah_smk_token");

    try {
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      }
    } catch {
      // Sesi lokal tetap dibersihkan jika API logout gagal.
    } finally {
      localStorage.removeItem("wajah_smk_token");
      localStorage.removeItem("wajah_smk_user");

      setUser(null);
      setMobileMenuOpen(false);

      router.push("/");
      router.refresh();
    }
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isForcedPasswordChange =
    user?.must_change_password && pathname === "/change-password";

  const showReviewCta =
    !!user &&
    !user.must_change_password &&
    pathname === "/ulasan/daftar";

  const showEmployeeActions =
    !!user && !user.must_change_password;

  const showManagement =
    showEmployeeActions &&
    (user?.role === "manajemen" || user?.role === "super_admin");

  const showAdmin =
    showEmployeeActions &&
    user?.role === "super_admin";

  const displayInitial =
    user?.name?.trim().charAt(0).toUpperCase() || "P";

  return (
    <header className="bg-blue-950 text-white">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:min-h-[80px] lg:px-8">
        <Link href="/" className="min-w-0 shrink">
          <div className="text-lg font-bold tracking-tight sm:text-xl">
            WAJAH <span className="text-blue-300">SMK</span>
          </div>

          <div className="mt-0.5 hidden text-xs font-medium text-blue-200 sm:block">
            Platform Informasi &amp; Ulasan SMK Indonesia
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {menuItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b-2 py-2 text-sm font-medium transition ${
                  active
                    ? "border-blue-300 text-white"
                    : "border-transparent text-blue-100 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {showManagement && (
            <Link
              href="/manajemen"
              className={`border-b-2 py-2 text-sm font-medium transition ${
                isActive("/manajemen")
                  ? "border-blue-300 text-white"
                  : "border-transparent text-blue-100 hover:text-white"
              }`}
            >
              Manajemen
            </Link>
          )}

          {showAdmin && (
            <Link
              href="/admin"
              className={`border-b-2 py-2 text-sm font-medium transition ${
                isActive("/admin")
                  ? "border-blue-300 text-white"
                  : "border-transparent text-blue-100 hover:text-white"
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {showReviewCta && (
            <Link
              href="/ulasan"
              className="hidden rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 lg:block"
            >
              Beri Ulasan
            </Link>
          )}

          {!userLoaded ? (
            <div className="h-10 w-10 shrink-0" />
          ) : user ? (
            <>
              <div className="hidden text-right sm:block">
                <div className="max-w-[220px] truncate text-sm font-bold leading-tight text-white">
                  {user.name}
                </div>

                <div className="mt-0.5 text-xs text-blue-200">
                  {user.nip} · {roleLabel(user.role)}
                </div>
              </div>

              <Link
                href="/change-password"
                className="hidden rounded-xl border border-blue-200/70 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 lg:block"
              >
                Ganti Password
              </Link>

              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-200 text-sm font-extrabold text-blue-950 sm:h-10 sm:w-10"
                title={`${user.name} — ${roleLabel(user.role)}`}
              >
                {displayInitial}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-xl border border-blue-200/70 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 sm:block sm:px-4 sm:py-2.5"
              >
                Keluar
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-xl border border-blue-200/70 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 sm:block sm:px-4 sm:py-2.5"
            >
              Masuk
            </Link>
          )}

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200/70 text-white transition hover:bg-white/10 md:hidden"
          >
            <span className="text-xl leading-none">
              {mobileMenuOpen ? "×" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-blue-900 bg-blue-950 md:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <div className="flex flex-col">
              {menuItems.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-blue-900 text-white"
                        : "text-blue-100 hover:bg-blue-900 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {showEmployeeActions && (
                <>
                  <Link
                    href="/ulasan"
                    className="mt-2 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    Beri Ulasan
                  </Link>

                  <Link
                    href="/my-reviews"
                    className="mt-2 rounded-xl border border-blue-200/70 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Riwayat Ulasan
                  </Link>
                </>
              )}

              {showManagement && (
                <Link
                  href="/manajemen"
                  className={`mt-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                    isActive("/manajemen")
                      ? "bg-blue-900 text-white"
                      : "text-blue-100 hover:bg-blue-900 hover:text-white"
                  }`}
                >
                  Dashboard Manajemen
                </Link>
              )}

              {showAdmin && (
                <>
                  <Link
                    href="/admin"
                    className={`mt-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                      isActive("/admin")
                        ? "bg-blue-900 text-white"
                        : "text-blue-100 hover:bg-blue-900 hover:text-white"
                    }`}
                  >
                    Dashboard Admin
                  </Link>

                  <Link
                    href="/admin/sekolah"
                    className={`mt-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                      isActive("/admin/sekolah")
                        ? "bg-blue-900 text-white"
                        : "text-blue-100 hover:bg-blue-900 hover:text-white"
                    }`}
                  >
                    Kelola Sekolah
                  </Link>
                </>
              )}

              {user && (
                <>
                  <div className="mt-3 rounded-xl bg-blue-900/60 px-4 py-3">
                    <div className="text-sm font-bold text-white">
                      {user.name}
                    </div>

                    <div className="mt-1 text-xs text-blue-200">
                      {user.nip} · {roleLabel(user.role)}
                    </div>
                  </div>

                  {!isForcedPasswordChange && (
                    <Link
                      href="/change-password"
                      className="mt-2 rounded-xl border border-blue-200/70 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      Ganti Password
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 rounded-xl border border-blue-200/70 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Keluar dari akun
                  </button>
                </>
              )}

              {!user && (
                <Link
                  href="/login"
                  className="mt-2 rounded-xl border border-blue-200/70 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Masuk
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
