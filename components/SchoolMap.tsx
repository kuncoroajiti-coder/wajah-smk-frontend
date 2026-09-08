"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type SchoolMapProps = {
  latitude: number;
  longitude: number;
  schoolName: string;
};

const schoolIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function SchoolMap({
  latitude,
  longitude,
  schoolName,
}: SchoolMapProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <MapContainer
        center={[latitude, longitude]}
        zoom={16}
        scrollWheelZoom={false}
        className="h-[380px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[latitude, longitude]} icon={schoolIcon}>
          <Popup>{schoolName}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
