"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000/api";

type User = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

export default function UlasanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [schoolId, setSchoolId] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("school") || "";
    setSchoolId(id);

    try {
      const savedUser = localStorage.getItem("wajah_smk_user");

      if (savedUser) {
        const parsedUser: User = JSON.parse(savedUser);

        if (parsedUser && parsedUser.email) {
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.error("Gagal membaca data pengguna:", error);
      setUser(null);
    }
  }, []);

  function handlePhotoChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setMessage("");
    setMessageType("");

    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    if (photos.length + selectedFiles.length > 5) {
      setMessage("Maksimal 5 foto yang dapat diunggah.");
      setMessageType("error");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    const invalidFile = selectedFiles.find((file) => {
      const validType = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type);

      const validSize = file.size <= 5 * 1024 * 1024;

      return !validType || !validSize;
    });

    if (invalidFile) {
      setMessage(
        `Foto "${invalidFile.name}" harus berformat JPG, JPEG, PNG, atau WebP dan berukuran maksimal 5 MB.`
      );
      setMessageType("error");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setPhotos((currentPhotos) => [
      ...currentPhotos,
      ...selectedFiles,
    ]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removePhoto(index: number) {
    setPhotos((currentPhotos) =>
      currentPhotos.filter((_, photoIndex) => photoIndex !== index)
    );
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!schoolId) {
      setMessage(
        "Sekolah belum ditentukan. Silakan kembali ke profil sekolah dan pilih Beri Ulasan."
      );
      setMessageType("error");
      return;
    }

    const token = localStorage.getItem("wajah_smk_token");

    if (!token || !user) {
      setMessage(
        "Anda harus masuk terlebih dahulu untuk memberikan ulasan."
      );
      setMessageType("error");
      return;
    }

    if (content.trim().length < 10) {
      setMessage("Isi ulasan minimal 10 karakter.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("rating", String(rating));
      formData.append(
        "title",
        title.trim()
      );
      formData.append(
        "content",
        content.trim()
      );

      photos.forEach((photo) => {
        formData.append("photos[]", photo);
      });

      const response = await fetch(
        `${API_URL}/schools/${schoolId}/reviews`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("wajah_smk_token");
        localStorage.removeItem("wajah_smk_user");

        setUser(null);
        setMessage(
          "Sesi login Anda sudah tidak berlaku. Silakan masuk kembali."
        );
        setMessageType("error");

        return;
      }

      if (!response.ok) {
        if (data.errors) {
          const firstError = Object.values(data.errors)
            .flat()
            .find(
              (error): error is string =>
                typeof error === "string"
            );

          setMessage(
            firstError ||
              data.message ||
              "Ulasan tidak dapat dikirim."
          );
        } else {
          setMessage(
            data.message ||
              "Ulasan tidak dapat dikirim."
          );
        }

        setMessageType("error");
        return;
      }

      setMessage(
        "Ulasan berhasil dikirim dan sedang menunggu pemeriksaan administrator."
      );
      setMessageType("success");

      setTitle("");
      setContent("");
      setRating(5);
      setPhotos([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setTimeout(() => {
        router.push(`/sekolah/${schoolId}`);
      }, 1800);
    } catch (error) {
      console.error("Gagal mengirim ulasan:", error);

      setMessage(
        "Tidak dapat terhubung ke server Laravel."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-[#123B73] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-2xl font-bold">
              WAJAH{" "}
              <span className="text-blue-300">
                SMK
              </span>
            </div>

            <div className="text-sm text-blue-200">
              Platform Informasi & Ulasan SMK Indonesia
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-semibold hover:text-blue-200"
          >
            ← Kembali
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <div className="text-sm font-bold uppercase tracking-wide text-blue-600">
              Bagikan Pengalaman
            </div>

            <h1 className="mt-2 text-3xl font-bold text-[#123B73]">
              Beri Ulasan Sekolah
            </h1>

            <p className="mt-3 text-slate-500">
              Bagikan pengalaman Anda secara jujur dan
              konstruktif untuk membantu masyarakat mengenal
              sekolah tersebut.
            </p>

            {user && (
              <div className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
                Anda memberikan ulasan sebagai{" "}
                <strong>{user.email}</strong>
              </div>
            )}
          </div>

          {message && (
            <div
              className={`mb-6 rounded-xl px-4 py-3 text-sm ${
                messageType === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Rating
              </label>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`text-3xl transition ${
                      value <= rating
                        ? "text-yellow-400"
                        : "text-slate-300"
                    }`}
                    aria-label={`Rating ${value}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div className="mt-1 text-sm text-slate-500">
                Rating: {rating} dari 5
              </div>
            </div>

            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Judul Ulasan
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Contoh: Sekolah dengan fasilitas yang baik"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Isi Ulasan
              </label>

              <textarea
                id="content"
                value={content}
                onChange={(e) =>
                  setContent(e.target.value)
                }
                placeholder="Ceritakan pengalaman Anda tentang sekolah ini..."
                rows={7}
                required
                minLength={10}
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <div className="mt-1 text-xs text-slate-400">
                Minimal 10 karakter.
              </div>
            </div>

            <div>
              <label
                htmlFor="photos"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Foto Pendukung
              </label>

              <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5">
                <input
                  ref={fileInputRef}
                  id="photos"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handlePhotoChange}
                  disabled={photos.length >= 5 || loading}
                  className="block w-full cursor-pointer text-sm text-slate-600"
                />

                <div className="mt-2 text-xs text-slate-500">
                  Maksimal 5 foto. Format JPG, JPEG, PNG, atau
                  WebP. Maksimal 5 MB per foto.
                </div>
              </div>

              {photos.length > 0 && (
                <div className="mt-4">
                  <div className="mb-3 text-sm font-semibold text-slate-700">
                    Foto dipilih ({photos.length}/5)
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {photos.map((photo, index) => (
                      <div
                        key={`${photo.name}-${photo.size}-${index}`}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                      >
                        <div className="aspect-square bg-slate-100">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Preview foto ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="p-2">
                          <div
                            className="truncate text-xs text-slate-600"
                            title={photo.name}
                          >
                            {photo.name}
                          </div>

                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            disabled={loading}
                            className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            Hapus foto
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
              Ulasan akan diperiksa terlebih dahulu oleh
              administrator sebelum ditampilkan secara publik.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 px-6 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Mengirim Ulasan..."
                : "Kirim Ulasan"}
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-slate-950 px-6 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="font-bold">
            WAJAH SMK
          </div>

          <div className="mt-1 text-sm text-slate-400">
            Platform informasi dan ulasan SMK Indonesia.
          </div>
        </div>
      </footer>
    </main>
  );
}