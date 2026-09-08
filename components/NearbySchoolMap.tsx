"use client";

import { useEffect } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type NearbySchool = {
  id: number;
  name: string;
  npsn: string;
  city: string | null;
  province: string | null;
  accreditation: string | null;
  latitude: string | number;
  longitude: string | number;
  distance_km: number;
};

type NearbySchoolMapProps = {
  latitude: number;
  longitude: number;
  schools: NearbySchool[];
  radiusKm?: number;
};

const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 20px;
      height: 20px;
      border-radius: 9999px;
      background: #2563eb;
      border: 4px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const schoolIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 30px;
      height: 30px;
      border-radius: 9999px;
      background: #f59e0b;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 15px;
      font-weight: 800;
    ">S</div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function MapViewController({
  latitude,
  longitude,
  schools,
}: {
  latitude: number;
  longitude: number;
  schools: NearbySchool[];
}) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [
      [latitude, longitude],
      ...schools.map((school) => [
        Number(school.latitude),
        Number(school.longitude),
      ] as [number, number]),
    ];

    if (points.length === 1) {
      map.setView(points[0], 13, { animate: true });
      return;
    }

    const bounds = L.latLngBounds(points);

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 15,
      animate: true,
    });
  }, [latitude, longitude, schools, map]);

  return null;
}

function formatDistance(distance: number) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }

  return `${distance.toFixed(1).replace(".", ",")} km`;
}

export default function NearbySchoolMap({
  latitude,
  longitude,
  schools,
  radiusKm = 25,
}: NearbySchoolMapProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-[420px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController
          latitude={latitude}
          longitude={longitude}
          schools={schools}
        />

        <Circle
          center={[latitude, longitude]}
          radius={radiusKm * 1000}
          pathOptions={{
            color: "#2563eb",
            fillColor: "#2563eb",
            fillOpacity: 0.05,
            weight: 1,
          }}
        />

        <Marker
          position={[latitude, longitude]}
          icon={userIcon}
        >
          <Popup>
            <strong>Lokasi Anda</strong>
            <br />
            Titik pencarian SMK terdekat.
          </Popup>
        </Marker>

        {schools.map((school) => {
          const schoolLatitude = Number(school.latitude);
          const schoolLongitude = Number(school.longitude);

          return (
            <Marker
              key={school.id}
              position={[schoolLatitude, schoolLongitude]}
              icon={schoolIcon}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <strong>{school.name.trim()}</strong>

                  <div className="mt-1 text-sm">
                    {formatDistance(Number(school.distance_km))}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {school.city ?? "-"}
                  </div>

                  <a
                    href={`/sekolah/${school.id}`}
                    className="mt-2 inline-block text-sm font-semibold text-blue-700"
                  >
                    Lihat profil →
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="flex flex-wrap items-center gap-5 border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-blue-600" />
          Lokasi Anda
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
            S
          </span>
          SMK
        </div>

        <span>Radius pencarian {radiusKm} km</span>
      </div>
    </div>
  );
}
