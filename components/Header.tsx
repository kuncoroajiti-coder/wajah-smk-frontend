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

  return (
    <header className="bg-blue-950 text-white">
      <div className="mx-auto flex min-h-[80px] max-w-7xl items-center justify-between gap-6 px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <div className="text-xl font-bold tracking-tight">
            WAJAH <span className="text-blue-300">SMK</span>
          </div>

          <div className="mt-0.5 text-xs font-medium text-blue-200">
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
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {!userLoaded ? (
            <div className="h-10 w-10 shrink-0" />
          ) : user ? (
            <>
              <div className="hidden text-right sm:block">
                <div className="whitespace-nowrap text-sm font-bold leading-tight text-white">
                  {user.email}
                </div>

                <div className="mt-0.5 text-xs text-blue-200">
                  {user.role === "admin" ? "Administrator" : "Pengguna"}
                </div>
              </div>

              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-200 text-sm font-extrabold text-blue-950"
                title={user.email}
              >
                {user.email.charAt(0).toUpperCase()}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-blue-200/70 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl border border-blue-200/70 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Masuk
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-950 transition hover:bg-blue-50"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
