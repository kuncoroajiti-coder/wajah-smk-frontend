"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

const menuItems = [
  { label: "Beranda", href: "/" },
  { label: "Sekolah", href: "/sekolah" },
  { label: "Ulasan", href: "/ulasan/daftar" },
  { label: "Tentang", href: "/tentang" },
];

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
        setUser(JSON.parse(savedUser) as User);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setUserLoaded(true);
    }
  }, []);

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

  const showReviewCta = pathname === "/ulasan/daftar";

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

        {/* Desktop Navigation */}
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
        </nav>

        {/* Desktop / User Actions */}
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
                  {user.email}
                </div>

                <div className="mt-0.5 text-xs text-blue-200">
                  {user.role === "admin" ? "Administrator" : "Pengguna"}
                </div>
              </div>

              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-200 text-sm font-extrabold text-blue-950 sm:h-10 sm:w-10"
                title={user.email}
              >
                {user.email.charAt(0).toUpperCase()}
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
            <>
              <Link
                href="/login"
                className="hidden rounded-xl border border-blue-200/70 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 sm:block sm:px-4 sm:py-2.5"
              >
                Masuk
              </Link>

              <Link
                href="/register"
                className="hidden rounded-xl bg-white px-3 py-2 text-sm font-semibold text-blue-950 transition hover:bg-blue-50 sm:block sm:px-4 sm:py-2.5"
              >
                Daftar
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
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

      {/* Mobile Navigation */}
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

              {showReviewCta && (
                <Link
                  href="/ulasan"
                  className="mt-2 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Beri Ulasan
                </Link>
              )}

              {!userLoaded ? null : user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 rounded-xl border border-blue-200/70 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Keluar dari akun
                </button>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="rounded-xl border border-blue-200/70 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Masuk
                  </Link>

                  <Link
                    href="/register"
                    className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-blue-950 transition hover:bg-blue-50"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}