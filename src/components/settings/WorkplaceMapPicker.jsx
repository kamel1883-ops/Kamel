import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// دبوس مخصّص (بدون الحاجة لصور leaflet الافتراضية)
const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:26px;height:26px;border-radius:50%;background:#0B2545;border:3px solid #E9C766;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

function Recenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], map.getZoom()); }, [lat, lng]);
  return null;
}

function ClickToSet({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

// خريطة تفاعلية لتحديد مقر العمل: دبوس على الموقع + دائرة نطاق البصمة.
// النقر على الخريطة أو سحب الدبوس يحدّث الإحداثيات.
export default function WorkplaceMapPicker({ lat, lng, radius = 50, onChange, hint }) {
  const hasPoint = lat !== "" && lng !== "" && lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng));
  const center = hasPoint ? [Number(lat), Number(lng)] : [24.7136, 46.6753]; // الرياض كمركز افتراضي

  const pick = (la, ln) => onChange(Number(la.toFixed(6)), Number(ln.toFixed(6)));

  return (
    <div className="space-y-2">
      <div className="h-72 rounded-xl overflow-hidden border border-input">
        <MapContainer center={center} zoom={hasPoint ? 17 : 12} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          <ClickToSet onPick={pick} />
          {hasPoint && (
            <>
              <Recenter lat={Number(lat)} lng={Number(lng)} />
              <Circle center={center} radius={Number(radius) || 50} pathOptions={{ color: "#0B2545", fillColor: "#E9C766", fillOpacity: 0.18, weight: 2 }} />
              <Marker
                position={center}
                icon={pinIcon}
                draggable
                eventHandlers={{ dragend: (e) => { const p = e.target.getLatLng(); pick(p.lat, p.lng); } }}
              />
            </>
          )}
        </MapContainer>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}